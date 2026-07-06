from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import IntegrityError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import OTPCode
from .serializers import (
    OTPVerifySerializer,
    PhoneSerializer,
    ProfilePictureSerializer,
    RegisterInitEmailSerializer,
    RegisterInitPhoneSerializer,
    RegisterVerifySerializer,
    UserSerializer,
)
from .services import (
    SmsIrService,
    generate_otp_code,
    send_or_simulate_otp_email,
    send_or_simulate_phone_otp,
)
from .utils import normalize_phone_number

User = get_user_model()
sms_service = SmsIrService()


class UserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]


@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response(
            {"detail": "Successfully logged out."}, status=status.HTTP_200_OK
        )
    except Exception:
        return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        serializer = UserSerializer(
            user, data=request.data, partial=False, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(
            user, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfilePictureView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request):
        user = request.user
        serializer = ProfilePictureSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user, context={"request": request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response(
            {"detail": "Account deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class RequestOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "otp_request"

    def post(self, request):
        serializer = PhoneSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        phone_number = serializer.validated_data["phone_number"]
        print(phone_number)
        try:
            user = User.objects.get(phone=phone_number)
        except User.DoesNotExist:
            return Response(
                {"error": "کاربری با این شماره تلفن یافت نشد."},
                status=status.HTTP_404_NOT_FOUND,
            )

        OTPCode.objects.filter(user=user, is_used=False).delete()

        otp_code = generate_otp_code()
        otp_instance = OTPCode(user=user, code=otp_code)
        otp_instance.save()

        try:
            otp_result = send_or_simulate_phone_otp(
                phone_number, otp_code, sms_service=sms_service
            )
            payload = {"message": "کد تایید با موفقیت ارسال شد."}
            if otp_result.get("simulated"):
                payload["simulated_otp"] = otp_code
            return Response(payload, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        phone_number = serializer.validated_data["phone_number"]
        code = serializer.validated_data["code"]

        try:
            user = User.objects.get(phone=phone_number)
        except User.DoesNotExist:
            return Response(
                {"error": "کاربری با این شماره تلفن یافت نشد."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            otp_record = OTPCode.objects.get(user=user, code=code, is_used=False)
        except OTPCode.DoesNotExist:
            return Response(
                {"error": "کد نامعتبر است."}, status=status.HTTP_400_BAD_REQUEST
            )

        if not otp_record.is_valid():
            return Response(
                {"error": "کد منقضی شده است."}, status=status.HTTP_400_BAD_REQUEST
            )

        otp_record.is_used = True
        otp_record.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        return Response(
            {"access": access_token, "refresh": refresh_token},
            status=status.HTTP_200_OK,
        )


class RegisterRequestOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "otp_request"

    def post(self, request):
        method = request.data.get("method")  # 'phone' or 'email'
        if method == "phone":
            serializer = RegisterInitPhoneSerializer(data=request.data)
        elif method == "email":
            serializer = RegisterInitEmailSerializer(data=request.data)
        else:
            return Response({"error": "Invalid method"}, status=400)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        data = serializer.validated_data
        identifier = data.get("phone") or data.get("email")
        otp_code = generate_otp_code()

        OTPCode.objects.filter(
            phone=identifier if method == "phone" else None,
            email=identifier if method == "email" else None,
            purpose="register",
            is_used=False,
        ).delete()

        temp_reg_data = {
            "method": method,
            "identifier": identifier,
            "first_name": data.get("first_name", ""),
            "last_name": data.get("last_name", ""),
            "username": data.get("username"),
            "password": data.get("password"),
        }

        # Keep session behavior, and also cache by identifier to support clients
        # without cookie persistence (and avoid hard failure if session backend fails).
        try:
            request.session["temp_reg_data"] = temp_reg_data
            request.session.modified = True
        except Exception:
            pass

        cache.set(f"temp_reg_data:{identifier}", temp_reg_data, timeout=10 * 60)
        if isinstance(identifier, str):
            cache.set(
                f"temp_reg_data:{identifier.lower()}", temp_reg_data, timeout=10 * 60
            )

        # ذخیره کد در دیتابیس
        otp = OTPCode(
            phone=identifier if method == "phone" else None,
            email=identifier if method == "email" else None,
            code=otp_code,
            type=method,
            purpose="register",
        )
        otp.save()

        # ارسال کد
        try:
            if method == "phone":
                otp_result = send_or_simulate_phone_otp(identifier, otp_code)
            else:
                otp_result = send_or_simulate_otp_email(identifier, otp_code)
        except Exception as e:
            otp.delete()
            return Response({"error": str(e)}, status=500)

        payload = {"message": "OTP sent successfully"}
        if otp_result.get("simulated"):
            payload["simulated_otp"] = otp_code

        return Response(payload, status=200)


class RegisterVerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        identifier = serializer.validated_data["identifier"]
        code = serializer.validated_data["code"]

        # Build candidate identifiers to handle formatting differences
        candidates = [identifier]
        lowered_identifier = identifier.lower()
        if lowered_identifier not in candidates:
            candidates.append(lowered_identifier)
        try:
            normalized_phone = normalize_phone_number(identifier)
            if normalized_phone not in candidates:
                candidates.append(normalized_phone)
        except ValueError:
            pass

        # بازیابی اطلاعات موقت: session first, then cache fallback
        temp_data = request.session.get("temp_reg_data")
        if not temp_data or temp_data.get("identifier") not in candidates:
            temp_data = None
            for candidate in candidates:
                temp_data = cache.get(f"temp_reg_data:{candidate}")
                if temp_data:
                    break

        if not temp_data:
            return Response({"error": "No pending registration found"}, status=400)

        resolved_identifier = temp_data.get("identifier", identifier)

        # یافتن کد
        filter_kwargs = {"code": code, "purpose": "register", "is_used": False}
        if temp_data["method"] == "phone":
            filter_kwargs["phone"] = resolved_identifier
        else:
            filter_kwargs["email"] = resolved_identifier

        try:
            otp = OTPCode.objects.get(**filter_kwargs)
        except OTPCode.DoesNotExist:
            return Response({"error": "Invalid or expired code"}, status=400)

        if not otp.is_valid():
            return Response({"error": "Code expired"}, status=400)

        # Prefer password sent at verify step, fallback to temp data (for compatibility)
        password = serializer.validated_data.get("password") or temp_data.get(
            "password"
        )

        if temp_data["method"] == "phone":
            user_phone = resolved_identifier
            user_email = f"phone_{user_phone.replace('+', '')}@otp.local"
        else:
            user_phone = ""
            user_email = resolved_identifier

        # Final safety checks to avoid IntegrityError (e.g. race conditions / old temp data)
        if User.objects.filter(username=temp_data["username"]).exists():
            return Response({"error": "Username already taken."}, status=400)
        if user_phone and User.objects.filter(phone=user_phone).exists():
            return Response({"error": "Phone number already registered."}, status=400)
        if User.objects.filter(email=user_email).exists():
            return Response({"error": "Email already registered."}, status=400)

        try:
            user = User.objects.create_user(
                username=temp_data["username"],
                phone=user_phone,
                email=user_email,
                first_name=temp_data.get("first_name", ""),
                last_name=temp_data.get("last_name", ""),
                password=password,
            )
        except IntegrityError:
            return Response(
                {"error": "User already exists with provided data."}, status=400
            )

        if not password:
            user.set_unusable_password()
            user.save()

        otp.is_used = True
        otp.user = user
        otp.save()

        try:
            if "temp_reg_data" in request.session:
                del request.session["temp_reg_data"]
        except Exception:
            pass
        for candidate in candidates:
            cache.delete(f"temp_reg_data:{candidate}")
        cache.delete(f"temp_reg_data:{resolved_identifier}")

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        return Response(
            {
                "access": access_token,
                "refresh": refresh_token,
                "user": UserSerializer(user, context={"request": request}).data,
            },
            status=200,
        )
