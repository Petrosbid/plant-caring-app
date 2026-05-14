from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserPlantViewSet, ReminderViewSet, GrowthRecordViewSet, PlantChatView, NotificationsView

user_plant_router = DefaultRouter()
user_plant_router.register(r'', UserPlantViewSet, basename='userplant')

reminder_router = DefaultRouter()
reminder_router.register(r'', ReminderViewSet, basename='reminder')

growth_router = DefaultRouter()
growth_router.register(r'', GrowthRecordViewSet, basename='growthrecord')

urlpatterns = [
    path('chat/', PlantChatView.as_view(), name='plant-chat'),
    path('reminders/', include(reminder_router.urls)),
    path('growth/', include(growth_router.urls)),
    path('notifications/', NotificationsView.as_view(), name='notifications'),
    path('', include(user_plant_router.urls)),
]