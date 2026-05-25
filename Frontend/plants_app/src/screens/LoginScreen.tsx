import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { LogIn, User, Lock, ArrowRight } from 'lucide-react-native';
import { Motion } from '@legendapp/motion';

const LoginScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login } = useAuth();
  const isEn = i18n.language === 'en';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(isEn ? "Error" : "خطا", isEn ? "Please fill all fields" : "لطفاً تمام فیلدها را پر کنید");
      return;
    }

    setLoading(true);
    try {
      await login({ username, password });
      // Navigation will be handled by RootNavigator state change
    } catch (err: any) {
      Alert.alert(isEn ? "Login Failed" : "ورود ناموفق", err.message || (isEn ? "Invalid credentials" : "نام کاربری یا رمز عبور اشتباه است"));
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
          <View className="items-center mb-10">
            <Motion.View 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-brand-500 rounded-3xl items-center justify-center shadow-xl shadow-brand-500/40 mb-6"
            >
              <LogIn size={40} color="white" />
            </Motion.View>
            <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2">
              {isEn ? "Welcome Back" : "خوش آمدید"}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400">
              {isEn ? "Login to your Verna account" : "برای ورود به حساب کاربری ورنا وارد شوید"}
            </Text>
          </View>

          <Card className="p-6">
            <Input
              label={isEn ? "Username" : "نام کاربری"}
              placeholder={isEn ? "Enter username" : "نام کاربری خود را وارد کنید"}
              value={username}
              onChangeText={setUsername}
              leftIcon={<User size={20} color="#94a3b8" />}
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

            <TouchableOpacity className="self-end mb-6">
              <Text className="text-brand-600 dark:text-brand-400 font-bold text-sm">
                {isEn ? "Forgot Password?" : "فراموشی رمز عبور؟"}
              </Text>
            </TouchableOpacity>

            <Button 
              variant="primary" 
              size="lg" 
              isLoading={loading}
              onPress={handleLogin}
            >
              <Text className="text-white font-bold mr-2">{isEn ? "Login" : "ورود"}</Text>
              <ArrowRight size={20} color="white" className={isEn ? "" : "rotate-180"} />
            </Button>
          </Card>

          <View className="flex-row justify-center mt-8 gap-2">
            <Text className="text-slate-500 dark:text-slate-400">
              {isEn ? "Don't have an account?" : "حساب کاربری ندارید؟"}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text className="text-brand-600 dark:text-brand-400 font-bold">
                {isEn ? "Sign Up" : "ثبت‌نام"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default LoginScreen;
