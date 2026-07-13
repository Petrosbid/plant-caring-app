import React, { useState } from "react";
import { View, TouchableOpacity, Alert, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  LogIn,
  User,
  Lock,
  Phone,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { Motion as _Motion } from "@legendapp/motion";

const MotionL = _Motion as any;
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { AppText as Text } from "../components/common/AppText";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../types/navigation";
import {
  AuthScreenLayout,
  AuthErrorBanner,
  AuthDivider,
} from "../components/auth/AuthScreenLayout";
import { AuthMethodTabs } from "../components/auth/AuthMethodTabs";
import { OtpInput } from "../components/auth/OtpInput";
import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";

type LoginMethod = "password" | "otp";

const LoginScreen = () => {
  const { i18n } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, requestOtpCode, loginWithOtp, loginWithGoogle } = useAuth();
  const isEn = i18n.language === "en";

  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetOtpFlow = () => {
    setOtpSent(false);
    setOtpCode("");
    setPhoneNumber("");
  };

  const handleMethodChange = (method: LoginMethod) => {
    setLoginMethod(method);
    setError(null);
    resetOtpFlow();
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      setError(
        isEn
          ? "Failed to log in with Google"
          : "ورود با گوگل با خطا مواجه شد",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!username.trim() || !password) {
      setError(
        isEn ? "Please fill all fields" : "لطفاً تمام فیلدها را پر کنید",
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login({ username: username.trim(), password });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : isEn
            ? "Invalid credentials"
            : "نام کاربری یا رمز عبور اشتباه است";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setError(
        isEn
          ? "Please enter your phone number"
          : "لطفاً شماره تلفن خود را وارد کنید",
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await requestOtpCode(phoneNumber.trim());
      setOtpSent(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isEn
            ? "Failed to send OTP"
            : "ارسال کد ناموفق بود",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) {
      setError(
        isEn ? "Please enter the 6-digit code" : "لطفاً کد ۶ رقمی را وارد کنید",
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await loginWithOtp(phoneNumber.trim(), otpCode);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isEn
            ? "Invalid code"
            : "کد نامعتبر است",
      );
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <View className="flex-row justify-center gap-2">
      <Text className="text-slate-500 dark:text-slate-400">
        {isEn ? "Don't have an account?" : "حساب کاربری ندارید؟"}
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text className="text-brand-600 dark:text-brand-400 font-bold">
          {isEn ? "Sign Up" : "ثبت‌نام"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <AuthScreenLayout
      accent="brand"
      icon={<LogIn size={40} color="white" />}
      title={isEn ? "Welcome Back" : "خوش آمدید"}
      subtitle={
        isEn
          ? "Sign in to your Verna plant care dashboard"
          : "به داشبورد مراقبت از گیاهان ورنا وارد شوید"
      }
      footer={footer}
    >
      <AuthErrorBanner message={error ?? ""} />

      <AuthMethodTabs
        options={[
          { id: "password", labelEn: "Password", labelFa: "رمز عبور" },
          { id: "otp", labelEn: "OTP Code", labelFa: "کد یکبارمصرف" },
        ]}
        active={loginMethod}
        onChange={handleMethodChange}
        isEn={isEn}
        className="mb-6"
      />

      {loginMethod === "password" ? (
        <MotionL.View
          key="password-form"
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Input
            label={isEn ? "Username" : "نام کاربری"}
            placeholder={
              isEn ? "Enter username" : "نام کاربری خود را وارد کنید"
            }
            value={username}
            onChangeText={setUsername}
            leftIcon={<User size={20} color="#94a3b8" />}
            autoCapitalize="none"
            autoComplete="username"
          />
          <Input
            label={isEn ? "Password" : "رمز عبور"}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            leftIcon={<Lock size={20} color="#94a3b8" />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#94a3b8" />
                ) : (
                  <Eye size={20} color="#94a3b8" />
                )}
              </TouchableOpacity>
            }
            secureTextEntry={!showPassword}
            autoComplete="password"
          />
          <TouchableOpacity className="self-end mb-5">
            <Text className="text-brand-600 dark:text-brand-400 font-bold text-sm">
              {isEn ? "Forgot Password?" : "فراموشی رمز عبور؟"}
            </Text>
          </TouchableOpacity>
          <Button
            variant="primary"
            size="lg"
            isLoading={loading}
            onPress={handlePasswordLogin}
          >
            <Text>{isEn ? "Sign In" : "ورود"}</Text>
          </Button>
        </MotionL.View>
      ) : (
        <MotionL.View
          key="otp-form"
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Input
            label={isEn ? "Phone Number" : "شماره تلفن"}
            placeholder={isEn ? "09xxxxxxxxx" : "۰۹xxxxxxxxx"}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            leftIcon={<Phone size={20} color="#94a3b8" />}
            keyboardType="phone-pad"
            editable={!otpSent}
            autoComplete="tel"
          />

          {!otpSent ? (
            <Button
              variant="primary"
              size="lg"
              isLoading={loading}
              onPress={handleSendOtp}
            >
              <Text>{isEn ? "Send Verification Code" : "ارسال کد تایید"}</Text>
            </Button>
          ) : (
            <View>
              <Text className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
                {isEn
                  ? `Code sent to ${phoneNumber}`
                  : `کد به ${phoneNumber} ارسال شد`}
              </Text>
              <OtpInput
                value={otpCode}
                onChange={setOtpCode}
                isEn={isEn}
                error={error && otpCode.length > 0 ? error : undefined}
              />
              <View className="flex-row gap-3 mt-6">
                <View className="flex-1">
                  <Button
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    onPress={handleVerifyOtp}
                    disabled={otpCode.length < 6}
                  >
                    <Text>{isEn ? "Verify & Login" : "تایید و ورود"}</Text>
                  </Button>
                </View>
                <Pressable
                  onPress={() => {
                    resetOtpFlow();
                    setError(null);
                  }}
                  className="flex-1 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-600 items-center justify-center flex-row gap-1"
                >
                  <ArrowLeft size={18} color="#64748b" />
                  <Text className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {isEn ? "Back" : "بازگشت"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </MotionL.View>
      )}

      <AuthDivider isEn={isEn} />
      <GoogleSignInButton
        onPress={handleGoogleSignIn}
        isEn={isEn}
        disabled={loading}
      />
    </AuthScreenLayout>
  );
};

export default LoginScreen;
