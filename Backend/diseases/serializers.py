from rest_framework import serializers
from .models import Disease
from plants.serializers import PlantSerializer

class DiseaseSerializer(serializers.ModelSerializer):
    affected_plants = PlantSerializer(many=True, read_only=True)

    class Meta:
        model = Disease
        fields = '__all__'


class DiseaseDetailSerializer(serializers.ModelSerializer):
    affected_plants = PlantSerializer(many=True, read_only=True)

    class Meta:
        model = Disease
        fields = '__all__'
