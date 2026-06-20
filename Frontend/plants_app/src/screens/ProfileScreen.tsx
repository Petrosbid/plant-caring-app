import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Updates from 'expo-updates';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import {
  User,
  Mail,
  Phone,
  LogOut,
  Globe,
  Moon,
  ChevronRight,
  Calendar,
  Info,
  Pencil,
  Camera,
  Fingerprint,
  AtSign,
  Bell,
  Clock,
} from 'lucide-react-native';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/date';
import { ThemeTransition } from '../components/common/ThemeTransition';
import { EditProfileModal } from '../components/common/EditProfileModal';
import { authService } from '../services/api';
import { saveAppLanguage } from '../utils/storage';
import type { ProfileUpdateInput } from '../types';

const ProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';

  const [showEditModal, setShowEditModal] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username;

  const phoneDisplay = user?.phone ?? user?.phone_number ?? '—';

  const handleUpdateProfile = async (data: ProfileUpdateInput) => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
  };

  const toggleNotificationSetting = async (key: 'notify_reminders_exact' | 'notify_reminders_daily' | 'notify_reminders_tomorrow') => {
    if (!user) return;
    try {
      const nextValue = !user[key];
      const updated = await authService.updateProfile({
        [key]: nextValue,
      });
      setUser(updated);
    } catch (err: any) {
      Alert.alert(isEn ? 'Error' : 'خطا', err.message || 'Failed to update setting');
    }
  };

  const handleAvatarPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        isEn ? 'Permission required' : 'مجوز لازم است',
        isEn
          ? 'Please allow access to your photos.'
          : 'لطفاً دسترسی به گالری را فعال کنید.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    try {
      setAvatarLoading(true);
      const updated = await authService.updateProfilePicture(result.assets[0].uri);
      setUser(updated);
      Alert.alert(
        isEn ? 'Success' : 'موفق',
        isEn ? 'Profile photo updated' : 'عکس پروفایل بروزرسانی شد',
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : isEn
            ? 'Failed to update photo'
            : 'خطا در بروزرسانی عکس';
      Alert.alert(isEn ? 'Error' : 'خطا', message);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      isEn ? 'Logout' : 'خروج',
      isEn ? 'Are you sure you want to exit?' : 'آیا مطمئن هستید که می‌خواهید خارج شوید؟',
      [
        { text: isEn ? 'Cancel' : 'انصراف', style: 'cancel' },
        { text: isEn ? 'Exit' : 'خروج', style: 'destructive', onPress: logout },
      ],
    );
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'fa' : 'en';
    
    Alert.alert(
      isEn ? 'Change Language' : 'تغییر زبان',
      isEn 
        ? 'The app will restart to apply the language and layout changes.' 
        : 'برنامه برای اعمال تغییرات زبان و چیدمان مجدداً راه‌اندازی خواهد شد.',
      [
        { text: isEn ? 'Cancel' : 'انصراف', style: 'cancel' },
        { 
          text: isEn ? 'Confirm' : 'تایید', 
          onPress: async () => {
            try {
              await saveAppLanguage(nextLang);
              // Small delay to ensure storage is flushed
              await new Promise(resolve => setTimeout(resolve, 100));
              await Updates.reloadAsync();
            } catch (err) {
              console.error('Failed to reload app:', err);
              // Fallback to manual language change if reload fails
              i18n.changeLanguage(nextLang);
            }
          } 
        },
      ]
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <ScreenWrapper>
        <View className="flex-1 items-center justify-center py-20 px-6">
          <View className="w-24 h-24 bg-brand-100 dark:bg-brand-900/30 rounded-full items-center justify-center mb-6">
            <User size={48} color="#16a34a" />
          </View>
          <Text className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">
            {isEn ? 'Join Verna' : 'به ورنا بپیوندید'}
          </Text>
          <Text className="text-slate-500 text-center mb-10 leading-6">
            {isEn
              ? 'Create an account to track your garden and get personalized AI advice.'
              : 'برای پیگیری باغچه خود و دریافت مشاوره‌های هوشمند عضو شوید.'}
          </Text>
          <Button
            variant="primary"
            size="lg"
            className="w-full max-w-[260px]"
            onPress={() => navigation.navigate('Login')}
          >
            {t('common.signIn')}
          </Button>
        </View>
      </ScreenWrapper>
    );
  }

  const avatarUri =
    user.profile_picture ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;

  return (
    <>
    <ScreenWrapper className="px-0">
      {/* Cover + identity */}
      <View className="mb-6">
        <View className="h-36 mx-4 rounded-3xl overflow-hidden bg-brand-600">
          <View className="absolute inset-0 bg-brand-700/80" />
          <View className="absolute inset-0 bg-black/25" />
          <View className="absolute bottom-4 start-4 end-4 flex-row items-end justify-between">
            <View className="flex-1 pe-3">
              <Text className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                {isEn ? 'My Account' : 'حساب من'}
              </Text>
              <Text className="text-white text-xl font-black mt-1" numberOfLines={1}>
                {displayName}
              </Text>
              <Text className="text-white/75 text-sm">@{user.username}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowEditModal(true)}
              className="flex-row items-center gap-1.5 bg-white/20 px-3 py-2 rounded-xl border border-white/30"
            >
              <Pencil size={14} color="#fff" />
              <Text className="text-white text-xs font-bold">
                {isEn ? 'Edit' : 'ویرایش'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="items-center -mt-14 px-4">
          <TouchableOpacity
            onPress={handleAvatarPress}
            disabled={avatarLoading}
            className="relative"
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: avatarUri }}
              className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200"
            />
            <View className="absolute bottom-0 end-0 bg-brand-500 w-9 h-9 rounded-full items-center justify-center border-[3px] border-white dark:border-slate-900">
              {avatarLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Camera size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>
          <Text className="text-slate-500 dark:text-slate-400 text-sm mt-3 text-center">
            {user.email}
          </Text>
        </View>
      </View>

      {/* Quick stats */}
      <View className="flex-row gap-3 px-4 mb-6">
        <StatPill
          label={isEn ? 'Member since' : 'عضویت از'}
          value={formatDate(user.date_joined, i18n.language)}
        />
        <StatPill
          label={isEn ? 'Language' : 'زبان'}
          value={isEn ? 'EN' : 'FA'}
          onPress={toggleLanguage}
        />
      </View>

      <View className="gap-5 px-4 pb-10">
        <SectionLabel text={isEn ? 'Personal Information' : 'اطلاعات شخصی'} />

        <Card className="p-0 overflow-hidden">
          <TouchableOpacity
            onPress={() => setShowEditModal(true)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between p-4 border-b border-slate-100/80 dark:border-slate-700/50 bg-brand-50/50 dark:bg-brand-900/10"
          >
            <View className="flex-row items-center gap-2 justify-between">
              <Pencil size={16} color="#16a34a" />
              <Text className="text-brand-700 dark:text-brand-400 font-bold text-sm">
                {isEn ? 'Edit personal information' : 'ویرایش اطلاعات شخصی'}
              </Text>
            </View>
            <ChevronRight
              size={16}
              color="#16a34a"
              style={{ transform: [{ scaleX: isEn ? 1 : -1 }] }}
            />
          </TouchableOpacity>
          <SettingsRow
            icon={<AtSign size={18} color="#64748b" />}
            label={isEn ? 'Username' : 'نام کاربری'}
            value={user.username}
          />
          <SettingsRow
            icon={<Mail size={18} color="#64748b" />}
            label={isEn ? 'Email' : 'ایمیل'}
            value={user.email}
          />
          <SettingsRow
            icon={<Phone size={18} color="#64748b" />}
            label={isEn ? 'Phone' : 'تلفن'}
            value={phoneDisplay}
          />
          {user.national_code ? (
            <SettingsRow
              icon={<Fingerprint size={18} color="#64748b" />}
              label={isEn ? 'National ID' : 'کد ملی'}
              value={user.national_code}
            />
          ) : null}
          {user.bio ? (
            <SettingsRow
              icon={<Info size={18} color="#64748b" />}
              label={isEn ? 'Bio' : 'بیو'}
              value={user.bio}
              multiline
            />
          ) : null}
          <SettingsRow
            icon={<Calendar size={18} color="#64748b" />}
            label={isEn ? 'Joined' : 'تاریخ عضویت'}
            value={formatDate(user.date_joined, i18n.language)}
            isLast
          />
        </Card>

        <SectionLabel text={isEn ? 'Preferences' : 'تنظیمات'} />

        <Card className="p-0 overflow-hidden">
          <ThemeTransition onToggle={toggleTheme} theme={theme} speed={0.6} blur={10}>
            <View className="flex-row items-center justify-between p-4 border-b border-slate-100/80 dark:border-slate-700/50">
              <View className="flex-row items-center gap-3 flex-1">
                <IconBox>
                  <Moon size={20} color={theme === 'dark' ? '#4ade80' : '#64748b'} />
                </IconBox>
                <View>
                  <Text className="text-slate-800 dark:text-slate-200 font-bold">
                    {isEn ? 'Dark Mode' : 'حالت شب'}
                  </Text>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    {isEn ? 'Tap to toggle with animation' : 'برای تغییر با انیمیشن لمس کنید'}
                  </Text>
                </View>
              </View>
              <Switch
                value={theme === 'dark'}
                pointerEvents="none"
                trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
                thumbColor="#fff"
              />
            </View>
          </ThemeTransition>

          <TouchableOpacity onPress={toggleLanguage} activeOpacity={0.7}>
            <View className="flex-row items-center justify-between p-4 border-b border-slate-100/80 dark:border-slate-700/50">
              <View className="flex-row items-center gap-3">
                <IconBox>
                  <Globe size={20} color="#16a34a" />
                </IconBox>
                <Text className="text-slate-800 dark:text-slate-200 font-bold">
                  {isEn ? 'Language' : 'زبان'}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-brand-600 font-bold">
                  {isEn ? 'English' : 'فارسی'}
                </Text>
                <ChevronRight
                  size={16}
                  color="#94a3b8"
                  style={{ transform: [{ scaleX: isEn ? 1 : -1 }] }}
                />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CareGuide')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <IconBox>
                  <Info size={20} color="#64748b" />
                </IconBox>
                <Text className="text-slate-800 dark:text-slate-200 font-bold">
                  {t('common.careGuide')}
                </Text>
              </View>
              <ChevronRight
                size={16}
                color="#94a3b8"
                style={{ transform: [{ scaleX: isEn ? 1 : -1 }] }}
              />
            </View>
          </TouchableOpacity>
        </Card>

        <SectionLabel text={isEn ? 'Notification Settings' : 'تنظیمات اعلان‌ها'} />

        <Card className="p-0 overflow-hidden">
          {/* Exact Reminders */}
          <View className="flex-row items-center justify-between p-4 border-b border-slate-100/80 dark:border-slate-700/50">
            <View className="flex-row items-center gap-3 flex-1">
              <IconBox>
                <Bell size={20} color="#16a34a" />
              </IconBox>
              <View className="flex-1 pe-2">
                <Text className="text-slate-800 dark:text-slate-200 font-bold" style={{ includeFontPadding: false }}>
                  {isEn ? 'When Time Arrives' : 'زمان انجام یادآور'}
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
                  {isEn ? 'Notify exact scheduled time' : 'اعلان در زمان دقیق یادآور'}
                </Text>
              </View>
            </View>
            <Switch
              value={!!user.notify_reminders_exact}
              onValueChange={() => toggleNotificationSetting('notify_reminders_exact')}
              trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
              thumbColor="#fff"
            />
          </View>

          {/* Daily Summaries */}
          <View className="flex-row items-center justify-between p-4 border-b border-slate-100/80 dark:border-slate-700/50">
            <View className="flex-row items-center gap-3 flex-1">
              <IconBox>
                <Calendar size={20} color="#16a34a" />
              </IconBox>
              <View className="flex-1 pe-2">
                <Text className="text-slate-800 dark:text-slate-200 font-bold" style={{ includeFontPadding: false }}>
                  {isEn ? 'Daily Summary' : 'خلاصه روزانه'}
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
                  {isEn ? 'Morning tasks check (8:00 AM)' : 'بررسی کارهای امروز در ساعت ۸ صبح'}
                </Text>
              </View>
            </View>
            <Switch
              value={!!user.notify_reminders_daily}
              onValueChange={() => toggleNotificationSetting('notify_reminders_daily')}
              trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
              thumbColor="#fff"
            />
          </View>

          {/* Tomorrow Summaries */}
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center gap-3 flex-1">
              <IconBox>
                <Clock size={20} color="#16a34a" />
              </IconBox>
              <View className="flex-1 pe-2">
                <Text className="text-slate-800 dark:text-slate-200 font-bold" style={{ includeFontPadding: false }}>
                  {isEn ? 'Tomorrow’s Tasks' : 'برنامه‌های فردا'}
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
                  {isEn ? 'Evening schedule check (8:00 PM)' : 'بررسی برنامه‌های فردا در ساعت ۸ شب'}
                </Text>
              </View>
            </View>
            <Switch
              value={!!user.notify_reminders_tomorrow}
              onValueChange={() => toggleNotificationSetting('notify_reminders_tomorrow')}
              trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
              thumbColor="#fff"
            />
          </View>
        </Card>
        
        <View className="-mt-3 mb-1 px-1 flex-row justify-between">
          <Text className="text-[10px] text-slate-400 font-medium">
            {isEn ? `Timezone: ${user.timezone || 'UTC'}` : `منطقه زمانی: ${user.timezone || 'UTC'}`}
          </Text>
        </View>

        <Button
          variant="ghost"
          className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 py-4 mt-2 mb-6 h-auto"
          onPress={handleLogout}
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="ms-2 text-red-500 font-black">{t('common.logout')}</Text>
        </Button>
      </View>
    </ScreenWrapper>

    <EditProfileModal
      isVisible={showEditModal}
      onClose={() => setShowEditModal(false)}
      onSubmit={handleUpdateProfile}
      user={user}
    />
    </>
  );
};

