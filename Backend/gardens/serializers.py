from rest_framework import serializers
from .models import UserPlant, Reminder, GrowthRecord
from plants.serializers import PlantSerializer

class GrowthRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrowthRecord
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
        extra_kwargs = {
            'user_plant': {'write_only': True}
        }

class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = '__all__'
        read_only_fields = ('user',)

class UserPlantSerializer(serializers.ModelSerializer):
    plant_details = PlantSerializer(source='plant', read_only=True)
    growth_records = GrowthRecordSerializer(many=True, read_only=True)
    reminders = ReminderSerializer(many=True, read_only=True)

    class Meta:
        model = UserPlant
        fields = (
            'id', 'user', 'plant', 'plant_details', 'nickname', 'added_date',
            'last_watered', 'next_watering_date', 'watering_interval_days',
            'last_fertilized', 'next_fertilizing_date', 'fertilizing_interval_days',
            'last_pruned', 'next_pruning_date', 'pruning_interval_days',
            'health_status', 'pot_size', 'notes',
            'growth_records', 'reminders'
        )
        extra_kwargs = {
            'user': {'read_only': True},
            'plant': {'write_only': True}
        }

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)