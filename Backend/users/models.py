from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """
    Custom user model to allow for future extension.
    """
    email = models.EmailField(unique=True) # Make email unique
    bio = models.TextField(max_length=500, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.username