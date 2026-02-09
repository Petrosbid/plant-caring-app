from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from .serializers import UserSerializer


class UserRegistrationView(APIView):
    """
    API view for user registration.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    """
    API view for user login.
    Returns JWT tokens upon successful authentication.
    """
    permission_classes = [AllowAny]


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """
    API view for user logout.
    Blacklists the refresh token to invalidate it.
    """
    try:
        refresh_token = request.data.get('refresh')

        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()

        return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """
    API view for retrieving and updating user profile information.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)