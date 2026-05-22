from django.db.models import Q, F
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .llm_identifier import create_or_update_plant_from_llm
from .ml_models import predict_plant, logger
from .models import Plant, PlantImage, PlantFavourite, PlantComment
from .permissions import IsOwnerOrAdminOrReadOnly
from .serializers import (PlantSerializer, PlantDetailSerializer, PlantCommentSerializer)
from .llm_recomend import get_plant_recommendation_from_llm

class PlantPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

class PlantFavouriteViewSet(viewsets.ModelViewSet):
    """
    API endpoint to toggle plant favourites.
    GET: list user's favourites
    POST: add a plant to favourites (provide plant ID)
    DELETE: remove from favourites (by favourite ID)
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PlantDetailSerializer  # برای نمایش اطلاعات گیاه

    def get_queryset(self):
        # فقط گیاهانی که کاربر جاری علاقه‌مند کرده است
        user = self.request.user
        return Plant.objects.filter(favourites__user=user).distinct()

    def create(self, request, *args, **kwargs):
        plant_id = request.data.get('plant')
        if not plant_id:
            return Response({'error': 'plant ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            plant = Plant.objects.get(pk=plant_id)
        except Plant.DoesNotExist:
            return Response({'error': 'Plant not found'}, status=status.HTTP_404_NOT_FOUND)

        fav, created = PlantFavourite.objects.get_or_create(user=request.user, plant=plant)
        if not created:
            return Response({'detail': 'Already in favourites'}, status=status.HTTP_200_OK)
        serializer = self.get_serializer(plant)  # برگرداندن جزئیات گیاه
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['delete', 'post'], url_path='remove')
    def remove_favourite(self, request):
        """Remove a plant from favourites (provide plant ID)."""
        plant_id = request.data.get('plant')
        if not plant_id:
            return Response({'error': 'plant ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        deleted, _ = PlantFavourite.objects.filter(user=request.user, plant_id=plant_id).delete()
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'error': 'Favourite not found'}, status=status.HTTP_404_NOT_FOUND)


class PlantCommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for comments on a plant.
    URL: /api/plants/{plant_pk}/comments/
    """
    serializer_class = PlantCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdminOrReadOnly]

    def get_queryset(self):
        plant_id = self.kwargs.get('plant_pk')
        return PlantComment.objects.filter(plant_id=plant_id, is_approved=True).select_related('user')

    def perform_create(self, serializer):
        plant = Plant.objects.get(pk=self.kwargs['plant_pk'])
        serializer.save(user=self.request.user, plant=plant)

    def perform_update(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        # اجازه حذف فقط به نویسنده یا ادمین
        if comment.user != request.user and not request.user.is_staff:
            return Response({'error': 'You do not have permission to delete this comment.'},
                            status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)



class PlantViewSet(viewsets.ModelViewSet):
    """
    API endpoint for plants.
    Supports searching by 'farsi_name', 'scientific_name', and now English fields.
    When creating a plant (POST), you can optionally send an 'image' file;
    it will be added to the plant's image list and set as primary for display on the site.
    """
    queryset = Plant.objects.all()
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    pagination_class = PlantPagination

    search_fields = [
        'farsi_name', 'scientific_name', 'description',
        'english_name', 'description_en',
        'watering_frequency_en', 'light_requirements_en',
        'fertilizer_schedule_en', 'temperature_range_en',
        'humidity_level_en', 'soil_type_en', 'pruning_info_en',
        'propagation_methods_en'
    ]

    ordering_fields = [
        'farsi_name', 'scientific_name', 'created_at',
        'view_count', 'garden_count', 'favourite_count'  # ← جدید
    ]


    ordering = ['-created_at']

    filterset_fields = ['is_toxic', 'care_difficulty']

    @action(detail=True, methods=['get'], url_path='related', permission_classes=[AllowAny])
    def related(self, request, pk=None):
        plant = self.get_object()
        related_plants = Plant.objects.filter(
            care_difficulty=plant.care_difficulty
        ).exclude(pk=plant.pk).order_by('-view_count')[:4]
        serializer = PlantSerializer(related_plants, many=True, context={'request': request})
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PlantDetailSerializer
        elif self.action == 'retrieve':
            return PlantDetailSerializer
        return PlantSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.view_count = F('view_count') + 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """Create a plant; if 'image' is uploaded, add it to the plant's image list as primary."""
        image_file = request.FILES.get('image')
        data = request.data.copy() if hasattr(request.data, 'copy') else request.data
        if hasattr(data, 'pop'):
            data.pop('image', None)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        if image_file:
            PlantImage.objects.create(
                plant=serializer.instance,
                image=image_file,
                is_primary=True,
                caption="Uploaded when adding plant"
            )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        def filter_bilingual(field_name, value):
            return Q(**{f"{field_name}__iexact": value}) | Q(**{f"{field_name}_en__iexact": value})

        if params.get('watering_frequency'):
            queryset = queryset.filter(filter_bilingual('watering_frequency', params['watering_frequency']))
        if params.get('fertilizer_schedule'):
            queryset = queryset.filter(filter_bilingual('fertilizer_schedule', params['fertilizer_schedule']))
        if params.get('light_requirements'):
            queryset = queryset.filter(filter_bilingual('light_requirements', params['light_requirements']))
        if params.get('humidity_level'):
            queryset = queryset.filter(filter_bilingual('humidity_level', params['humidity_level']))
        if params.get('temperature_range'):
            queryset = queryset.filter(filter_bilingual('temperature_range', params['temperature_range']))
        if params.get('soil_type'):
            queryset = queryset.filter(filter_bilingual('soil_type', params['soil_type']))
        if params.get('pruning_info'):
            queryset = queryset.filter(filter_bilingual('pruning_info', params['pruning_info']))
        if params.get('propagation_methods'):
            queryset = queryset.filter(filter_bilingual('propagation_methods', params['propagation_methods']))
        if params.get('care_difficulty'):
            queryset = queryset.filter(care_difficulty=params['care_difficulty'])
        if params.get('is_toxic') is not None:
            is_toxic = params['is_toxic'].lower() == 'true'
            queryset = queryset.filter(is_toxic=is_toxic)

        return queryset.distinct()


class PlantIdentifyView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        if 'image' not in request.data:
            return Response({'error': 'Image file not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.data['image']
        prediction_result = predict_plant(image_file)

        plant_id = prediction_result.get('id')
        scientific_name = prediction_result.get('scientific_name')
        common_name = prediction_result.get('common_name')
        error_msg = prediction_result.get('error')
        predicted_name = prediction_result.get('name')

        if plant_id is not None:
            try:
                plant = Plant.objects.get(id=plant_id)
                PlantImage.objects.create(
                    plant=plant,
                    image=image_file,
                    is_primary=False,
                    caption="Uploaded by user for identification"
                )
                serializer = PlantDetailSerializer(plant, context={'request': request})
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Plant.DoesNotExist:
                logger.warning(f"Plant with id {plant_id} not found, will create new.")

        plant_name_to_use = scientific_name or common_name or predicted_name

        if plant_name_to_use:
            plant = create_or_update_plant_from_llm(plant_name_to_use)
            if plant:
                PlantImage.objects.create(
                    plant=plant,
                    image=image_file,
                    is_primary=True,
                    caption="Primary image from user upload"
                )
                serializer = PlantDetailSerializer(plant, context={'request': request})
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Plant name detected but could not create/update in database.'},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if error_msg:
            return Response({'error': error_msg}, status=status.HTTP_404_NOT_FOUND)

        return Response({'error': 'Could not identify the plant.'}, status=status.HTTP_404_NOT_FOUND)


class PlantSearchView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):
        search = request.query_params.get('search', '')
        is_toxic = request.query_params.get('is_toxic', None)
        care_difficulty = request.query_params.get('care_difficulty', None)
        light_requirement = request.query_params.get('light_requirement', None)

        plants = Plant.objects.all()

        if search:
            plants = plants.filter(
                Q(farsi_name__icontains=search) |
                Q(english_name__icontains=search) |
                Q(scientific_name__icontains=search) |
                Q(description__icontains=search) |
                Q(description_en__icontains=search) |
                Q(watering_frequency_en__icontains=search) |
                Q(light_requirements_en__icontains=search) |
                Q(fertilizer_schedule_en__icontains=search) |
                Q(temperature_range_en__icontains=search) |
                Q(humidity_level_en__icontains=search) |
                Q(soil_type_en__icontains=search) |
                Q(pruning_info_en__icontains=search) |
                Q(propagation_methods_en__icontains=search)
            )

        if is_toxic is not None:
            plants = plants.filter(is_toxic=is_toxic.lower() == 'true')

        if care_difficulty:
            plants = plants.filter(care_difficulty=care_difficulty)

        if light_requirement:
            # جستجو در فیلد فارسی و انگلیسی
            plants = plants.filter(
                Q(light_requirements__icontains=light_requirement) |
                Q(light_requirements_en__icontains=light_requirement)
            )

        serializer = PlantSerializer(plants, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



class PlantRecommenderView(APIView):
    """
    دریافت پاسخ‌های کاربر و بازگرداندن پیشنهاد گیاه
    """
    permission_classes = [AllowAny]  # یا [IsAuthenticated] در صورت نیاز
    parser_classes = [JSONParser]

    def post(self, request):
        language = request.data.get('language', 'en')
        answers = request.data.get('answers', {})
        additional_notes = request.data.get('additional_notes', '')

        if not answers:
            return Response({'error': 'Answers are required'}, status=status.HTTP_400_BAD_REQUEST)

        # دریافت پیشنهاد از LLM
        recommendation = get_plant_recommendation_from_llm(answers, language, additional_notes)
        if not recommendation:
            return Response({'error': 'Could not generate recommendation'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # استخراج نام گیاه (اولویت با فارسی یا انگلیسی)
        plant_name_fa = recommendation.get('plant_name_fa', '')
        plant_name_en = recommendation.get('plant_name_en', '')
        scientific_name = recommendation.get('scientific_name', '')
        reason = recommendation.get('reason_en' if language == 'en' else 'reason_fa', '')

        # جستجو در دیتابیس
        plant = None
        if plant_name_fa:
            plant = Plant.objects.filter(farsi_name__iexact=plant_name_fa).first()
        if not plant and plant_name_en:
            plant = Plant.objects.filter(english_name__iexact=plant_name_en).first()
        if not plant and scientific_name:
            plant = Plant.objects.filter(scientific_name__iexact=scientific_name).first()

        # اگر گیاه وجود نداشت، آن را با LLM ایجاد کن
        if not plant:
            # از نام فارسی یا انگلیسی استفاده کن
            search_name = plant_name_fa or plant_name_en
            if search_name:
                plant = create_or_update_plant_from_llm(search_name)
            if not plant:
                return Response({'error': 'Plant could not be created'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # بازگرداندن اطلاعات به فرانت‌اند
        serializer = PlantDetailSerializer(plant, context={'request': request})
        plant_data = serializer.data

        response_data = {
            'plant_id': plant.id,
            'plant_name': plant_data.get('farsi_name') if language == 'fa' else (plant_data.get('english_name') or plant_data.get('farsi_name')),
            'scientific_name': plant.scientific_name,
            'description': plant_data.get('description') if language == 'fa' else plant_data.get('description_en'),
            'primary_image': plant_data.get('primary_image'),
            'reason': reason,
        }
        return Response(response_data, status=status.HTTP_200_OK)