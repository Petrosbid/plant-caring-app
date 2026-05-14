from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'first_name', 'last_name',
                    'phone', 'gender', 'national_code', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Profile Info', {
            'fields': ('phone', 'national_code', 'birth_date', 'gender', 'bio', 'profile_picture')
        }),
    )