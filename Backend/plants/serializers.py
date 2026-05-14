from rest_framework import serializers
from .models import Plant, PlantImage, PlantFavourite, PlantComment


class PlantImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PlantImage
        fields = ('id', 'image', 'image_url', 'caption', 'is_primary', 'created_at')

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class PlantSerializer(serializers.ModelSerializer):
    """Serializer for Plant list view – includes bilingual fields, counts, and is_favourited."""
    primary_image = serializers.SerializerMethodField()
    is_favourited = serializers.SerializerMethodField()
    favourite_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    care_difficulty_display = serializers.SerializerMethodField()

    class Meta:
        model = Plant
        fields = (
            'id', 'farsi_name', 'english_name', 'scientific_name',
            'description', 'description_en',
            'primary_image', 'is_toxic',
            'watering_frequency', 'watering_frequency_en',
            'light_requirements', 'light_requirements_en',
            'fertilizer_schedule', 'fertilizer_schedule_en',
            'temperature_range', 'temperature_range_en',
            'humidity_level', 'humidity_level_en',
            'soil_type', 'soil_type_en',
            'pruning_info', 'pruning_info_en',
            'propagation_methods', 'propagation_methods_en',
            'care_difficulty', 'care_difficulty_display',
            'view_count', 'garden_count',
            'is_favourited', 'favourite_count', 'comment_count',
            'created_at', 'updated_at'
        )

    def get_primary_image(self, obj):
        if obj.primary_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.primary_image.url)
            return obj.primary_image.url
        return None

    def get_care_difficulty_display(self, obj):
        mapping = {
            'easy': {'en': 'Easy', 'fa': 'آسان'},
            'medium': {'en': 'Medium', 'fa': 'متوسط'},
            'hard': {'en': 'Hard', 'fa': 'سخت'},
        }
        return mapping.get(obj.care_difficulty, {'en': obj.care_difficulty, 'fa': obj.care_difficulty})

    def get_is_favourited(self, obj):
        """Return True if the authenticated user has favourited this plant, else False."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # PlantFavourite model has related_name='favourites' on Plant
            return obj.favourites.filter(user=request.user).exists()
        return False


class PlantDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer used for retrieve/update – includes images, counts, and is_favourited."""
    images = PlantImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    is_favourited = serializers.SerializerMethodField()
    favourite_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    care_difficulty_display = serializers.SerializerMethodField()

    class Meta:
        model = Plant
        fields = '__all__'

    def get_primary_image(self, obj):
        if obj.primary_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.primary_image.url)
            return obj.primary_image.url
        return None

    def get_care_difficulty_display(self, obj):
        mapping = {
            'easy': {'en': 'Easy', 'fa': 'آسان'},
            'medium': {'en': 'Medium', 'fa': 'متوسط'},
            'hard': {'en': 'Hard', 'fa': 'سخت'},
        }
        return mapping.get(obj.care_difficulty, {'en': obj.care_difficulty, 'fa': obj.care_difficulty})

    def get_is_favourited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favourites.filter(user=request.user).exists()
        return False


class PlantCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = PlantComment
        fields = ('id', 'user', 'user_name', 'plant', 'parent', 'content',
                  'is_approved', 'created_at', 'updated_at', 'replies')
        read_only_fields = ('user', 'plant', 'is_approved', 'created_at', 'updated_at')

    def get_replies(self, obj):
        if obj.replies.exists():
            return PlantCommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []