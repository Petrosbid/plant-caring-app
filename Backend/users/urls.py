from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    UserRegistrationView,
    LoginView,
    logout_view,
    UserProfileView,
    UserProfilePictureView,
    UserDeleteView, VerifyOTPView, RequestOTPView, RegisterVerifyOTPView, RegisterRequestOTPView,
    GoogleLoginView, GoogleCallbackView,
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', LoginView.as_view(), name='user-login'),
    path('logout/', logout_view, name='user-logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/picture/', UserProfilePictureView.as_view(), name='user-profile-picture'),
    path('profile/delete/', UserDeleteView.as_view(), name='user-delete'),
    
    # Google OAuth
    path('google/login/', GoogleLoginView.as_view(), name='google-login'),
    path('google/callback', GoogleCallbackView.as_view(), name='google-callback'),
    path('google/callback/', GoogleCallbackView.as_view()),
    
    path('ckeditor/', include('ckeditor_uploader.urls')),
    path('api/blog/', include('blog.urls')),
    path('api/otp/request/', RequestOTPView.as_view(), name='otp-request'),
    path('api/otp/verify/', VerifyOTPView.as_view(), name='otp-verify'),
    path('api/register/otp/request/', RegisterRequestOTPView.as_view(), name='register-otp-request'),
    path('api/register/otp/verify/', RegisterVerifyOTPView.as_view(), name='register-otp-verify'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)