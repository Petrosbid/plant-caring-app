from django.db import models
from django.utils import timezone

class Disease(models.Model):
    """Represents a plant disease in the main database."""
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    symptoms = models.TextField()
    solution = models.TextField()
    affected_plants = models.ManyToManyField('plants.Plant', related_name='diseases', blank=True)

    # Additional detailed information
    severity_level = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ], default='medium', help_text="Severity level of the disease")

    prevention_methods = models.TextField(blank=True, null=True, help_text="Methods to prevent the disease")
    treatment_duration = models.CharField(max_length=100, blank=True, null=True, help_text="Expected duration for treatment")
    spread_rate = models.CharField(max_length=50, choices=[
        ('slow', 'Slow'),
        ('moderate', 'Moderate'),
        ('fast', 'Fast'),
    ], default='moderate', help_text="How fast the disease spreads")

    created_at = models.DateTimeField(default=timezone.now, help_text="Creation timestamp")
    updated_at = models.DateTimeField(auto_now=True, help_text="Last update timestamp")

    def __str__(self):
        return self.name