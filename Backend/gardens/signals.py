from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import UserPlant, Reminder

@receiver(post_save, sender=UserPlant)
def update_care_dates(sender, instance, created, **kwargs):
    """
    Update care dates when a UserPlant is saved
    """
    if created:
        # Set initial care dates based on the plant's care requirements
        plant = instance.plant

        # Set watering interval based on plant's watering frequency
        if plant.watering_frequency:
            # Parse the watering frequency to determine interval
            if 'daily' in plant.watering_frequency.lower():
                instance.watering_interval_days = 1
            elif 'every 2 days' in plant.watering_frequency.lower():
                instance.watering_interval_days = 2
            elif 'every 3 days' in plant.watering_frequency.lower():
                instance.watering_interval_days = 3
            elif 'weekly' in plant.watering_frequency.lower() or 'week' in plant.watering_frequency.lower():
                instance.watering_interval_days = 7
            elif 'every 2 weeks' in plant.watering_frequency.lower():
                instance.watering_interval_days = 14
            else:
                instance.watering_interval_days = 7  # Default to weekly

        # Set fertilizing interval based on plant's fertilizer schedule
        if plant.fertilizer_schedule:
            if 'monthly' in plant.fertilizer_schedule.lower() or 'month' in plant.fertilizer_schedule.lower():
                instance.fertilizing_interval_days = 30
            elif 'weekly' in plant.watering_frequency.lower():
                instance.fertilizing_interval_days = 7
            elif 'bi-weekly' in plant.fertilizer_schedule.lower():
                instance.fertilizing_interval_days = 14
            else:
                instance.fertilizing_interval_days = 30  # Default to monthly

        # Save the updated intervals
        instance.save()


@receiver(post_save, sender=UserPlant)
def create_initial_reminders(sender, instance, created, **kwargs):
    """
    Create initial care reminders when a UserPlant is added
    """
    if created:
        # Create watering reminder
        if instance.next_watering_date:
            Reminder.objects.get_or_create(
                user=instance.user,
                user_plant=instance,
                title=f"Water {instance.nickname or instance.plant.farsi_name}",
                description=f"Time to water your {instance.nickname or instance.plant.farsi_name}",
                care_type='watering',
                scheduled_date=instance.next_watering_date,
                defaults={
                    'is_recurring': True,
                    'recurrence_interval': instance.watering_interval_days
                }
            )

        # Create fertilizing reminder
        if instance.next_fertilizing_date:
            Reminder.objects.get_or_create(
                user=instance.user,
                user_plant=instance,
                title=f"Fertilize {instance.nickname or instance.plant.farsi_name}",
                description=f"Time to fertilize your {instance.nickname or instance.plant.farsi_name}",
                care_type='fertilizing',
                scheduled_date=instance.next_fertilizing_date,
                defaults={
                    'is_recurring': True,
                    'recurrence_interval': instance.fertilizing_interval_days
                }
            )

        # Create pruning reminder
        if instance.next_pruning_date:
            Reminder.objects.get_or_create(
                user=instance.user,
                user_plant=instance,
                title=f"Prune {instance.nickname or instance.plant.farsi_name}",
                description=f"Time to prune your {instance.nickname or instance.plant.farsi_name}",
                care_type='pruning',
                scheduled_date=instance.next_pruning_date,
                defaults={
                    'is_recurring': True,
                    'recurrence_interval': instance.pruning_interval_days
                }
            )