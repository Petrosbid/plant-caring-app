from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from gardens.models import Reminder, UserPlant
from gardens.notifications import send_push_notification
import logging
from zoneinfo import ZoneInfo

User = get_user_model()
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Send notifications for upcoming, daily, tomorrow and exact plant care reminders'

    def handle(self, *args, **options):
        # 1. Send notifications for exact reminders whose scheduled time has arrived
        self.send_exact_reminders()
        
        # 2. Send daily summary notifications (e.g., in the morning)
        self.send_daily_summaries()
        
        # 3. Send tomorrow tasks notifications (e.g., in the evening)
        self.send_tomorrow_summaries()
        
        # 4. Update recurring reminders
        self.update_recurring_reminders()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully processed all reminders and notifications')
        )

    def send_exact_reminders(self):
        """Send push notifications for reminders whose exact scheduled time has arrived"""
        now = timezone.now()
        # Find active reminders that are not completed, not yet notified, and scheduled date has passed
        due_reminders = Reminder.objects.filter(
            is_completed=False,
            notified=False,
            scheduled_date__lte=now
        ).select_related('user', 'user_plant__plant')

        for reminder in due_reminders:
            user = reminder.user
            if user.notify_reminders_exact and user.push_token:
                plant_name = reminder.user_plant.plant.farsi_name if reminder.user_plant else "your plant"
                title = "Care Time! 🌿"
                body = f"It's time for {reminder.title} on your {plant_name}."
                data = {
                    "type": "reminder_exact",
                    "reminder_id": reminder.id,
                    "plant_id": reminder.user_plant.id if reminder.user_plant else None
                }
                logger.info(f"Sending exact push notification to {user.username} for reminder {reminder.id}")
                send_push_notification(user.push_token, title, body, data)
                
            reminder.notified = True
            reminder.save()

    def send_daily_summaries(self):
        """Send daily summary of reminders for today (e.g. morning at 8:00 AM or after local time)"""
        now = timezone.now()
        users_with_tokens = User.objects.filter(
            notify_reminders_daily=True,
            push_token__isnull=False
        ).exclude(push_token="")

        for user in users_with_tokens:
            try:
                local_tz = ZoneInfo(user.timezone)
            except Exception:
                local_tz = ZoneInfo("Asia/Tehran")  # Fallback

            local_now = now.astimezone(local_tz)
            local_today = local_now.date()

            # Check if it's morning (e.g., local hour >= 8) and daily notification wasn't sent yet for today
            if local_now.hour >= 8 and user.last_daily_notification_date != local_today:
                # Query reminders due today (local date)
                today_start = local_now.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc)
                today_end = local_now.replace(hour=23, minute=59, second=59, microsecond=999999).astimezone(timezone.utc)

                today_reminders = Reminder.objects.filter(
                    user=user,
                    is_completed=False,
                    scheduled_date__range=(today_start, today_end)
                ).select_related('user_plant__plant')

                if today_reminders.exists():
                    count = today_reminders.count()
                    plant_names = list(set([r.user_plant.plant.farsi_name for r in today_reminders if r.user_plant]))
                    plants_str = f" ({', '.join(plant_names)})" if plant_names else ""
                    
                    title = "Today's Plant Care Tasks 🌸"
                    body = f"Good morning! You have {count} care tasks scheduled for today{plants_str}. Open the app to complete them!"
                    data = {
                        "type": "daily_summary",
                        "date": local_today.isoformat()
                    }
                    logger.info(f"Sending daily summary notification to {user.username}")
                    send_push_notification(user.push_token, title, body, data)

                # Save that we processed today
                user.last_daily_notification_date = local_today
                user.save(update_fields=['last_daily_notification_date'])

    def send_tomorrow_summaries(self):
        """Send summary of reminders for tomorrow (e.g. evening at 8:00 PM or after local time)"""
        now = timezone.now()
        users_with_tokens = User.objects.filter(
            notify_reminders_tomorrow=True,
            push_token__isnull=False
        ).exclude(push_token="")

        for user in users_with_tokens:
            try:
                local_tz = ZoneInfo(user.timezone)
            except Exception:
                local_tz = ZoneInfo("Asia/Tehran")  # Fallback

            local_now = now.astimezone(local_tz)
            local_today = local_now.date()
            local_tomorrow = local_today + timezone.timedelta(days=1)

            # Check if it's evening (e.g., local hour >= 20) and tomorrow notification wasn't sent yet today
            if local_now.hour >= 20 and user.last_tomorrow_notification_date != local_today:
                # Query reminders due tomorrow (local date)
                tomorrow_start = (local_now + timezone.timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc)
                tomorrow_end = (local_now + timezone.timedelta(days=1)).replace(hour=23, minute=59, second=59, microsecond=999999).astimezone(timezone.utc)

                tomorrow_reminders = Reminder.objects.filter(
                    user=user,
                    is_completed=False,
                    scheduled_date__range=(tomorrow_start, tomorrow_end)
                ).select_related('user_plant__plant')

                if tomorrow_reminders.exists():
                    count = tomorrow_reminders.count()
                    plant_names = list(set([r.user_plant.plant.farsi_name for r in tomorrow_reminders if r.user_plant]))
                    plants_str = f" ({', '.join(plant_names)})" if plant_names else ""

                    title = "Tomorrow's Plant Care Tasks 📅"
                    body = f"Plan ahead: You have {count} care tasks scheduled for tomorrow{plants_str}."
                    data = {
                        "type": "tomorrow_summary",
                        "date": local_tomorrow.isoformat()
                    }
                    logger.info(f"Sending tomorrow summary notification to {user.username}")
                    send_push_notification(user.push_token, title, body, data)

                # Save that we processed today
                user.last_tomorrow_notification_date = local_today
                user.save(update_fields=['last_tomorrow_notification_date'])

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
                    recurrence_interval=reminder.recurrence_interval,
                    notified=False
                )
                logger.info(f"Created recurring reminder: {new_reminder.title}")