const SectionLabel = ({ text }: { text: string }) => (
  <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest ms-1">
    {text}
  </Text>
);

const IconBox = ({ children }: { children: React.ReactNode }) => (
  <View className="w-10 h-10 bg-slate-100 dark:bg-slate-700/80 rounded-xl items-center justify-center">
    {children}
  </View>
);

const StatPill = ({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) => {
  const inner = (
    <View className="flex-1 bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 items-center">
      <Text className="text-[10px] font-bold text-slate-400 uppercase">{label}</Text>
      <Text className="text-slate-800 dark:text-white font-bold text-sm mt-1 text-center">
        {value}
      </Text>
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity className="flex-1" onPress={onPress} activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
};

const SettingsRow = ({
  icon,
  label,
  value,
  multiline,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  multiline?: boolean;
  isLast?: boolean;
}) => (
  <View
    className={cn(
      'flex-row justify-between p-4 gap-3',
      multiline ? 'items-start' : 'items-center',
      !isLast && 'border-b border-slate-100/80 dark:border-slate-700/50',
    )}
  >
    <View className="flex-row items-center gap-3 flex-shrink">
      <IconBox>{icon}</IconBox>
      <Text 
        className="text-slate-800 dark:text-slate-200 font-bold"
        style={{ includeFontPadding: false, textAlignVertical: 'center' }}
      >
        {label}
      </Text>
    </View>
    <Text
      className={cn(
        'text-slate-500 dark:text-slate-400 text-sm flex-1 text-end',
        multiline && 'max-w-[55%]',
      )}
      numberOfLines={multiline ? 3 : 1}
      style={{ includeFontPadding: false, textAlignVertical: 'center' }}
    >
      {value || '—'} 
    </Text>
  </View>
);

export default ProfileScreen;
