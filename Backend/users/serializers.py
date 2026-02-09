from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user registration and profile updates."""
    password = serializers.CharField(write_only=True, required=False)  # Make password optional for updates

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'password', 'email', 'first_name', 'last_name', 'bio', 'phone')

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data.get('password'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            bio=validated_data.get('bio', ''),
            phone=validated_data.get('phone', '')
        )
        return user

    def update(self, instance, validated_data):
        # Handle password separately since it's write-only
        password = validated_data.pop('password', None)

        # Update all other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Save the instance
        instance.save()

        # Handle password update if provided
        if password:
            instance.set_password(password)
            instance.save()

        return instance
