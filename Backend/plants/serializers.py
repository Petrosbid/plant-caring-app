from rest_framework import serializers
from .models import Plant, PlantImage

class PlantImageSerializer(serializers.ModelSerializer):
    """Serializer for the PlantImage model; image_url is full URL for showing on the site."""
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PlantImage
        fields = ('id', 'image', 'image_url', 'caption', 'is_primary', 'created_at')

    def get_image_url(self, obj):
        """Return absolute URL for the image for use on the site."""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class PlantSerializer(serializers.ModelSerializer):
    """Serializer for the Plant model."""
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Plant
        fields = (
            'id', 'farsi_name', 'scientific_name', 'description', 'primary_image',
            'is_toxic', 'watering_frequency', 'light_requirements',
            'fertilizer_schedule', 'temperature_range', 'humidity_level',
            'soil_type', 'pruning_info', 'propagation_methods',
            'care_difficulty', 'created_at', 'updated_at'
        )

    def get_primary_image(self, obj):
        """Get the URL of the primary image."""
        if obj.primary_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.primary_image.url)
            return obj.primary_image.url
        return None


class PlantDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for the Plant model with all information."""
    images = PlantImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Plant
        fields = '__all__'

    def get_primary_image(self, obj):
        """Get the URL of the primary image."""
        if obj.primary_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.primary_image.url)
            return obj.primary_image.url
        return None
