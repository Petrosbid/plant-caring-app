// UserDashboard.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserPlants } from '../hooks/useUserPlants';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import { authService } from '../services/api';
import {m, AnimatePresence} from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface UserDashboardProps {
  navigateTo: (page: string) => void;
}

const TABS = {
  PROFILE: 'profile',
  PLANTS: 'plants',
} as const;
type TabType = typeof TABS[keyof typeof TABS];

interface ProfileFormData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  national_code: string;
  birth_date: string;
  gender: string;
  bio: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const Sidebar: React.FC<{
  user: any;
  onLogout: () => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}> = ({ user, onLogout, activeTab, onTabChange }) => {
  const { t } = useLanguageTheme();
  
  const navItems = [
    { id: TABS.PROFILE, label: t('profile') },
    { id: TABS.PLANTS, label: t('myPlants') },
  ];

  return (
    <aside className={`w-full lg:w-64 bg-white dark:bg-gray-800 p-4 shadow-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/50 flex flex-col sm:flex-row lg:flex-col gap-4 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] transition-all duration-300`}>
      {/* User Summary */}
      <div className="flex flex-row sm:flex-col lg:flex-col items-center gap-4 sm:gap-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-700/40 rounded-xl shadow-inner w-full sm:w-auto lg:w-full">
        <img
          src={user.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
          alt={user.username}
          className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full border-4 border-brand-500 object-cover"
        />
        <div className="flex flex-col items-start sm:items-center text-right sm:text-center">
          <span className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base">
            {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 break-all max-w-[180px]">{user.email}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="w-full sm:w-auto lg:w-full sm:flex-1 lg:flex-none">
        <ul className="flex flex-row lg:flex-col gap-2 w-full justify-center sm:justify-start">
          {navItems.map((item) => (
            <li key={item.id} className="flex-1 lg:flex-none">
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-center lg:justify-start gap-2.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="font-medium text-sm sm:text-base">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="w-full sm:w-auto lg:w-full lg:mt-auto lg:pt-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center lg:justify-start gap-2.5 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors duration-200"
        >
          <span className="font-medium text-sm sm:text-base">{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};

// ---------- Profile Header ----------
const ProfileHeader: React.FC<{ user: any; onAvatarChange: (file: File) => void }> = ({ user, onAvatarChange }) => {
  const { t, language } = useLanguageTheme();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isRtl = language === 'fa';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAvatarChange(file);
  };

  return (
    <div className="relative mb-6 md:mb-8 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-700/50">
      {/* Cover Image Container */}
      <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500 scale-105 hover:scale-100"
          style={{ backgroundImage: `url('/static/images/travel-cover.jpg')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </div>
      </div>

      {/* Profile Details Bar */}
      <div className="relative px-4 pb-6 pt-16 sm:pt-6 sm:pb-6 sm:px-6 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
        {/* Avatar Container (Positioned to overlap cover image) */}
        <div className={`absolute -top-12 sm:-top-16 left-1/2 sm:left-auto -translate-x-1/2 sm:translate-x-0 flex flex-col sm:flex-row items-center gap-4 ${
          isRtl ? 'sm:right-6' : 'sm:left-6'
        }`}>
          <div className="relative group">
            <img
              src={user.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.username}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-xl transition-transform duration-300 group-hover:scale-105"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-brand-600 hover:bg-brand-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label={t('changeAvatar') || 'Change Avatar'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* User Text Info */}
        <div className={`w-full text-center mt-2 sm:mt-0 ${
          isRtl ? 'sm:text-right sm:mr-36 md:sm:mr-40' : 'sm:text-left sm:ml-36 md:sm:ml-40'
        } flex-1`}>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
            {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
          </h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 mt-1 text-slate-500 dark:text-slate-400 text-sm">
            <span>{user.email}</span>
            <span className="hidden sm:inline">•</span>
            <span>
              {t('memberSince')}: {user.date_joined ? new Date(user.date_joined).toLocaleDateString('fa-IR') : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Profile Form ----------
const ProfileForm: React.FC<{ user: any; genderChoices: [string, string][] }> = ({ user, genderChoices }) => {
  const { t } = useLanguageTheme();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<ProfileFormData>({
    defaultValues: {
      username: user.username || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone_number || '',
      national_code: user.national_code || '',
      birth_date: user.birth_date || '',
      gender: user.gender || '',
      bio: user.bio || '',
      current_password: '',
      new_password: '',
      confirm_password: '',
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const payload: any = { ...data };
      if (!data.new_password) {
        delete payload.current_password;
        delete payload.new_password;
        delete payload.confirm_password;
      } else {
        if (data.new_password !== data.confirm_password) {
          toast.error(t('passwordMismatch') || 'Passwords do not match');
          setLoading(false);
          return;
        }
      }
      const updatedUser = await authService.updateProfile(payload);
      updateUser(updatedUser);
      toast.success(t('profileUpdated') || 'Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || t('updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-700/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info Section */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-1 text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">{t('basicInfo')}</h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">{t('username')}</label>
          <input {...register('username', { required: true })} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">{t('firstName')}</label>
          <input {...register('first_name')} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">{t('lastName')}</label>
          <input {...register('last_name')} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">{t('email')}</label>
          <input {...register('email', { required: true })} type="email" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">{t('phone')}</label>
          <input {...register('phone')} type="tel" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">{t('nationalCode')}</label>
          <input {...register('national_code')} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">{t('birthDate')}</label>
          <input {...register('birth_date')} type="date" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">{t('gender')}</label>
          <select {...register('gender')} className={inputClass}>
            <option value="">{t('select')}</option>
            {genderChoices.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">{t('bio')}</label>
          <textarea {...register('bio')} rows={3} className={inputClass} />
        </div>

        {/* Password Change Section */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-semibold mb-1 text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">{t('changePassword')}</h3>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">{t('currentPassword')}</label>
          <input {...register('current_password')} type="password" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">{t('newPassword')}</label>
          <input {...register('new_password')} type="password" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">{t('confirmNewPassword')}</label>
          <input {...register('confirm_password')} type="password" className={inputClass} />
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl font-medium bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white shadow-lg hover:shadow-glow transition-all duration-200 disabled:opacity-50"
        >
          {loading ? t('saving') : t('saveChanges')}
        </button>
      </div>
    </form>
  );
};

const PlantsTab: React.FC = () => {
  const { t } = useLanguageTheme();
  const { userPlants, loading } = useUserPlants();
  const [now] = React.useState(() => Date.now());

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!userPlants?.length) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">🌱</span>
        <p className="text-slate-500 dark:text-slate-400">{t('noPlants')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {userPlants.map((plant: any) => {
        const daysSince = Math.floor((now - new Date(plant.last_watered).getTime()) / (1000 * 60 * 60 * 24));
        return (
          <m.div
            key={plant.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center overflow-hidden">
              {plant.plant_details?.primary_image ? (
                <img src={plant.plant_details.primary_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">🌿</span>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">{plant.nickname || plant.plant_details?.farsi_name}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('lastWatered')}: {daysSince} {t('daysAgo')}</p>
            </div>
            <button className="text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 p-2.5 rounded-full transition-colors">
              💧
            </button>
          </m.div>
        );
      })}
    </div>
  );
};

// ---------- Main Dashboard ----------
const UserDashboard: React.FC<UserDashboardProps> = ({ navigateTo }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language } = useLanguageTheme();
  const [activeTab, setActiveTab] = useState<TabType>(TABS.PROFILE);
  const [genderChoices] = useState<[string, string][]>([
    ['M', 'مرد'],
    ['F', 'زن'],
    ['O', 'دیگر'],
  ]);
  const handleAvatarChange = async (file: File) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    try {
      await authService.updateProfilePicture(formData);
      toast.success(t('avatarUpdated'));
    } catch {
      toast.error(t('avatarUpdateFailed'));
    }
  };

  const handleLogout = () => {
    if (confirm(t('logoutConfirm'))) {
      logout();
      navigateTo('home');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-200">{t('pleaseLogin')}</h1>
        <button 
          onClick={() => navigateTo('login')} 
          className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md transition-colors"
        >
          {t('login')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/10 transition-colors duration-300" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <Toaster position="top-center" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <Sidebar
            user={user}
            onLogout={handleLogout}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === TABS.PROFILE && (
                <m.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <ProfileHeader user={user} onAvatarChange={handleAvatarChange} />
                  <ProfileForm user={user} genderChoices={genderChoices} />
                </m.div>
              )}

              {activeTab === TABS.PLANTS && (
                <m.div
                  key="plants"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-700/50">
                    <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200">{t('myPlants')}</h2>
                    <PlantsTab />
                    <button
                      onClick={() => navigateTo('library')}
                      className="mt-6 w-full bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-medium py-3 rounded-xl transition-all duration-200"
                    >
                      + {t('addNewPlant')}
                    </button>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;