from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DiseaseViewSet, DiseaseDiagnoseView, DiseaseSearchView, DiseaseCommentViewSet, DiseaseFromLLMView
from rest_framework_nested import routers

router = DefaultRouter()
router.register(r'', DiseaseViewSet, basename='disease')

diseases_router = routers.NestedSimpleRouter(router, r'', lookup='disease')
diseases_router.register(r'comments', DiseaseCommentViewSet, basename='disease-comments')

urlpatterns = [
    path('diagnose/', DiseaseDiagnoseView.as_view(), name='disease-diagnose'),
    path('search/', DiseaseSearchView.as_view(), name='disease-search'),
    path('llm/', DiseaseFromLLMView.as_view(), name='disease-llm'),

    path('', include(router.urls)),
    path('', include(diseases_router.urls)),
]
