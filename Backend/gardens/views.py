from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import UserPlant, Reminder, GrowthRecord, PlantChatMessage
from .serializers import UserPlantSerializer, ReminderSerializer , GrowthRecordSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from .llm_chat import get_plant_chat_response

class UserPlantViewSet(viewsets.ModelViewSet):
    serializer_class = UserPlantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserPlant.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        plant_id = request.data.get('plant')
        existing = UserPlant.objects.filter(user=request.user, plant_id=plant_id).first()
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return super().create(request, *args, **kwargs)

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

class GrowthRecordViewSet(viewsets.ModelViewSet):

    serializer_class = GrowthRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GrowthRecord.objects.filter(user_plant__user=self.request.user)

    def perform_create(self, serializer):
        user_plant_id = self.request.data.get('user_plant')
        user_plant = UserPlant.objects.get(id=user_plant_id, user=self.request.user)
        serializer.save(user_plant=user_plant)

class PlantChatView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        data = request.data if request.data else request.POST
        plant_id = data.get('plant_id')
        message = (data.get('message') or '').strip()

        if not plant_id or not message:
            return Response({'error': 'plant_id and message are required.'}, status=400)

        try:
            user_plant = UserPlant.objects.get(user=request.user, plant_id=plant_id)
        except UserPlant.DoesNotExist:
            return Response({'error': 'Plant not in your garden.'}, status=404)

        chat_history_qs = PlantChatMessage.objects.filter(
            user=request.user,
            user_plant=user_plant
        ).order_by('created_at')
        chat_history = []
        for msg in chat_history_qs:
            chat_history.append({"role": "user", "content": msg.message})
            chat_history.append({"role": "assistant", "content": msg.response})

        bot_reply = get_plant_chat_response(user_plant, message, chat_history)

        PlantChatMessage.objects.create(
            user=request.user,
            user_plant=user_plant,
            message=message,
            response=bot_reply
        )

        return Response({'reply': bot_reply})

class NotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        tomorrow = today + timezone.timedelta(days=1)

        reminders_today = Reminder.objects.filter(
            user=request.user,
            is_completed=False,
            scheduled_date__date=today
        ).select_related('user_plant__plant')

        reminders_tomorrow = Reminder.objects.filter(
            user=request.user,
            is_completed=False,
            scheduled_date__date=tomorrow
        ).select_related('user_plant__plant')

        def serialize_reminder(reminder):
            return {
                'id': reminder.id,
                'title': reminder.title,
                'care_type': reminder.care_type,
                'scheduled_date': reminder.scheduled_date.isoformat(),
                'user_plant_id': reminder.user_plant.id if reminder.user_plant else None,
                'plant_id': reminder.user_plant.plant.id if reminder.user_plant else None,
                'plant_name': reminder.user_plant.plant.farsi_name if reminder.user_plant else None,
                'plant_image': reminder.user_plant.plant.primary_image.url if reminder.user_plant and reminder.user_plant.plant.primary_image else None,
            }

        data = {
            'today': [serialize_reminder(r) for r in reminders_today],
            'tomorrow': [serialize_reminder(r) for r in reminders_tomorrow],
            'total_count': reminders_today.count() + reminders_tomorrow.count()
        }
        return Response(data)