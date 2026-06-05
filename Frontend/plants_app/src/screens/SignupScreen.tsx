import React, { useState } from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  UserPlus,
  User,
  Mail,
  Phone,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { Motion as _Motion } from '@legendapp/motion';

const MotionL = _Motion as any;
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AppText as Text } from '../components/common/AppText';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types/navigation';
import {
  AuthScreenLayout,
  AuthErrorBanner,
  AuthDivider,
} from '../components/auth/AuthScreenLayout';
import { AuthMethodTabs } from '../components/auth/AuthMethodTabs';
import { OtpInput } from '../components/auth/OtpInput';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';

type SignupMethod = 'phone' | 'email';
type SignupStep = 'form' | 'verify';

const SignupScreen = () => {
  const { i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { registerWithPhoneOtp, registerWithEmailOtp, verifyRegisterOtp } = useAuth();
  const isEn = i18n.language === 'en';

  const [method, setMethod] = useState<SignupMethod>('phone');
  const [step, setStep] = useState<SignupStep>('form');
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleMethodChange = (next: SignupMethod) => {
    setMethod(next);
    setError(null);
  };

  const handleGoogleSignIn = () => {
    setError(
      isEn
        ? 'Google sign-up will be available in a future update.'
        : 'ثبت‌نام با گوگل در به‌روزرسانی بعدی فعال می‌شود.',
    );
  };

  const handleSendCode = async () => {
    if (!formData.username.trim()) {
      setError(isEn ? 'Username is required' : 'نام کاربری لازم است');
      return;
    }
    if (method === 'phone' && !formData.phone.trim()) {
      setError(isEn ? 'Phone number is required' : 'شماره تلفن لازم است');
      return;
    }
    if (method === 'email' && !formData.email.trim()) {
      setError(isEn ? 'Email is required' : 'ایمیل لازم است');
      return;
    }
    if (!formData.password) {
      setError(isEn ? 'Password is required' : 'رمز عبور لازم است');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const payload = {
        username: formData.username.trim(),
        first_name: formData.first_name.trim() || undefined,
        last_name: formData.last_name.trim() || undefined,
        password: formData.password,
      };
      if (method === 'phone') {
        await registerWithPhoneOtp({
          ...payload,
          phone: formData.phone.trim(),
        });
        setIdentifier(formData.phone.trim());
      } else {
        await registerWithEmailOtp({
          ...payload,
          email: formData.email.trim(),
        });
        setIdentifier(formData.email.trim());
      }
      setStep('verify');
      setCode('');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isEn
            ? 'Error sending code'
            : 'خطا در ارسال کد',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length < 6) {
      setError(isEn ? 'Please enter the 6-digit code' : 'لطفاً کد ۶ رقمی را وارد کنید');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await verifyRegisterOtp(identifier, code);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : isEn ? 'Invalid code' : 'کد نامعتبر',
      );
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <View className="flex-row justify-center gap-2 mb-6">
      <Text className="text-slate-500 dark:text-slate-400">
        {isEn ? 'Already have an account?' : 'قبلاً ثبت‌نام کرده‌اید؟'}
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text className="text-brand-600 dark:text-brand-400 font-bold">
          {isEn ? 'Sign In' : 'ورود'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <AuthScreenLayout
      accent="blue"
      icon={<UserPlus size={40} color="white" />}
      title={isEn ? 'Create Account' : 'ایجاد حساب کاربری'}
      subtitle={
        isEn
          ? 'Join the Verna community with a quick OTP verification'
          : 'با تایید سریع کد یکبارمصرف به جامعه ورنا بپیوندید'
      }
      footer={footer}
    >
      <AuthErrorBanner message={error ?? ''} />

      {step === 'form' ? (
        <MotionL.View
          key="signup-form"
          animate={{ opacity: 1, y: 0 }}
        >
          <AuthMethodTabs
            options={[
              { id: 'phone', labelEn: 'Via Phone', labelFa: 'با تلفن' },
              { id: 'email', labelEn: 'Via Email', labelFa: 'با ایمیل' },
            ]}
            active={method}
            onChange={handleMethodChange}
            isEn={isEn}
            className="mb-5"
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label={isEn ? 'First Name' : 'نام'}
                placeholder={isEn ? 'John' : 'نام'}
                value={formData.first_name}
                onChangeText={(v) => updateField('first_name', v)}
                containerClassName="mb-3"
              />
            </View>
            <View className="flex-1">
              <Input
                label={isEn ? 'Last Name' : 'نام خانوادگی'}
                placeholder={isEn ? 'Doe' : 'نام خانوادگی'}
                value={formData.last_name}
                onChangeText={(v) => updateField('last_name', v)}
                containerClassName="mb-3"
              />
            </View>
          </View>

          <Input
            label={isEn ? 'Username' : 'نام کاربری'}
            placeholder={isEn ? 'Pick a unique username' : 'نام کاربری یکتا'}
            value={formData.username}
            onChangeText={(v) => updateField('username', v)}
            leftIcon={<User size={20} color="#94a3b8" />}
            autoCapitalize="none"
          />

          <Input
            label={isEn ? 'Password' : 'رمز عبور'}
            placeholder="••••••••"
            value={formData.password}
            onChangeText={(v) => updateField('password', v)}
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
            autoComplete="password-new"
          />

          {method === 'phone' ? (
            <Input
              label={isEn ? 'Phone Number' : 'شماره تلفن'}
              placeholder={isEn ? '09xxxxxxxxx' : '۰۹xxxxxxxxx'}
              value={formData.phone}
              onChangeText={(v) => updateField('phone', v)}
              leftIcon={<Phone size={20} color="#94a3b8" />}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          ) : (
            <Input
              label={isEn ? 'Email' : 'ایمیل'}
              placeholder={isEn ? 'you@example.com' : 'ایمیل شما'}
              value={formData.email}
              onChangeText={(v) => updateField('email', v)}
              leftIcon={<Mail size={20} color="#94a3b8" />}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          )}

          <Button
            variant="blue"
            size="lg"
            isLoading={loading}
            onPress={handleSendCode}
            className="mt-2"
          >
            <Text>{isEn ? 'Send Verification Code' : 'ارسال کد تایید'}</Text>
          </Button>

          <AuthDivider isEn={isEn} />
          <GoogleSignInButton onPress={handleGoogleSignIn} isEn={isEn} disabled={loading} />
        </MotionL.View>
      ) : (
        <MotionL.View
          key="signup-verify"
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Text className="text-center text-slate-600 dark:text-slate-400 mb-5 text-sm">
            {isEn ? `Code sent to ${identifier}` : `کد به ${identifier} ارسال شد`}
          </Text>

          <OtpInput value={code} onChange={setCode} isEn={isEn} />

          <View className="mt-6">
            <Button
              variant="blue"
              size="lg"
              isLoading={loading}
              onPress={handleVerifyCode}
              disabled={code.length < 6}
            >
              <Text>{isEn ? 'Complete Registration' : 'تکمیل ثبت‌نام'}</Text>
            </Button>
          </View>

          <Pressable
            onPress={() => {
              setStep('form');
              setCode('');
              setError(null);
            }}
            className="mt-4 py-3 items-center"
          >
            <Text className="text-sm font-bold text-brand-600 dark:text-brand-400">
              {isEn ? 'Change phone or email' : 'تغییر شماره یا ایمیل'}
            </Text>
          </Pressable>
        </MotionL.View>
      )}
    </AuthScreenLayout>
  );
};

export default SignupScreen;
