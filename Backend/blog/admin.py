# blog/admin.py

from django.contrib import admin
from .models import Post, Comment, UserVote

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'status', 'publish', 'view_count', 'likes_count', 'dislikes_count')
    list_filter = ('status', 'created', 'publish', 'author')
    search_fields = ('title', 'title_en', 'content', 'content_en')
    prepopulated_fields = {'slug': ('title',)}
    raw_id_fields = ('author',)
    date_hierarchy = 'publish'
    ordering = ('status', '-publish')

    fieldsets = (
        (None, {
            'fields': ('title', 'title_en', 'slug', 'author', 'status')
        }),
        ('Content', {
            'fields': ('cover_image', 'content', 'content_en')
        }),
        ('Dates & Analytics', {
            'fields': ('publish', 'view_count', 'likes_count', 'dislikes_count')
        }),
        ('SEO', {
            'fields': ('meta_description', 'meta_description_en', 'tags')
        }),
    )


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'post', 'created_at')
    list_filter = ('created_at', 'post')
    search_fields = ('content', 'author__username')
    raw_id_fields = ('author', 'post')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)


@admin.register(UserVote)
class UserVoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'vote_type', 'created_at')
    list_filter = ('vote_type', 'created_at')
    raw_id_fields = ('user', 'post')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
