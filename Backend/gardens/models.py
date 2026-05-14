from django.conf import settings
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta

class UserPlant(models.Model):
    """Represents a plant in a user's personal garden."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='garden')
    plant = models.ForeignKey('plants.Plant', on_delete=models.CASCADE)
    nickname = models.CharField(max_length=255, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True)

    # Care reminder information
    last_watered = models.DateTimeField(
        null=True, blank=True, default=None,
        help_text="Date when the plant was last watered"
    )
    next_watering_date = models.DateTimeField(null=True, blank=True,
                                              help_text="Date when the plant needs to be watered next")
    watering_interval_days = models.IntegerField(default=7, help_text="Number of days between watering")

    last_fertilized = models.DateTimeField(
        null=True, blank=True, default=None,
        help_text="Date when the plant was last fertilized"
    )
    next_fertilizing_date = models.DateTimeField(null=True, blank=True,
                                                 help_text="Date when the plant needs to be fertilized next")
    fertilizing_interval_days = models.IntegerField(default=30, help_text="Number of days between fertilizing")

    last_pruned = models.DateTimeField(
        null=True, blank=True, default=None,
        help_text="Date when the plant was last pruned"
    )
    next_pruning_date = models.DateTimeField(null=True, blank=True,
                                             help_text="Date when the plant needs to be pruned next")
    pruning_interval_days = models.IntegerField(default=90, help_text="Number of days between pruning")

    health_status = models.CharField(max_length=20, choices=[
        ('healthy', 'Healthy'),
        ('needs_attention', 'Needs Attention'),
        ('unhealthy', 'Unhealthy'),
    ], default='healthy', help_text="Current health status of the plant")

    POT_SIZE_CHOICES = [
        ('no_pot', 'بدون گلدان'),
        ('small', 'گلدان کوچک'),
        ('medium', 'گلدان متوسط'),
        ('large', 'گلدان بزرگ'),
        ('extra_large', 'گلدان خیلی بزرگ'),
    ]

    pot_size = models.CharField(
        max_length=20,
        choices=POT_SIZE_CHOICES,
        default='medium',
        help_text="سایز گلدان فعلی گیاه"
    )

    notes = models.TextField(blank=True, null=True, help_text="Personal notes about the plant")

    def save(self, *args, **kwargs):
        if self.last_watered and not self.next_watering_date:  # فقط اگر last_watered موجود باشد
            self.next_watering_date = self.last_watered + timedelta(days=self.watering_interval_days)

        if self.last_fertilized and not self.next_fertilizing_date:
            self.next_fertilizing_date = self.last_fertilized + timedelta(days=self.fertilizing_interval_days)

        if self.last_pruned and not self.next_pruning_date:
            self.next_pruning_date = self.last_pruned + timedelta(days=self.pruning_interval_days)

        super().save(*args, **kwargs)

    class Meta:
        unique_together = ('user', 'plant')

    def __str__(self):
        return f"{self.nickname or self.plant.farsi_name} in {self.user.username}'s garden"

    def needs_watering(self):
        """Check if the plant needs watering today"""
        if self.next_watering_date:
            return timezone.now().date() >= self.next_watering_date.date()
        return False

    def needs_fertilizing(self):
        """Check if the plant needs fertilizing today"""
        if self.next_fertilizing_date:
            return timezone.now().date() >= self.next_fertilizing_date.date()
        return False

    def needs_pruning(self):
        """Check if the plant needs pruning today"""
        if self.next_pruning_date:
            return timezone.now().date() >= self.next_pruning_date.date()
        return False




class Reminder(models.Model):
    """Represents a care reminder for a user's plant."""
    CARE_TYPES = [
        ('watering', 'Watering'),
        ('fertilizing', 'Fertilizing'),
        ('pruning', 'Pruning'),
        ('pest_control', 'Pest Control'),
        ('repotting', 'Repotting'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminders')
    user_plant = models.ForeignKey(UserPlant, on_delete=models.CASCADE, related_name='reminders', null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    care_type = models.CharField(max_length=20, choices=CARE_TYPES, default='watering')
    scheduled_date = models.DateTimeField()
    is_completed = models.BooleanField(default=False)
    is_recurring = models.BooleanField(default=False)
    recurrence_interval = models.IntegerField(null=True, blank=True, help_text="Interval in days for recurring reminders")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

    def is_overdue(self):
        """Check if the reminder is overdue"""
        return not self.is_completed and self.scheduled_date < timezone.now()

    class Meta:
        ordering = ['-scheduled_date']



class GrowthRecord(models.Model):
    UNIT_CHOICES = [
        ('cm', 'سانتی‌متر'),
        ('inch', 'اینچ'),
    ]

    user_plant = models.ForeignKey(
        UserPlant,
        on_delete=models.CASCADE,
        related_name='growth_records'
    )
    date = models.DateTimeField(default=timezone.now)
    height = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="ارتفاع گیاه (مثلاً 15.5)"
    )
    width = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="عرض یا پهنای گیاه"
    )
    unit = models.CharField(
        max_length=10,
        choices=UNIT_CHOICES,
        default='cm'
    )
    notes = models.TextField(blank=True, null=True, help_text="یادداشت مرتبط با این رکورد رشد")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.user_plant} - {self.date.strftime('%Y/%m/%d')}: {self.height} {self.unit}"


class PlantChatMessage(models.Model):
    """ذخیره تاریخچه چت کاربر با دستیار برای هر گیاه خاص در باغچه کاربر"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='plant_chats')
    user_plant = models.ForeignKey(UserPlant, on_delete=models.CASCADE, related_name='chat_messages')
    message = models.TextField(verbose_name="پیام کاربر")
    response = models.TextField(verbose_name="پاسخ دستیار")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "پیام چت گیاه"
        verbose_name_plural = "پیام‌های چت گیاهان"

    def __str__(self):
        return f"{self.user.username} - {self.user_plant.plant.farsi_name} - {self.created_at.strftime('%Y/%m/%d %H:%M')}"