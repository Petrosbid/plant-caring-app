from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserPlantViewSet, ReminderViewSet

# Router for user plants (garden)
user_plant_router = DefaultRouter()
user_plant_router.register(r'', UserPlantViewSet, basename='userplant')

# Router for reminders
reminder_router = DefaultRouter()
reminder_router.register(r'', ReminderViewSet, basename='reminder')

urlpatterns = [
    path('reminders/', include(reminder_router.urls)),  # For reminders: /api/my-garden/reminders/ (must be before '' to match)
    path('', include(user_plant_router.urls)),  # For user plants: /api/my-garden/
]
