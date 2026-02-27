from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer
from .models import Post, Comment, UserVote
from django.contrib.auth import get_user_model

# FIX: Get the correct User model dynamically
User = get_user_model()


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'created_at']
        read_only_fields = ['author', 'created_at']

    def get_author(self, obj):
        return obj.author.username

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['author'] = request.user
        return super().create(validated_data)


# For list view - less data
class PostListSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    excerpt = serializers.SerializerMethodField()
    # English title for language switching
    title_en = serializers.ReadOnlyField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'title_en',
            'slug',
            'author',
            'cover_image',
            'publish',
            'excerpt',
            'likes_count',
            'dislikes_count',
            'comments_count',
        ]

    def get_excerpt(self, obj):
        from django.utils.html import strip_tags
        # Safety check if content is empty
        content = obj.content or ""
        text = strip_tags(content)
        return text[:150] + '...' if len(text) > 150 else text

    def get_comments_count(self, obj):
        return obj.comments.count()


# For detail view - all data
class PostDetailSerializer(TaggitSerializer, serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    tags = TagListSerializerField()
    comments_count = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    user_has_liked = serializers.SerializerMethodField()
    user_has_disliked = serializers.SerializerMethodField()
    # English content for language switching
    title_en = serializers.ReadOnlyField()
    content_en = serializers.ReadOnlyField()
    meta_description_en = serializers.ReadOnlyField()

    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'title_en',
            'slug',
            'author',
            'cover_image',
            'content',
            'content_en',
            'publish',
            'updated',
            'meta_description',
            'meta_description_en',
            'tags',
            'view_count',
            'likes_count',
            'dislikes_count',
            'comments_count',
            'comments',
            'user_has_liked',
            'user_has_disliked',
        ]
        lookup_field = 'slug'

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserVote.objects.filter(user=request.user, post=obj, vote_type=UserVote.VoteType.LIKE).exists()
        return False

    def get_user_has_disliked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserVote.objects.filter(user=request.user, post=obj, vote_type=UserVote.VoteType.DISLIKE).exists()
        return False
