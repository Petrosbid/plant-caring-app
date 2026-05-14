from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    PlantViewSet, PlantIdentifyView, PlantSearchView,
    PlantFavouriteViewSet, PlantCommentViewSet, PlantRecommenderView
)

router = DefaultRouter()
router.register(r'', PlantViewSet, basename='plant')

plants_router = routers.NestedSimpleRouter(router, r'', lookup='plant')
plants_router.register(r'comments', PlantCommentViewSet, basename='plant-comments')

favourite_router = DefaultRouter()
favourite_router.register(r'favourites', PlantFavouriteViewSet, basename='favourite')


urlpatterns = [
    path('identify/', PlantIdentifyView.as_view(), name='plant-identify'),
    path('search/', PlantSearchView.as_view(), name='plant-search'),
    path('recommend-plant/', PlantRecommenderView.as_view(), name='plant-recommender'),
    path('', include(router.urls)),
    path('', include(plants_router.urls)),
    path('', include(favourite_router.urls)),
]