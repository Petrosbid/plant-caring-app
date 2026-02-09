from django.urls import path
from .views import UserRegistrationView, LoginView, logout_view, UserProfileView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', LoginView.as_view(), name='user-login'),
    path('logout/', logout_view, name='user-logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]
