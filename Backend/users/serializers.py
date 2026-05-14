from rest_framework import serializers
from .utils import normalize_phone_number
from .models import CustomUser, OTPCode

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration, profile retrieval and updates.
    Password is write-only and optional on updates.
    Profile picture is read-only in the JSON payload; use the dedicated upload endpoint.
    """
    password = serializers.CharField(write_only=True, required=False)
    profile_picture = serializers.ImageField(read_only=True)  # output URL, not for writing

    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'password', 'email',
            'first_name', 'last_name', 'bio', 'phone',
            'national_code', 'birth_date', 'gender', 'profile_picture'
        )
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if password:
            instance.set_password(password)
            instance.save()
        return instance


class ProfilePictureSerializer(serializers.ModelSerializer):
    """Serializer used exclusively for updating the profile picture."""
    class Meta:
        model = CustomUser
        fields = ('profile_picture',)


class PhoneSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)

    def validate_phone_number(self, value):
        try:
            normalized = normalize_phone_number(value)
        except ValueError as e:
            raise serializers.ValidationError(str(e))
        return normalized

class OTPVerifySerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)
    code = serializers.CharField(max_length=6)


class RegisterInitPhoneSerializer(serializers.Serializer):
    phone = serializers.CharField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField()

    def validate_phone(self, value):
        normalized = normalize_phone_number(value)
        if CustomUser.objects.filter(phone=normalized).exists():
            raise serializers.ValidationError("Phone number already registered.")
        return normalized

    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value


class RegisterInitEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField()

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value


class RegisterVerifySerializer(serializers.Serializer):
    identifier = serializers.CharField()  # phone or email
    code = serializers.CharField(max_length=6)
    purpose = serializers.CharField(default='register')