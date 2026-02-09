from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlantViewSet, PlantIdentifyView, PlantSearchView

router = DefaultRouter()
router.register(r'', PlantViewSet, basename='plant')

urlpatterns = [
    path('identify/', PlantIdentifyView.as_view(), name='plant-identify'),
    path('search/', PlantSearchView.as_view(), name='plant-search'),
    path('', include(router.urls)),
]
