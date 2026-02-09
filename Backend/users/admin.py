from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    # Add any additional fields you want to display in the admin
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')