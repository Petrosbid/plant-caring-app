# diseases/admin.py
from django.contrib import admin
from .models import Disease, DiseaseComment

@admin.register(Disease)
class DiseaseAdmin(admin.ModelAdmin):
    list_display = ['name', 'name_fa', 'severity_level', 'spread_rate', 'affected_plants_list']
    search_fields = ['name', 'name_fa']
    list_filter = ['severity_level', 'spread_rate']

@admin.register(DiseaseComment)
class DiseaseCommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'disease', 'created_at', 'is_approved']
    list_filter = ['is_approved', 'created_at']