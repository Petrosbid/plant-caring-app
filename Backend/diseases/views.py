from rest_framework import viewsets, status, filters, mixins
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, F
from rest_framework.pagination import PageNumberPagination

from .llm_diseas import get_disease_details_from_llm
from .models import Disease, DiseaseComment
from .serializers import DiseaseSerializer, DiseaseDetailSerializer, DiseaseCommentSerializer
from .ml_models import predict_disease

class DiseasePagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50


class DiseaseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Disease.objects.all()
    serializer_class = DiseaseSerializer
    permission_classes = [AllowAny]
    pagination_class = DiseasePagination   # اضافه شد
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = [
        'name', 'name_fa', 'description', 'description_fa',
        'symptoms', 'symptoms_fa', 'solution', 'solution_fa',
        'prevention_methods', 'prevention_methods_fa', 'affected_plants_list'
    ]
    ordering_fields = ['name', 'name_fa', 'severity_level', 'created_at', 'view_count', 'comment_count']
    ordering = ['-created_at']
    filterset_fields = ['severity_level', 'spread_rate']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DiseaseDetailSerializer
        return DiseaseSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Disease.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        data = serializer.data

        if request.query_params.get('include_llm', 'false').lower() == 'true':
            llm_data = get_disease_details_from_llm(instance.name)
            if llm_data:
                data['llm_analysis'] = llm_data

        return Response(data)

    @action(detail=True, methods=['get'], url_path='comments')
    def get_comments(self, request, pk=None):
        disease = self.get_object()
        comments = disease.comments.filter(parent=None, is_approved=True)
        serializer = DiseaseCommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)

class DiseaseDiagnoseView(APIView):
    """
    API view for diagnosing a plant disease from an uploaded image.
    Returns bilingual disease data along with LLM analysis.
    """
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        if 'image' not in request.data:
            return Response({'error': 'Image file not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.data['image']
        prediction_result = predict_disease(image_file)
        disease_id = prediction_result.get('id')
        disease_name = prediction_result.get('name')
        disease_details = prediction_result.get('details')
        confidence = prediction_result.get('confidence')

        if disease_id is None:
            return Response({'error': 'Could not diagnose the disease.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            disease = Disease.objects.get(id=disease_id)
            serializer = DiseaseDetailSerializer(disease)
            disease_data = serializer.data

            # Add LLM analysis (which is now bilingual)
            if disease_details:
                disease_data['llm_analysis'] = disease_details
            if confidence:
                disease_data['confidence'] = confidence
            if disease_name:
                disease_data['detected_name'] = disease_name

            return Response(disease_data, status=status.HTTP_200_OK)

        except Disease.DoesNotExist:
            # If disease not in DB, return minimal info with LLM analysis
            if disease_details:
                response_data = {
                    'id': disease_id,
                    'name': disease_name,
                    'llm_analysis': disease_details,
                    'confidence': confidence,
                    'description': disease_details.get('description', ''),
                    'symptoms': '',
                    'solution': '',
                    'prevention_methods': disease_details.get('prevention', []),
                    'severity_level': disease_details.get('severity', 'unknown'),
                    'spread_rate': 'unknown',
                    'affected_plants': [],
                    'created_at': None,
                    'updated_at': None,
                }
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                return Response({'error': f'Disease with ID {disease_id} not found in the database.'}, status=status.HTTP_404_NOT_FOUND)


class DiseaseSearchView(APIView):
    """
    Advanced search API view for diseases with bilingual filters.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        search = request.query_params.get('search', '')
        severity_level = request.query_params.get('severity_level', None)
        spread_rate = request.query_params.get('spread_rate', None)

        diseases = Disease.objects.all()

        if search:
            diseases = diseases.filter(
                Q(name__icontains=search) |
                Q(name_fa__icontains=search) |
                Q(description__icontains=search) |
                Q(description_fa__icontains=search) |
                Q(symptoms__icontains=search) |
                Q(symptoms_fa__icontains=search) |
                Q(solution__icontains=search) |
                Q(solution_fa__icontains=search) |
                Q(prevention_methods__icontains=search) |
                Q(prevention_methods_fa__icontains=search)
            )

        if severity_level:
            diseases = diseases.filter(severity_level=severity_level)

        if spread_rate:
            diseases = diseases.filter(spread_rate=spread_rate)

        serializer = DiseaseSerializer(diseases, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DiseaseCommentViewSet(mixins.CreateModelMixin,
                            mixins.UpdateModelMixin,
                            mixins.DestroyModelMixin,
                            viewsets.GenericViewSet):
    """ViewSet for comments on a disease."""
    serializer_class = DiseaseCommentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        disease_id = self.kwargs.get('disease_pk')
        return DiseaseComment.objects.filter(disease_id=disease_id, is_approved=True)

    def perform_create(self, serializer):
        disease = Disease.objects.get(pk=self.kwargs['disease_pk'])
        comment = serializer.save(user=self.request.user, disease=disease)
        # افزایش تعداد کامنت‌ها
        Disease.objects.filter(pk=disease.pk).update(comment_count=F('comment_count') + 1)

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        disease_id = comment.disease.id
        response = super().destroy(request, *args, **kwargs)
        Disease.objects.filter(pk=disease_id).update(comment_count=F('comment_count') - 1)
        return response


class DiseaseFromLLMView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        name = request.query_params.get('name')
        if not name:
            return Response({'error': 'name required'}, status=400)
        data = get_disease_details_from_llm(name)
        if not data:
            return Response({'error': 'LLM failed'}, status=500)
        return Response(data)
