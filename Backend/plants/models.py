from django.db import models
from django.utils import timezone


class PlantImage(models.Model):
    """Represents an image for a plant (one of the list of images per plant)."""
    plant = models.ForeignKey('Plant', related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='plant_images/')
    caption = models.CharField(max_length=255, blank=True, null=True, help_text="Caption for the image")
    is_primary = models.BooleanField(default=False, help_text="Whether this is the primary image for the plant")
    created_at = models.DateTimeField(default=timezone.now, help_text="When the image was added")

    class Meta:
        ordering = ['-is_primary', 'created_at']  # Primary first, then by date

    def __str__(self):
        return f"Image for {self.plant.farsi_name} - {self.caption or 'No caption'}"


class Plant(models.Model):
    """Represents a plant in the main database. Each plant has a list of images via plant.images (PlantImage)."""
    farsi_name = models.CharField(max_length=255, unique=True)
    scientific_name = models.CharField(max_length=255, unique=True, blank=True, null=True)
    description = models.TextField()
    is_toxic = models.BooleanField(default=False)

    # Detailed care guide information
    watering_frequency = models.CharField(max_length=100, blank=True, null=True, help_text="How often to water the plant")
    light_requirements = models.CharField(max_length=200, blank=True, null=True, help_text="Light conditions needed")
    fertilizer_schedule = models.CharField(max_length=200, blank=True, null=True, help_text="Fertilizer application schedule")
    temperature_range = models.CharField(max_length=100, blank=True, null=True, help_text="Optimal temperature range")
    humidity_level = models.CharField(max_length=100, blank=True, null=True, help_text="Preferred humidity level")
    soil_type = models.CharField(max_length=200, blank=True, null=True, help_text="Recommended soil type")
    pruning_info = models.TextField(blank=True, null=True, help_text="Pruning instructions")
    propagation_methods = models.TextField(blank=True, null=True, help_text="How to propagate the plant")

    # Additional fields
    care_difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ], default='medium', help_text="Difficulty level of caring for this plant")

    created_at = models.DateTimeField(default=timezone.now, help_text="Creation timestamp")
    updated_at = models.DateTimeField(auto_now=True, help_text="Last update timestamp")

    def __str__(self):
        return self.farsi_name

    @property
    def primary_image(self):
        """Get the primary image for this plant, or the first image if none is marked as primary."""
        primary_img = self.images.filter(is_primary=True).first()
        if primary_img:
            return primary_img.image
        # If no primary image is set, return the first image
        first_img = self.images.first()
        return first_img.image if first_img else None

    @property
    def all_images(self):
        """Get all images for this plant."""
        return self.images.all()