import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { authService } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { UserPlus, User, Mail, Lock, CheckCircle } from 'lucide-react-native';
import { Motion } from '@legendapp/motion';

const SignupScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert(isEn ? "Error" : "خطا", isEn ? "Please fill all fields" : "لطفاً تمام فیلدها را پر کنید");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(isEn ? "Error" : "خطا", isEn ? "Passwords do not match" : "رمزهای عبور یکسان نیستند");
      return;
    }

    setLoading(true);
    try {
      await authService.register({ username, email, password });
      Alert.alert(
        isEn ? "Account Created" : "حساب کاربری ایجاد شد",
        isEn ? "You can now login with your credentials." : "اکنون می‌توانید با اطلاعات خود وارد شوید.",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
    } catch (err: any) {
      Alert.alert(isEn ? "Signup Failed" : "ثبت‌نام ناموفق", err.message || (isEn ? "An error occurred" : "خطایی رخ داده است"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper withScroll={false}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-4"
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="items-center mb-8 mt-10">
            <Motion.View 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-green-500 rounded-3xl items-center justify-center shadow-xl shadow-green-500/40 mb-6"
            >
              <UserPlus size={40} color="white" />
            </Motion.View>
            <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2">
              {isEn ? "Create Account" : "ایجاد حساب کاربری"}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400">
              {isEn ? "Join the Verna community" : "به جامعه ورنا بپیوندید"}
            </Text>
          </View>

          <Card className="p-6">
            <Input
              label={isEn ? "Username" : "نام کاربری"}
              placeholder={isEn ? "Pick a unique username" : "نام کاربری یکتا انتخاب کنید"}
              value={username}
              onChangeText={setUsername}
              leftIcon={<User size={20} color="#94a3b8" />}
              autoCapitalize="none"
            />
            <Input
              label={isEn ? "Email" : "ایمیل"}
              placeholder={isEn ? "your@email.com" : "ایمیل شما"}
              value={email}
              onChangeText={setEmail}
              leftIcon={<Mail size={20} color="#94a3b8" />}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label={isEn ? "Password" : "رمز عبور"}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock size={20} color="#94a3b8" />}
              secureTextEntry
            />
            <Input
              label={isEn ? "Confirm Password" : "تکرار رمز عبور"}
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              leftIcon={<CheckCircle size={20} color="#94a3b8" />}
              secureTextEntry
            />

            <Button 
              variant="success" 
              size="lg" 
              isLoading={loading}
              onPress={handleSignup}
              className="mt-4"
            >
              <Text className="text-white font-bold">{isEn ? "Register" : "ثبت‌نام"}</Text>
            </Button>
          </Card>

          <View className="flex-row justify-center mt-8 mb-10 gap-2">
            <Text className="text-slate-500 dark:text-slate-400">
              {isEn ? "Already have an account?" : "قبلاً ثبت‌نام کرده‌اید؟"}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-brand-600 dark:text-brand-400 font-bold">
                {isEn ? "Login" : "ورود"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default SignupScreen;
