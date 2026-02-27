from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
from ckeditor_uploader.fields import RichTextUploadingField
from taggit.managers import TaggableManager


class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DF', 'Draft'
        PUBLISHED = 'PB', 'Published'

    # Persian content (default)
    title = models.CharField(max_length=250)
    content = RichTextUploadingField()
    
    # English translations
    title_en = models.CharField(max_length=250, blank=True, null=True)
    content_en = RichTextUploadingField(blank=True, null=True)
    
    slug = models.SlugField(max_length=250, unique_for_date='publish', blank=True)

    # FIX: Use settings.AUTH_USER_MODEL instead of User directly
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blog_posts'
    )

    cover_image = models.ImageField(upload_to='blog/covers/%Y/%m/%d/', blank=True, null=True)

    publish = models.DateTimeField(default=timezone.now)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    status = models.CharField(max_length=2, choices=Status.choices, default=Status.DRAFT)

    # SEO Fields
    meta_description = models.CharField(max_length=160, blank=True)
    meta_description_en = models.CharField(max_length=160, blank=True, null=True)

    # Analytics
    view_count = models.PositiveIntegerField(default=0)
    
    # Like/Dislike counts
    likes_count = models.PositiveIntegerField(default=0)
    dislikes_count = models.PositiveIntegerField(default=0)

    # Tags
    tags = TaggableManager()

    class Meta:
        ordering = ['-publish']
        indexes = [
            models.Index(fields=['-publish']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f'Comment by {self.author.username} on {self.post.title}'


class UserVote(models.Model):
    """Track user votes on posts"""
    class VoteType(models.TextChoices):
        LIKE = 'like', 'Like'
        DISLIKE = 'dislike', 'Dislike'
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='user_votes')
    vote_type = models.CharField(max_length=10, choices=VoteType.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'post']
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user.username} - {self.vote_type} on {self.post.title}'
