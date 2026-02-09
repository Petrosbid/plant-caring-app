from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from gardens.models import Reminder, UserPlant
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Send notifications for upcoming and overdue plant care reminders'

    def handle(self, *args, **options):
        # Send notifications for overdue reminders
        self.send_overdue_reminders()
        
        # Send notifications for reminders due today
        self.send_today_reminders()
        
        # Update recurring reminders
        self.update_recurring_reminders()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully processed reminders')
        )

    def send_overdue_reminders(self):
        """Send notifications for overdue reminders"""
        now = timezone.now()
        overdue_reminders = Reminder.objects.filter(
            is_completed=False,
            scheduled_date__lt=now
        )
        
        for reminder in overdue_reminders:
            # In a real app, you would send push notifications here
            logger.info(f"Overdue reminder: {reminder.title} for user {reminder.user.username}")
            # TODO: Implement actual notification sending (email, push notification, etc.)

    def send_today_reminders(self):
        """Send notifications for reminders due today"""
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        today_reminders = Reminder.objects.filter(
            is_completed=False,
            scheduled_date__range=(today_start, today_end)
        )
        
        for reminder in today_reminders:
            # In a real app, you would send push notifications here
            logger.info(f"Today's reminder: {reminder.title} for user {reminder.user.username}")
            # TODO: Implement actual notification sending (email, push notification, etc.)

    def update_recurring_reminders(self):
        """Update recurring reminders to create new instances"""
        now = timezone.now()
        completed_recurring = Reminder.objects.filter(
            is_completed=True,
            is_recurring=True,
            recurrence_interval__isnull=False
        )
        
        for reminder in completed_recurring:
            # Create a new reminder with the same properties but scheduled for the future
            next_scheduled_date = now + timezone.timedelta(days=reminder.recurrence_interval)
            
            # Check if a similar reminder already exists for the future date
            existing_reminder = Reminder.objects.filter(
                user=reminder.user,
                title=reminder.title,
                scheduled_date=next_scheduled_date
            ).exists()
            
            if not existing_reminder:
                # Create a new recurring reminder
                new_reminder = Reminder.objects.create(
                    user=reminder.user,
                    user_plant=reminder.user_plant,
                    title=reminder.title,
                    description=reminder.description,
                    care_type=reminder.care_type,
                    scheduled_date=next_scheduled_date,
                    is_completed=False,
                    is_recurring=True,
                    recurrence_interval=reminder.recurrence_interval
                )
                logger.info(f"Created recurring reminder: {new_reminder.title}")