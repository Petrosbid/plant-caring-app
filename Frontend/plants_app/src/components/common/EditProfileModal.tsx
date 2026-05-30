import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, User, Phone, Mail, Fingerprint, Calendar, Info, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Motion as _Motion } from '@legendapp/motion';
import { Button } from './Button';
import { Input } from './Input';
import { User as UserType } from '../../types';
import { cn } from '../../utils/cn';

const MotionL = _Motion as any;

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
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

  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone_number: user.phone_number || '',
    bio: user.bio || '',
    national_code: (user as any).national_code || '',
    birth_date: (user as any).birth_date || '',
    gender: (user as any).gender || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = { ...formData };
      
      // Clean up password fields if not changing password
      if (!formData.new_password) {
        delete (payload as any).current_password;
        delete (payload as any).new_password;
        delete (payload as any).confirm_password;
      } else if (formData.new_password !== formData.confirm_password) {
        Alert.alert(isEn ? "Error" : "خطا", isEn ? "Passwords do not match" : "رمزهای عبور یکسان نیستند");
        setLoading(false);
        return;
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      Alert.alert(isEn ? "Error" : "خطا", err.message || (isEn ? "Failed to update profile" : "خطا در بروزرسانی پروفایل"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />

        <MotionL.View
          initial={{ y: 800 }}
          animate={{ y: 0 }}
          exit={{ y: 800 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="bg-white dark:bg-slate-900 rounded-t-[50px] shadow-2xl overflow-hidden"
          style={{ maxHeight: '92%' }}
        >
          {Platform.OS === 'ios' && (
            <BlurView intensity={90} tint="default" className="absolute inset-0" />
          )}

          <View className="p-8">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-3xl font-black text-slate-900 dark:text-white">
                  {isEn ? "Edit Profile" : "ویرایش پروفایل"}
                </Text>
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  Update your personal details
                </Text>
              </View>
              <TouchableOpacity 
                onPress={onClose}
                className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl items-center justify-center border border-slate-50 dark:border-slate-700"
              >
                <X size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
              
              <Text className="text-[10px] font-black text-brand-600 uppercase tracking-[2px] mb-4 ml-1">Basic Info</Text>
              
              <View className="flex-row gap-4 mb-2">
                <Input
                  label={isEn ? "First Name" : "نام"}
                  value={formData.first_name}
                  onChangeText={(v) => handleChange('first_name', v)}
                  containerStyle={{ flex: 1 }}
                  leftIcon={<User size={18} color="#94a3b8" />}
                />
                <Input
                  label={isEn ? "Last Name" : "نام خانوادگی"}
                  value={formData.last_name}
                  onChangeText={(v) => handleChange('last_name', v)}
                  containerStyle={{ flex: 1 }}
                />
              </View>

              <Input
                label={isEn ? "Phone Number" : "شماره تلفن"}
                value={formData.phone_number}
                onChangeText={(v) => handleChange('phone_number', v)}
                keyboardType="phone-pad"
                leftIcon={<Phone size={18} color="#94a3b8" />}
              />

              <Input
                label={isEn ? "National Code" : "کد ملی"}
                value={formData.national_code}
                onChangeText={(v) => handleChange('national_code', v)}
                keyboardType="numeric"
                leftIcon={<Fingerprint size={18} color="#94a3b8" />}
              />

              <View className="flex-row gap-4 mb-2">
                <Input
                  label={isEn ? "Birth Date" : "تاریخ تولد"}
                  value={formData.birth_date}
                  onChangeText={(v) => handleChange('birth_date', v)}
                  placeholder="YYYY-MM-DD"
                  containerStyle={{ flex: 1 }}
                  leftIcon={<Calendar size={18} color="#94a3b8" />}
                />
                <View style={{ flex: 1 }}>
                    <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">
                        {isEn ? "Gender" : "جنسیت"}
                    </Text>
                    <View className="flex-row gap-2">
                        {['M', 'F'].map((g) => (
                            <TouchableOpacity
                                key={g}
                                onPress={() => handleChange('gender', g)}
                                className={cn(
                                    "flex-1 h-12 rounded-2xl items-center justify-center border",
                                    formData.gender === g 
                                        ? "bg-brand-500 border-brand-500" 
                                        : "bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700"
                                )}
                            >
                                <Text className={cn("font-bold", formData.gender === g ? "text-white" : "text-slate-500")}>
                                    {g === 'M' ? (isEn ? 'Male' : 'مرد') : (isEn ? 'Female' : 'زن')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
              </View>

              <Input
                label={isEn ? "Bio" : "بیوگرافی"}
                value={formData.bio}
                onChangeText={(v) => handleChange('bio', v)}
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
                leftIcon={<Info size={18} color="#94a3b8" />}
              />

              <Text className="text-[10px] font-black text-red-500 uppercase tracking-[2px] mt-6 mb-4 ml-1">Security</Text>
              
              <Input
                label={isEn ? "Current Password" : "رمز عبور فعلی"}
                value={formData.current_password}
                onChangeText={(v) => handleChange('current_password', v)}
                secureTextEntry
                leftIcon={<Lock size={18} color="#94a3b8" />}
              />
              <Input
                label={isEn ? "New Password" : "رمز عبور جدید"}
                value={formData.new_password}
                onChangeText={(v) => handleChange('new_password', v)}
                secureTextEntry
                leftIcon={<Lock size={18} color="#94a3b8" />}
              />
              <Input
                label={isEn ? "Confirm New Password" : "تکرار رمز عبور جدید"}
                value={formData.confirm_password}
                onChangeText={(v) => handleChange('confirm_password', v)}
                secureTextEntry
              />

            </ScrollView>

            {/* Footer */}
            <View className="absolute bottom-0 left-0 right-0 p-8 bg-white/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800">
              <Button 
                variant="primary" 
                size="lg" 
                isLoading={loading}
                onPress={handleSubmit}
                className="rounded-[24px] h-16 shadow-xl shadow-brand-500/30"
              >
                <Text className="text-white font-black text-lg">{isEn ? "Save Profile" : "ذخیره پروفایل"}</Text>
              </Button>
            </View>
          </View>
        </MotionL.View>
      </View>
    </Modal>
  );
};
