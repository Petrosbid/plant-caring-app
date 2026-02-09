from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import UserPlant, Reminder
from .serializers import UserPlantSerializer, ReminderSerializer

class UserPlantViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing a user's personal garden (UserPlant).
    """
    serializer_class = UserPlantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should only return the list of plants
        for the currently authenticated user.
        """
        return UserPlant.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Automatically associate the user with the new UserPlant instance.
        """
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        """
        Pass the request context to the serializer.
        """
        return {'request': self.request}

    @action(detail=True, methods=['post'])
    def water_plant(self, request, pk=None):
        """
        Mark the plant as watered and update the next watering date.
        """
        user_plant = self.get_object()
        user_plant.last_watered = timezone.now()
        user_plant.next_watering_date = timezone.now() + timezone.timedelta(days=user_plant.watering_interval_days)
        user_plant.save()

        return Response({
            'message': 'Plant has been watered successfully',
            'next_watering_date': user_plant.next_watering_date
        })

    @action(detail=True, methods=['post'])
    def fertilize_plant(self, request, pk=None):
        """
        Mark the plant as fertilized and update the next fertilizing date.
        """
        user_plant = self.get_object()
        user_plant.last_fertilized = timezone.now()
        user_plant.next_fertilizing_date = timezone.now() + timezone.timedelta(days=user_plant.fertilizing_interval_days)
        user_plant.save()

        return Response({
            'message': 'Plant has been fertilized successfully',
            'next_fertilizing_date': user_plant.next_fertilizing_date
        })

    @action(detail=True, methods=['post'])
    def prune_plant(self, request, pk=None):
        """
        Mark the plant as pruned and update the next pruning date.
        """
        user_plant = self.get_object()
        user_plant.last_pruned = timezone.now()
        user_plant.next_pruning_date = timezone.now() + timezone.timedelta(days=user_plant.pruning_interval_days)
        user_plant.save()

        return Response({
            'message': 'Plant has been pruned successfully',
            'next_pruning_date': user_plant.next_pruning_date
        })


class ReminderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing care reminders.
    """
    serializer_class = ReminderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Return reminders for the currently authenticated user.
        """
        return Reminder.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Automatically associate the user with the new Reminder instance.
        """
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """
        Mark a reminder as completed.
        """
        reminder = self.get_object()
        reminder.is_completed = True
        reminder.save()
        return Response({'message': 'Reminder marked as completed'})

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """
        Get upcoming reminders for the user.
        """
        upcoming_reminders = Reminder.objects.filter(
            user=request.user,
            is_completed=False,
            scheduled_date__gte=timezone.now()
        ).order_by('scheduled_date')

        serializer = self.get_serializer(upcoming_reminders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """
        Get overdue reminders for the user.
        """
        overdue_reminders = Reminder.objects.filter(
            user=request.user,
            is_completed=False,
            scheduled_date__lt=timezone.now()
        ).order_by('-scheduled_date')

        serializer = self.get_serializer(overdue_reminders, many=True)
        return Response(serializer.data)