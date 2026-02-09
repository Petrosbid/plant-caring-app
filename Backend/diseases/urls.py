from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DiseaseViewSet, DiseaseDiagnoseView, DiseaseSearchView

router = DefaultRouter()
router.register(r'', DiseaseViewSet, basename='disease')

urlpatterns = [
    path('diagnose/', DiseaseDiagnoseView.as_view(), name='disease-diagnose'),
    path('search/', DiseaseSearchView.as_view(), name='disease-search'),
    path('', include(router.urls)),
]
