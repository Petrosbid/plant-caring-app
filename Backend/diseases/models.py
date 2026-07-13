from django.db import models
from django.utils import timezone
from django.conf import settings

class Disease(models.Model):
    name = models.CharField(max_length=255, unique=True, help_text="Disease name in English")
    name_fa = models.CharField(max_length=255, unique=True, blank=True, null=True, help_text="Disease name in Persian")
    description = models.TextField(help_text="Description in English")
    description_fa = models.TextField(blank=True, null=True, help_text="Description in Persian")
    symptoms = models.TextField(help_text="Symptoms in English")
    symptoms_fa = models.TextField(blank=True, null=True, help_text="Symptoms in Persian")
    solution = models.TextField(help_text="Treatment solution in English")
    solution_fa = models.TextField(blank=True, null=True, help_text="Treatment solution in Persian")
    comment_count = models.PositiveIntegerField(default=0, help_text="Number of approved comments")
    affected_plants_list = models.TextField(
        blank=True, null=True,
        help_text="Comma-separated list of affected plant names (e.g., 'Rose, Cucumber, Strawberry')"
    )
    is_infectious_en = models.TextField(blank=True, null=True)
    severity_level = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ], default='medium', help_text="Severity level of the disease")

    image = models.ImageField(upload_to='diseases/', blank=True, null=True, help_text="Disease image")
    image_url = models.URLField(max_length=500, blank=True, null=True, help_text="Disease image URL")

    prevention_methods = models.TextField(blank=True, null=True, help_text="Prevention methods in English")
    prevention_methods_fa = models.TextField(blank=True, null=True, help_text="Prevention methods in Persian")

    treatment_duration = models.CharField(max_length=100, blank=True, null=True,
                                          help_text="Expected duration for treatment")
    spread_rate = models.CharField(max_length=50, choices=[
        ('slow', 'Slow'),
        ('moderate', 'Moderate'),
        ('fast', 'Fast'),
    ], default='moderate', help_text="How fast the disease spreads")

    # Analytics
    view_count = models.PositiveIntegerField(default=0, help_text="Number of times disease detail has been viewed")

    created_at = models.DateTimeField(default=timezone.now, help_text="Creation timestamp")
    updated_at = models.DateTimeField(auto_now=True, help_text="Last update timestamp")

    def __str__(self):
        return self.name_fa or self.name


class DiseaseComment(models.Model):
    """Comment on a disease."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='disease_comments')
    disease = models.ForeignKey(Disease, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user.username} on {self.disease.name}: {self.content[:50]}"