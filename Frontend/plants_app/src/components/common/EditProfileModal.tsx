import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  useWindowDimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, User, Phone, Mail, Fingerprint, Calendar, Info, Lock, AtSign } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from './Button';
import { Input } from './Input';
import { User as UserType, ProfileUpdateInput } from '../../types';
import { cn } from '../../utils/cn';

const SHEET_HEIGHT_RATIO = 0.92;

const emptyForm = (user: UserType) => ({
  username: user.username || '',
  email: user.email || '',
  first_name: user.first_name || '',
  last_name: user.last_name || '',
  phone_number: user.phone ?? user.phone_number ?? '',
  bio: user.bio || '',
  national_code: user.national_code || '',
  birth_date: user.birth_date || '',
  gender: user.gender || '',
  current_password: '',
  new_password: '',
  confirm_password: '',
});

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileUpdateInput) => Promise<void>;
  user: UserType;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  user,
}) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetHeight = Math.round(screenHeight * SHEET_HEIGHT_RATIO);

  const [formData, setFormData] = useState(() => emptyForm(user));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setFormData(emptyForm(user));
    }
  }, [isVisible, user]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.username.trim()) {
      Alert.alert(
        isEn ? 'Error' : 'خطا',
        isEn ? 'Username is required' : 'نام کاربری الزامی است',
      );
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert(
        isEn ? 'Error' : 'خطا',
        isEn ? 'Email is required' : 'ایمیل الزامی است',
      );
      return;
    }

    try {
      setLoading(true);
      const payload: ProfileUpdateInput = { ...formData };

      if (!formData.new_password) {
        delete payload.current_password;
        delete payload.new_password;
        delete payload.confirm_password;
      } else if (formData.new_password !== formData.confirm_password) {
        Alert.alert(
          isEn ? 'Error' : 'خطا',
          isEn ? 'Passwords do not match' : 'رمزهای عبور یکسان نیستند',
        );
        setLoading(false);
        return;
      }

      await onSubmit(payload);
      onClose();
      Alert.alert(
        isEn ? 'Success' : 'موفق',
        isEn ? 'Profile updated successfully' : 'پروفایل با موفقیت بروزرسانی شد',
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : isEn
            ? 'Failed to update profile'
            : 'خطا در بروزرسانی پروفایل';
      Alert.alert(isEn ? 'Error' : 'خطا', message);
    } finally {
      setLoading(false);
    }
  };

  const genderOptions: { value: string; label: string }[] = [
    { value: 'M', label: isEn ? 'Male' : 'مرد' },
    { value: 'F', label: isEn ? 'Female' : 'زن' },
    { value: 'O', label: isEn ? 'Other' : 'دیگر' },
  ];

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={isEn ? 'Close' : 'بستن'}
        />

        <View
          className="bg-white dark:bg-slate-900 rounded-t-[32px] shadow-2xl overflow-hidden"
          style={{
            height: sheetHeight,
            paddingBottom: Math.max(insets.bottom, 12),
          }}
        >
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={80}
              tint="default"
              className="absolute inset-0"
              pointerEvents="none"
            />
          )}

          <View className="flex-1 px-6 pt-6">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-1 pe-3">
                <Text className="text-2xl font-black text-slate-900 dark:text-white">
                  {isEn ? 'Edit Profile' : 'ویرایش پروفایل'}
                </Text>
                <Text className="text-slate-400 text-xs font-semibold mt-1">
                  {isEn
                    ? 'Update your account details'
                    : 'اطلاعات حساب کاربری را ویرایش کنید'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-2xl items-center justify-center"
              >
                <X size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              <Text className="text-[10px] font-black text-brand-600 uppercase tracking-[2px] mb-3">
                {isEn ? 'Account' : 'حساب'}
              </Text>

              <Input
                label={isEn ? 'Username' : 'نام کاربری'}
                value={formData.username}
                onChangeText={(v) => handleChange('username', v)}
                autoCapitalize="none"
                leftIcon={<AtSign size={18} color="#94a3b8" />}
              />
              <Input
                label={isEn ? 'Email' : 'ایمیل'}
                value={formData.email}
                onChangeText={(v) => handleChange('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color="#94a3b8" />}
              />

              <Text className="text-[10px] font-black text-brand-600 uppercase tracking-[2px] mb-3 mt-2">
                {isEn ? 'Basic Info' : 'اطلاعات پایه'}
              </Text>

              <View className="flex-row gap-3">
                <Input
                  label={isEn ? 'First Name' : 'نام'}
                  value={formData.first_name}
                  onChangeText={(v) => handleChange('first_name', v)}
                  containerClassName="flex-1 mb-4"
                  leftIcon={<User size={18} color="#94a3b8" />}
                />
                <Input
                  label={isEn ? 'Last Name' : 'نام خانوادگی'}
                  value={formData.last_name}
                  onChangeText={(v) => handleChange('last_name', v)}
                  containerClassName="flex-1 mb-4"
                />
              </View>

              <Input
                label={isEn ? 'Phone Number' : 'شماره تلفن'}
                value={formData.phone_number}
                onChangeText={(v) => handleChange('phone_number', v)}
                keyboardType="phone-pad"
                leftIcon={<Phone size={18} color="#94a3b8" />}
              />

              <Input
                label={isEn ? 'National Code' : 'کد ملی'}
                value={formData.national_code}
                onChangeText={(v) => handleChange('national_code', v)}
                keyboardType="numeric"
                leftIcon={<Fingerprint size={18} color="#94a3b8" />}
              />

              <Input
                label={isEn ? 'Birth Date' : 'تاریخ تولد'}
                value={formData.birth_date}
                onChangeText={(v) => handleChange('birth_date', v)}
                placeholder="YYYY-MM-DD"
                leftIcon={<Calendar size={18} color="#94a3b8" />}
              />

              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ms-1">
                {isEn ? 'Gender' : 'جنسیت'}
              </Text>
              <View className="flex-row gap-2 mb-4">
                {genderOptions.map(({ value, label }) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => handleChange('gender', value)}
                    className={cn(
                      'flex-1 h-11 rounded-2xl items-center justify-center border',
                      formData.gender === value
                        ? 'bg-brand-500 border-brand-500'
                        : 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700',
                    )}
                  >
                    <Text
                      className={cn(
                        'font-bold text-sm',
                        formData.gender === value ? 'text-white' : 'text-slate-500',
                      )}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label={isEn ? 'Bio' : 'بیوگرافی'}
                value={formData.bio}
                onChangeText={(v) => handleChange('bio', v)}
                multiline
                numberOfLines={3}
                style={{ height: 88, textAlignVertical: 'top' }}
                leftIcon={<Info size={18} color="#94a3b8" />}
              />

              <Text className="text-[10px] font-black text-red-500 uppercase tracking-[2px] mt-4 mb-3">
                {isEn ? 'Security' : 'امنیت'}
              </Text>

              <Input
                label={isEn ? 'New Password' : 'رمز عبور جدید'}
                value={formData.new_password}
                onChangeText={(v) => handleChange('new_password', v)}
                secureTextEntry
                leftIcon={<Lock size={18} color="#94a3b8" />}
              />
              <Input
                label={isEn ? 'Confirm Password' : 'تکرار رمز عبور'}
                value={formData.confirm_password}
                onChangeText={(v) => handleChange('confirm_password', v)}
                secureTextEntry
              />
            </ScrollView>

            <View className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="primary"
                size="lg"
                isLoading={loading}
                onPress={handleSubmit}
                className="rounded-2xl h-14"
              >
                <Text className="text-white font-black text-base">
                  {isEn ? 'Save Changes' : 'ذخیره تغییرات'}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
