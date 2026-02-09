from django.contrib import admin
from .models import Plant

@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ('farsi_name', 'scientific_name', 'is_toxic')
    search_fields = ('farsi_name', 'scientific_name')
    list_filter = ('is_toxic',)