from rest_framework import serializers
from .models import Disease, DiseaseComment
from plants.serializers import PlantSerializer

class DiseaseSerializer(serializers.ModelSerializer):
    affected_plants_list = serializers.CharField(read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Disease
        fields = '__all__'

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url

class DiseaseDetailSerializer(serializers.ModelSerializer):
    affected_plants = PlantSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Disease
        fields = '__all__'

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url

class DiseaseCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = DiseaseComment
        fields = ('id', 'user', 'user_name', 'disease', 'parent', 'content',
                  'is_approved', 'created_at', 'updated_at', 'replies')
        read_only_fields = ('user', 'disease', 'is_approved', 'created_at', 'updated_at')

    def get_replies(self, obj):
        if obj.replies.exists():
            return DiseaseCommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []