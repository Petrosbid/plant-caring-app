// UserDashboard.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserPlants } from '../hooks/useUserPlants';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import { authService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
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
    { id: TABS.PROFILE, icon: 'https://cdn.lordicon.com/jeuxydnh.json', label: t('profile') },
    { id: TABS.PLANTS, icon: 'https://cdn.lordicon.com/pkxwrmde.json', label: t('myPlants') },
  ];

  return (
    <aside className="w-64 h-[74vh] bg-white dark:bg-gray-800 sticky top-24 h-[calc(100vh-6rem)] p-4 shadow-md rounded-2xl border-l border-slate-200 dark:border-slate-700">
      {/* User Summary */}
      <div className="flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-inner">
        <img
          src={user.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
          alt={user.username}
          className="w-20 h-20 rounded-full border-4 border-primary object-cover mb-2"
        />
        <span className="font-semibold text-slate-800 dark:text-white">
          {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">{user.email}</span>
      </div>

      {/* Navigation */}
      <nav className="mt-8">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {/* <lord-icon
                  src={item.icon}
                  trigger="hover"
                  stroke="bold"
                  colors="primary:#FF5722,secondary:#4A90E2"
                  style={{ width: 28, height: 28 }}
                /> */}
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
        >
          {/* <lord-icon
            src="https://cdn.lordicon.com/vfiwitrm.json"
            trigger="hover"
            stroke="bold"
            colors="primary:#ef4444"
            style={{ width: 28, height: 28 }}
          /> */}
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};

// ---------- Profile Header ----------
const ProfileHeader: React.FC<{ user: any; onAvatarChange: (file: File) => void }> = ({ user, onAvatarChange }) => {
  const { t } = useLanguageTheme();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAvatarChange(file);
  };

  return (
    <div className="relative h-[29rem] rounded-2xl overflow-hidden mb-20">
      {/* Cover Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/static/images/travel-cover.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Avatar */}
      <div className="absolute -bottom-[-0.1rem] right-8 flex items-end">
        <div className="relative">
          <img
            src={user.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.username}
            className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 object-cover shadow-lg"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 bg-primary hover:bg-primary/90 text-white p-2 rounded-full shadow-md transition-colors"
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
        <div className="mr-4 mb-2 text-white">
          <h2 className="text-2xl font-semibold">
            {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
          </h2>
          <p className="opacity-90">{user.email}</p>
          <p className="text-sm opacity-80">{t('memberSince')}: {user.date_joined ? new Date(user.date_joined).toLocaleDateString('fa-IR') : '—'}</p>
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info Section */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white border-b pb-2">{t('basicInfo')}</h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('username')}</label>
          <input {...register('username', { required: true })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-slate-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('firstName')}</label>
          <input {...register('first_name')} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-slate-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('lastName')}</label>
          <input {...register('last_name')} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-slate-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('email')}</label>
          <input {...register('email', { required: true })} type="email" className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-slate-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('phone')}</label>
          <input {...register('phone')} type="tel" className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-slate-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('nationalCode')}</label>
          <input {...register('national_code')} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-slate-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('birthDate')}</label>
          <input {...register('birth_date')} type="date" className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-slate-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('gender')}</label>
          <select {...register('gender')} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-slate-600">
            <option value="">{t('select')}</option>
            {genderChoices.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">{t('bio')}</label>
          <textarea {...register('bio')} rows={3} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-slate-600" />
        </div>

        {/* Password Change Section */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white border-b pb-2">{t('changePassword')}</h3>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('currentPassword')}</label>
          <input {...register('current_password')} type="password" className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-slate-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('newPassword')}</label>
          <input {...register('new_password')} type="password" className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-slate-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('confirmNewPassword')}</label>
          <input {...register('confirm_password')} type="password" className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-slate-600" />
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl font-medium bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-colors"
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {userPlants.map((plant: any) => {
        const daysSince = Math.floor((Date.now() - new Date(plant.last_watered).getTime()) / (1000 * 60 * 60 * 24));
        return (
          <motion.div
            key={plant.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center overflow-hidden">
              {plant.plant_details?.primary_image ? (
                <img src={plant.plant_details.primary_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">🌿</span>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{plant.nickname || plant.plant_details?.farsi_name}</h4>
              <p className="text-sm text-slate-500">{t('lastWatered')}: {daysSince} {t('daysAgo')}</p>
            </div>
            <button className="text-primary hover:bg-primary/10 p-2 rounded-full">
              💧
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

// ---------- Main Dashboard ----------
const UserDashboard: React.FC<UserDashboardProps> = ({ navigateTo }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguageTheme();
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
    } catch (err) {
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
        <h1 className="text-2xl font-semibold mb-4">{t('pleaseLogin')}</h1>
        <button onClick={() => navigateTo('login')} className="bg-primary text-white px-6 py-2 rounded-xl">
          {t('login')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
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
          <main className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === TABS.PROFILE && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <ProfileHeader user={user} onAvatarChange={handleAvatarChange} />
                  <ProfileForm user={user} genderChoices={genderChoices} />
                </motion.div>
              )}

              {activeTab === TABS.PLANTS && (
                <motion.div
                  key="plants"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-6">{t('myPlants')}</h2>
                    <PlantsTab />
                    <button
                      onClick={() => navigateTo('library')}
                      className="mt-6 w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-3 rounded-xl transition-colors"
                    >
                      + {t('addNewPlant')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;