import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Switch } from 'react-native';
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
  User, Mail, Phone, MapPin, 
  Settings, LogOut, Globe, Moon, 
  ChevronRight, Calendar, Info, Heart
} from 'lucide-react-native';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/date';
import { ThemeTransition } from '../components/common/ThemeTransition';
import { EditProfileModal } from '../components/common/EditProfileModal';
import { authService } from '../services/api';

const ProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';

  const [showEditModal, setShowEditModal] = useState(false);

  const handleUpdateProfile = async (data: any) => {
    try {
      const updated = await authService.updateProfile(data);
      setUser(updated);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      isEn ? "Logout" : "خروج",
      isEn ? "Are you sure you want to exit?" : "آیا مطمئن هستید که می‌خواهید خارج شوید؟",
      [
        { text: isEn ? "Cancel" : "انصراف", style: "cancel" },
        { text: isEn ? "Exit" : "خروج", style: "destructive", onPress: logout }
      ]
    );
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'fa' : 'en';
    i18n.changeLanguage(nextLang);
  };

  if (!isAuthenticated || !user) {
    return (
      <ScreenWrapper>
        <View className="flex-1 items-center justify-center py-20">
          <View className="w-24 h-24 bg-brand-100 dark:bg-brand-900/30 rounded-full items-center justify-center mb-6">
            <User size={48} color="#16a34a" />
          </View>
          <Text className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {isEn ? "Join Verna" : "به ورنا بپیوندید"}
          </Text>
          <Text className="text-slate-500 text-center px-10 mb-10">
            {isEn ? "Create an account to track your garden and get personalized AI advice." : "برای پیگیری باغچه خود و دریافت مشاوره‌های هوشمند عضو شوید."}
          </Text>
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full max-w-[250px]"
            onPress={() => navigation.navigate('Login')}
          >
            {t('common.signIn')}
          </Button>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header Profile Info */}
      <View className="items-center mb-10 pt-6">
        <View className="relative">
          <Image 
            source={{ uri: user.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}` }} 
            className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-xl"
          />
          <TouchableOpacity 
            onPress={() => setShowEditModal(true)}
            className="absolute bottom-0 right-0 bg-brand-500 p-2 rounded-full border-4 border-white dark:border-slate-900"
          >
            <Settings size={18} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-3xl font-black text-slate-900 dark:text-white mt-4">
          {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
        </Text>
        <Text className="text-slate-400 font-medium">@{user.username}</Text>
      </View>

      {/* Settings Sections */}
      <View className="gap-6 px-2 mb-10">
        
        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">
          {isEn ? "Personal Information" : "اطلاعات شخصی"}
        </Text>
        
        <Card className="p-2">
          <SettingsItem 
            icon={<Mail size={20} color="#64748b" />} 
            label={isEn ? "Email" : "ایمیل"} 
            value={user.email} 
          />
          <SettingsItem 
            icon={<Phone size={20} color="#64748b" />} 
            label={isEn ? "Phone" : "تلفن"} 
            value={user.phone_number || "—"} 
          />
          <SettingsItem 
            icon={<Calendar size={20} color="#64748b" />} 
            label={isEn ? "Member Since" : "عضویت از"} 
            value={formatDate(user.date_joined, i18n.language)} 
            noBorder
          />
        </Card>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">
          {isEn ? "App Settings" : "تنظیمات اپلیکیشن"}
        </Text>

        <Card className="p-2">
          <ThemeTransition onToggle={toggleTheme} speed={0.6} blur={10}>
            <View className="flex-row items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700/50">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl items-center justify-center">
                  <Moon size={20} color={theme === 'dark' ? '#3B82F6' : '#64748b'} />
                </View>
                <Text className="text-slate-800 dark:text-slate-200 font-bold">
                  {isEn ? "Dark Mode" : "حالت شب"}
                </Text>
              </View>
              <Switch 
                value={theme === 'dark'} 
                onValueChange={toggleTheme}
                trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
              />
            </View>
          </ThemeTransition>

          <TouchableOpacity onPress={toggleLanguage}>
            <View className="flex-row items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700/50">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl items-center justify-center">
                  <Globe size={20} color="#16a34a" />
                </View>
                <Text className="text-slate-800 dark:text-slate-200 font-bold">
                  {isEn ? "Language" : "زبان"}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-brand-600 font-bold">{isEn ? "English" : "فارسی"}</Text>
                <ChevronRight size={16} color="#94a3b8" className={isEn ? "" : "rotate-180"} />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('CareGuide')}>
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl items-center justify-center">
                  <Info size={20} color="#64748b" />
                </View>
                <Text className="text-slate-800 dark:text-slate-200 font-bold">
                  {t('common.careGuide')}
                </Text>
              </View>
              <ChevronRight size={16} color="#94a3b8" className={isEn ? "" : "rotate-180"} />
            </View>
          </TouchableOpacity>
        </Card>

        <Button 
          variant="ghost" 
          className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 py-4"
          onPress={handleLogout}
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="ml-2 text-red-500 font-black">{t('common.logout')}</Text>
        </Button>
      </View>

      <EditProfileModal
        isVisible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateProfile}
        user={user}
      />
    </ScreenWrapper>
  );
};

const SettingsItem = ({ icon, label, value, noBorder }: any) => (
  <View className={cn(
    "flex-row items-center justify-between p-4",
    !noBorder && "border-b border-slate-50 dark:border-slate-700/50"
  )}>
    <View className="flex-row items-center gap-3">
      <View className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl items-center justify-center">
        {icon}
      </View>
      <Text className="text-slate-800 dark:text-slate-200 font-bold">{label}</Text>
    </View>
    <Text className="text-slate-400 font-medium text-sm">{value}</Text>
  </View>
);

export default ProfileScreen;
