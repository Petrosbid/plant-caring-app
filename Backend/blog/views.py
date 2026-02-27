# blog/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied
from django.db.models import Count
from .models import Post, Comment, UserVote
from .serializers import PostListSerializer, PostDetailSerializer, CommentSerializer

class PostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A ViewSet for listing and retrieving blog posts.
    """
    queryset = Post.objects.filter(status=Post.Status.PUBLISHED).annotate(
        comments_count=Count('comments')
    )
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'list':
            return PostListSerializer
        return PostDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count on retrieval
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='like', permission_classes=[IsAuthenticatedOrReadOnly])
    def like(self, request, *args, **kwargs):
        """Handle like action"""
        post = self.get_object()
        
        if not request.user.is_authenticated:
            raise PermissionDenied("You must be logged in to like posts.")
        
        # Check if user already liked
        existing_vote = UserVote.objects.filter(user=request.user, post=post).first()
        
        if existing_vote:
            if existing_vote.vote_type == UserVote.VoteType.LIKE:
                # Unlike
                existing_vote.delete()
                post.likes_count = max(0, post.likes_count - 1)
            else:
                # Change from dislike to like
                existing_vote.vote_type = UserVote.VoteType.LIKE
                existing_vote.save()
                post.likes_count += 1
                post.dislikes_count = max(0, post.dislikes_count - 1)
        else:
            # New like
            UserVote.objects.create(user=request.user, post=post, vote_type=UserVote.VoteType.LIKE)
            post.likes_count += 1
        
        post.save(update_fields=['likes_count', 'dislikes_count'])
        
        return Response({
            'likes_count': post.likes_count,
            'dislikes_count': post.dislikes_count,
            'user_has_liked': True,
            'user_has_disliked': False,
        })

    @action(detail=True, methods=['post'], url_path='dislike', permission_classes=[IsAuthenticatedOrReadOnly])
    def dislike(self, request, *args, **kwargs):
        """Handle dislike action"""
        post = self.get_object()
        
        if not request.user.is_authenticated:
            raise PermissionDenied("You must be logged in to dislike posts.")
        
        # Check if user already disliked
        existing_vote = UserVote.objects.filter(user=request.user, post=post).first()
        
        if existing_vote:
            if existing_vote.vote_type == UserVote.VoteType.DISLIKE:
                # Remove dislike
                existing_vote.delete()
                post.dislikes_count = max(0, post.dislikes_count - 1)
            else:
                # Change from like to dislike
                existing_vote.vote_type = UserVote.VoteType.DISLIKE
                existing_vote.save()
                post.dislikes_count += 1
                post.likes_count = max(0, post.likes_count - 1)
        else:
            # New dislike
            UserVote.objects.create(user=request.user, post=post, vote_type=UserVote.VoteType.DISLIKE)
            post.dislikes_count += 1
        
        post.save(update_fields=['likes_count', 'dislikes_count'])
        
        return Response({
            'likes_count': post.likes_count,
            'dislikes_count': post.dislikes_count,
            'user_has_liked': False,
            'user_has_disliked': True,
        })

    @action(detail=True, methods=['get', 'post'], url_path='comments', permission_classes=[IsAuthenticatedOrReadOnly])
    def comments(self, request, *args, **kwargs):
        """Get all comments for a post or add a new comment"""
        post = self.get_object()
        
        if request.method == 'POST':
            if not request.user.is_authenticated:
                raise PermissionDenied("You must be logged in to comment.")
            
            content = request.data.get('content')
            if not content:
                return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            comment = Comment.objects.create(post=post, author=request.user, content=content)
            serializer = CommentSerializer(comment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # GET request - return all comments
        comments = post.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='latest')
    def latest_posts(self, request):
        """
        An endpoint to get the 5 latest published posts.
        """
        latest = self.get_queryset().order_by('-publish')[:5]
        serializer = PostListSerializer(latest, many=True, context={'request': request})
        return Response(serializer.data)
