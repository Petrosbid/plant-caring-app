from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Disease
from .serializers import DiseaseSerializer, DiseaseDetailSerializer
from .ml_models import predict_disease


class DiseaseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only API endpoint for diseases.
    """
    queryset = Disease.objects.all()
    serializer_class = DiseaseSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['name', 'description', 'symptoms']
    ordering_fields = ['name', 'severity_level', 'created_at']
    ordering = ['-created_at']

    # Add filtering capabilities
    filterset_fields = ['severity_level', 'spread_rate']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DiseaseDetailSerializer
        return DiseaseSerializer


class DiseaseDiagnoseView(APIView):
    """
    API view for diagnosing a plant disease from an uploaded image.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        if 'image' not in request.data:
            return Response({'error': 'Image file not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.data['image']

        # Call the ML model
        prediction_result = predict_disease(image_file)
        disease_id = prediction_result.get('id')
        disease_name = prediction_result.get('name')
        disease_details = prediction_result.get('details')
        confidence = prediction_result.get('confidence')

        if disease_id is None:
            return Response({'error': 'Could not diagnose the disease.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Try to get the disease from the database
            disease = Disease.objects.get(id=disease_id)
            # Serialize the basic disease info
            serializer = DiseaseDetailSerializer(disease)
            disease_data = serializer.data

            # Add the detailed information from the LLM
            if disease_details:
                disease_data['llm_analysis'] = disease_details
            if confidence:
                disease_data['confidence'] = confidence
            if disease_name:
                disease_data['detected_name'] = disease_name

            return Response(disease_data, status=status.HTTP_200_OK)
        except Disease.DoesNotExist:
            # If disease not found in DB, return the LLM analysis with minimal info
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
                    'updated_at': None
                }
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                return Response({'error': f'Disease with ID {disease_id} not found in the database.'}, status=status.HTTP_404_NOT_FOUND)


class DiseaseSearchView(APIView):
    """
    Advanced search API view for diseases with multiple filter options.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # Get query parameters
        search = request.query_params.get('search', '')
        severity_level = request.query_params.get('severity_level', None)
        spread_rate = request.query_params.get('spread_rate', None)

        # Start with all diseases
        diseases = Disease.objects.all()

        # Apply search filter
        if search:
            diseases = diseases.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(symptoms__icontains=search) |
                Q(solution__icontains=search)
            )

        # Apply severity level filter
        if severity_level:
            diseases = diseases.filter(severity_level=severity_level)

        # Apply spread rate filter
        if spread_rate:
            diseases = diseases.filter(spread_rate=spread_rate)

        # Serialize and return results
        serializer = DiseaseSerializer(diseases, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)