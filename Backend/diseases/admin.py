from django.contrib import admin
from .models import Disease

@admin.register(Disease)
class DiseaseAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    filter_horizontal = ('affected_plants',)