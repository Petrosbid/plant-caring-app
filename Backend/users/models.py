from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from django.conf import settings


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    national_code = models.CharField(max_length=10, blank=True, null=True, unique=True)
    birth_date = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=1, choices=[('M','Male'),('F','Female'),('O','Other')], blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)

    # Push Notification Settings
    push_token = models.CharField(max_length=255, blank=True, null=True)
    timezone = models.CharField(max_length=50, default='Asia/Tehran')
    notify_reminders_exact = models.BooleanField(default=True)
    notify_reminders_daily = models.BooleanField(default=True)
    notify_reminders_tomorrow = models.BooleanField(default=True)
    last_daily_notification_date = models.DateField(blank=True, null=True)
    last_tomorrow_notification_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.username


class OTPCode(models.Model):
    OTP_TYPES = (
        ('phone', 'Phone'),
        ('email', 'Email'),
    )
    PURPOSE_CHOICES = (
        ('login', 'Login'),
        ('register', 'Registration'),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True, blank=True
    )
    phone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    code = models.CharField(max_length=6)
    type = models.CharField(max_length=10, choices=OTP_TYPES)
    purpose = models.CharField(max_length=10, choices=PURPOSE_CHOICES, default='login')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        unique_together = ['phone', 'purpose', 'is_used']  # ساده‌سازی

    def __str__(self):
        return f"OTP ({self.purpose}) for {self.phone or self.email} - {self.code}"

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)