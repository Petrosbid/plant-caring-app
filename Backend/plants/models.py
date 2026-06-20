from django.db import models
from django.utils import timezone

from plant_project import settings


class PlantImage(models.Model):
    """Represents an image for a plant (one of the list of images per plant)."""
    plant = models.ForeignKey('Plant', related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='plant_images/')
    caption = models.CharField(max_length=255, blank=True, null=True, help_text="Caption for the image")
    is_primary = models.BooleanField(default=False, help_text="Whether this is the primary image for the plant")
    created_at = models.DateTimeField(default=timezone.now, help_text="When the image was added")

    class Meta:
        ordering = ['-is_primary', 'created_at']

    def __str__(self):
        return f"Image for {self.plant.farsi_name} - {self.caption or 'No caption'}"


class Plant(models.Model):
    """Represents a plant in the main database. Each plant has a list of images via plant.images (PlantImage)."""
    farsi_name = models.CharField(max_length=255, unique=False, help_text="Farsi Name")
    english_name = models.CharField(max_length=255, unique=False, help_text="English Name", blank=True, null=True)
    other_names = models.CharField(max_length=255, blank=True, null=True, help_text="Other Persian names")
    other_names_en = models.CharField(max_length=255, blank=True, null=True, help_text="Other English names")
    scientific_name = models.CharField(max_length=255, unique=True, blank=True, null=True)
    description = models.TextField(help_text="Description in Persian")
    description_en = models.TextField(help_text="Description in English")
    is_toxic = models.BooleanField(default=False)
    favourite_count = models.PositiveIntegerField(default=0, help_text="Number of users who favorited this plant")
    comment_count = models.PositiveIntegerField(default=0, help_text="Number of approved comments on this plant")


    # Detailed care guide - Persian
    watering_frequency = models.CharField(max_length=100, blank=True, null=True, help_text="How often to water the plant (Persian)")
    light_requirements = models.CharField(max_length=200, blank=True, null=True, help_text="Light conditions needed (Persian)")
    fertilizer_schedule = models.CharField(max_length=200, blank=True, null=True, help_text="Fertilizer application schedule (Persian)")
    temperature_range = models.CharField(max_length=100, blank=True, null=True, help_text="Optimal temperature range (Persian)")
    humidity_level = models.CharField(max_length=100, blank=True, null=True, help_text="Preferred humidity level (Persian)")
    soil_type = models.CharField(max_length=200, blank=True, null=True, help_text="Recommended soil type (Persian)")
    pruning_info = models.TextField(blank=True, null=True, help_text="Pruning instructions (Persian)")

    # Detailed care guide - English
    watering_frequency_en = models.CharField(max_length=100, blank=True, null=True, help_text="How often to water the plant (English)")
    light_requirements_en = models.CharField(max_length=200, blank=True, null=True, help_text="Light conditions needed (English)")
    fertilizer_schedule_en = models.CharField(max_length=200, blank=True, null=True, help_text="Fertilizer application schedule (English)")
    temperature_range_en = models.CharField(max_length=100, blank=True, null=True, help_text="Optimal temperature range (English)")
    humidity_level_en = models.CharField(max_length=100, blank=True, null=True, help_text="Preferred humidity level (English)")
    soil_type_en = models.CharField(max_length=200, blank=True, null=True, help_text="Recommended soil type (English)")
    pruning_info_en = models.TextField(blank=True, null=True, help_text="Pruning instructions (English)")

    # Propagation (already bilingual)
    propagation_methods = models.TextField(blank=True, null=True, help_text="How to propagate the plant (Persian)")
    propagation_methods_en = models.TextField(blank=True, null=True, help_text="How to propagate the plant (English)")

    care_difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ], default='medium', help_text="Difficulty level of caring for this plant")

    # Analytics
    view_count = models.PositiveIntegerField(default=0, help_text="Number of times the plant detail has been viewed")
    garden_count = models.PositiveIntegerField(default=0, help_text="Number of users who added this plant to their garden")

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
        first_img = self.images.first()
        return first_img.image if first_img else None

    @property
    def all_images(self):
        """Get all images for this plant."""
        return self.images.all()

class PlantFavourite(models.Model):
    """Plant favourite by a user."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favourite_plants')
    plant = models.ForeignKey(Plant, on_delete=models.CASCADE, related_name='favourites')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'plant')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} ❤️ {self.plant.farsi_name}"


class PlantComment(models.Model):
    """Comment on a plant."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='plant_comments')
    plant = models.ForeignKey(Plant, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
    def __str__(self):
        return f"{self.user.username} on {self.plant.farsi_name}: {self.content[:50]}"