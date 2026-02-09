from django.contrib import admin
from .models import UserPlant

@admin.register(UserPlant)
class UserPlantAdmin(admin.ModelAdmin):
    list_display = ('user', 'plant', 'nickname', 'added_date')
    search_fields = ('user__username', 'plant__farsi_name', 'nickname')
    list_filter = ('added_date',)