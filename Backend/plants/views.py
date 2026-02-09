from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Plant, PlantImage
from .serializers import PlantSerializer, PlantDetailSerializer, PlantImageSerializer
from .ml_models import predict_plant
from .llm_identifier import create_or_update_plant_from_llm


class PlantViewSet(viewsets.ModelViewSet):
    """
    API endpoint for plants.
    Supports searching by 'farsi_name' and 'scientific_name'.
    When creating a plant (POST), you can optionally send an 'image' file;
    it will be added to the plant's image list and set as primary for display on the site.
    """
    queryset = Plant.objects.all()
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['farsi_name', 'scientific_name', 'description']
    ordering_fields = ['farsi_name', 'scientific_name', 'created_at']
    ordering = ['-created_at']

    # Add filtering capabilities
    filterset_fields = ['is_toxic', 'care_difficulty']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PlantDetailSerializer
        elif self.action == 'retrieve':
            return PlantDetailSerializer
        return PlantSerializer

    def create(self, request, *args, **kwargs):
        """Create a plant; if 'image' is uploaded, add it to the plant's image list as primary."""
        image_file = request.FILES.get('image')
        data = request.data.copy() if hasattr(request.data, 'copy') else request.data
        if hasattr(data, 'pop'):
            data.pop('image', None)  # Don't pass to Plant serializer
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


class PlantIdentifyView(APIView):
    """
    API view for identifying a plant from an uploaded image.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        if 'image' not in request.data:
            return Response({'error': 'Image file not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.data['image']

        # Call the ML model
        prediction_result = predict_plant(image_file)
        plant_id = prediction_result.get('id')
        predicted_plant_name = prediction_result.get('name')

        if plant_id is not None:
            # If we found a plant in the database, return it
            try:
                plant = Plant.objects.get(id=plant_id)

                # Create a PlantImage entry for the uploaded image
                PlantImage.objects.create(
                    plant=plant,
                    image=image_file,
                    is_primary=False,  # Don't set as primary automatically
                    caption="Uploaded by user for identification"
                )

                serializer = PlantDetailSerializer(plant, context={'request': request})
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Plant.DoesNotExist:
                pass  # Continue to LLM processing if plant not found in DB

        # If we have a predicted plant name but no matching plant in DB, use LLM to create/update
        if predicted_plant_name:
            # Use LLM to get detailed plant information and create/update in DB
            plant = create_or_update_plant_from_llm(predicted_plant_name)
            if plant:
                # Create a PlantImage entry for the uploaded image
                PlantImage.objects.create(
                    plant=plant,
                    image=image_file,
                    is_primary=True,  # Set as primary for new plants
                    caption="Primary image from user upload"
                )

                serializer = PlantDetailSerializer(plant, context={'request': request})
                return Response(serializer.data, status=status.HTTP_200_OK)

        # If we still couldn't identify the plant, return an error
        return Response({'error': 'Could not identify the plant.'}, status=status.HTTP_404_NOT_FOUND)


class PlantSearchView(APIView):
    """
    Advanced search API view for plants with multiple filter options.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # Get query parameters
        search = request.query_params.get('search', '')
        is_toxic = request.query_params.get('is_toxic', None)
        care_difficulty = request.query_params.get('care_difficulty', None)
        light_requirement = request.query_params.get('light_requirement', None)

        # Start with all plants
        plants = Plant.objects.all()

        # Apply search filter
        if search:
            plants = plants.filter(
                Q(farsi_name__icontains=search) |
                Q(scientific_name__icontains=search) |
                Q(description__icontains=search)
            )

        # Apply toxicity filter
        if is_toxic is not None:
            plants = plants.filter(is_toxic=is_toxic.lower() == 'true')

        # Apply care difficulty filter
        if care_difficulty:
            plants = plants.filter(care_difficulty=care_difficulty)

        # Apply light requirement filter
        if light_requirement:
            plants = plants.filter(light_requirements__icontains=light_requirement)

        # Serialize and return results
        serializer = PlantSerializer(plants, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)