from rest_framework import serializers
from .models import UserPlant, Reminder
from plants.serializers import PlantSerializer

class UserPlantSerializer(serializers.ModelSerializer):
    """Serializer for the UserPlant (My Garden) model."""
    plant_details = PlantSerializer(source='plant', read_only=True)

    class Meta:
        model = UserPlant
        fields = ('id', 'user', 'plant', 'plant_details', 'nickname', 'added_date',
                  'last_watered', 'next_watering_date', 'watering_interval_days',
                  'last_fertilized', 'next_fertilizing_date', 'fertilizing_interval_days',
                  'last_pruned', 'next_pruning_date', 'pruning_interval_days',
                  'health_status', 'notes')
        extra_kwargs = {
            'user': {'read_only': True},
            'plant': {'write_only': True}
        }

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ReminderSerializer(serializers.ModelSerializer):
    """Serializer for the Reminder model."""
    class Meta:
        model = Reminder
        fields = '__all__'
        read_only_fields = ('user',)

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
