from .views import UserRegistrationView, LoginView, logout_view, UserProfileView
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', LoginView.as_view(), name='user-login'),
    path('logout/', logout_view, name='user-logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('ckeditor/', include('ckeditor_uploader.urls')),
    path('api/blog/', include('blog.urls')),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
