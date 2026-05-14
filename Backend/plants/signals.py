# plants/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import F
from .models import PlantFavourite, PlantComment, Plant

@receiver(post_save, sender=PlantFavourite)
def increment_favourite_count(sender, instance, created, **kwargs):
    if created:
        Plant.objects.filter(pk=instance.plant_id).update(favourite_count=F('favourite_count') + 1)

@receiver(post_delete, sender=PlantFavourite)
def decrement_favourite_count(sender, instance, **kwargs):
    Plant.objects.filter(pk=instance.plant_id).update(favourite_count=F('favourite_count') - 1)

@receiver(post_save, sender=PlantComment)
def increment_comment_count(sender, instance, created, **kwargs):
    if created and instance.is_approved:
        Plant.objects.filter(pk=instance.plant_id).update(comment_count=F('comment_count') + 1)

@receiver(post_delete, sender=PlantComment)
def decrement_comment_count(sender, instance, **kwargs):
    if instance.is_approved:
        Plant.objects.filter(pk=instance.plant_id).update(comment_count=F('comment_count') - 1)