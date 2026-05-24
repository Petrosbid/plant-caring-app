import React, { createContext, useContext, useState, useEffect, Children } from 'react';
import type { ReactNode } from 'react';
import { use } from 'react';

type Language = 'en' | 'fa';
type Theme = 'light' | 'dark';
type Direction = 'ltr' | 'rtl';

interface LanguageThemeContextType {
  language: Language;
  theme: Theme;
  direction: Direction;
  toggleLanguage: () => void;
  toggleTheme: (e?: React.MouseEvent) => void; 
  t: (key: string) => string;
}

const LanguageThemeContext = createContext<LanguageThemeContextType | undefined>(undefined);

export const LanguageThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang as Language) || 'en';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  const direction: Direction = language === 'fa' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);
  }, [language, direction]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'fa' : 'en'));
  };

  const toggleTheme = (e?: React.MouseEvent) => {
    if (e) {
      (window as any).__themeToggleClick = {
        clientX: e.clientX,
        clientY: e.clientY,
      };
    }
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

const translations = {
  en: {
    home: 'Home',
    identify: 'Identify Plant',
    disease: 'Disease Check',
    careGuide: 'Care Guide',
    reminders: 'Reminders',
    library: 'Plant Library',
    signIn: 'Sign In',
    profile: 'Profile',
    logout: 'Logout',
    language: 'Language',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    english: 'English 🇺🇸',
    persian: 'Persian 🇮🇷',
    blog: 'Blog',
    AI: 'AI' ,
    recommend : 'Recommend',
    garden: 'Garden',
    mygarden: 'MyGarden',
    diseases: 'Diseases',
    accessDenied: 'Access Denied',
    pleaseSignIn: 'Please sign in to view your profile.',
    back: 'Back',
    memberSince: 'Member since',
    plants: 'Plants',
    accountSettings: 'Account Settings',
    firstName: 'First Name',
    lastName: 'Last Name',
    username: 'Username',
    email: 'Email',
    phone: 'Phone Number',
    bio: 'Bio',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    myGarden: 'My Garden',
    noPlants: 'No plants in your garden yet',
    addNewPlant: 'Add New Plant',
    passwordMismatch: 'Passwords do not match',
    profileUpdated: 'Profile updated successfully!',
    updateFailed: 'Failed to update profile',
    avatarUpdated: 'Profile picture updated',
    avatarUpdateFailed: 'Failed to update profile picture',
    logoutConfirm: 'Are you sure you want to logout?',
    pleaseLogin: 'Please log in to access your dashboard',
    login: 'Log In',
    basicInfo: 'Basic Information',
    nationalCode: 'National Code',
    birthDate: 'Birth Date',
    gender: 'Gender',
    select: 'Select',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    totalTrips: 'Total Trips',
    activeTrips: 'Active Trips',
    travelPoints: 'Travel Points',
    lastWatered: 'Last watered',
    daysAgo: 'days ago',
    water: 'Water plant',
    plantWatered: 'Plant watered!',
    newTrip: 'New Trip',
    myPlants: 'My Plants',
    vernaStoryTitle: 'The Story Behind Verna',
    vernaStoryDesc: 'Discover how ancient Persian heritage meets modern AI technology.',
    vernaFaMeaning: 'In Persian culture, Verna represents youth, freshness, and the vibrant force of nature.',
    vernaEnMeaning: 'Etymologically linked to "Vernal", it signifies the spring season, growth, and the rebirth of plants.',
    vernaMatchTitle: 'A Perfect Harmony',
    vernaMatchDesc: 'A beautiful bilingual connection that bridges ancient roots with the future of AI-powered plant care.',
  },

  fa: {
    home: 'خانه',
    identify: 'شناسایی گیاه',
    disease: 'بررسی بیماری',
    careGuide: 'راهنمای مراقبت',
    reminders: 'یادآوری‌ها',
    library: 'کتابخانه گیاهان',
    signIn: 'ورود',
    profile: 'پروفایل',
    logout: 'خروج',
    language: 'زبان',
    theme: 'تم',
    dark: 'تاریک',
    light: 'روشن',
    english: 'انگلیسی 🇺🇸',
    persian: 'فارسی 🇮🇷',
    blog: 'وبلاگ',
    AI: 'هوش مصنوعی' ,
    recommend : 'پیشنهاد گیاه',
    garden: 'باغچه',
    mygarden: 'باغچه من',
    diseases: 'بیماری‌ها',
    accessDenied: 'دسترسی رد شد',
    pleaseSignIn: 'لطفاً برای مشاهده پروفایل خود وارد شوید.',
    back: 'بازگشت',
    memberSince: 'عضو از',
    plants: 'گیاهان',
    accountSettings: 'تنظیمات حساب',
    firstName: 'نام',
    lastName: 'نام خانوادگی',
    username: 'نام کاربری',
    email: 'ایمیل',
    phone: 'شماره تلفن',
    bio: 'بیوگرافی',
    cancel: 'لغو',
    saveChanges: 'ذخیره تغییرات',
    saving: 'در حال ذخیره...',
    myGarden: 'گلخانه من',
    noPlants: 'هنوز گیاهی در گلخانه شما نیست',
    addNewPlant: 'افزودن گیاه جدید',
    passwordMismatch: 'رمز عبور و تکرار آن مطابقت ندارند',
    profileUpdated: 'پروفایل با موفقیت به‌روزرسانی شد!',
    updateFailed: 'به‌روزرسانی پروفایل ناموفق بود',
    avatarUpdated: 'تصویر پروفایل به‌روز شد',
    avatarUpdateFailed: 'به‌روزرسانی تصویر پروفایل ناموفق بود',
    logoutConfirm: 'آیا از خروج خود اطمینان دارید؟',
    pleaseLogin: 'لطفاً برای دسترسی به داشبورد وارد شوید',
    login: 'ورود',
    basicInfo: 'اطلاعات پایه',
    nationalCode: 'کد ملی',
    birthDate: 'تاریخ تولد',
    gender: 'جنسیت',
    select: 'انتخاب کنید',
    changePassword: 'تغییر رمز عبور',
    currentPassword: 'رمز عبور فعلی',
    newPassword: 'رمز عبور جدید',
    confirmNewPassword: 'تکرار رمز عبور جدید',
    totalTrips: 'کل سفرها',
    activeTrips: 'سفرهای فعال',
    travelPoints: 'امتیاز سفر',
    lastWatered: 'آخرین آبیاری',
    daysAgo: 'روز پیش',
    water: 'آبیاری گیاه',
    plantWatered: 'گیاه آبیاری شد!',
    newTrip: 'سفر جدید',
    myPlants: 'گیاهان من',
    vernaStoryTitle: 'داستان پشت نام ورنا',
    vernaStoryDesc: 'کشف کنید چگونه اصالت ایران باستان با فناوری مدرن هوش مصنوعی تلاقی می‌کند.',
    vernaFaMeaning: 'در فرهنگ و زبان فارسی باستان، ورنا به معنای جوانی، شادابی و نیروی سرزنده طبیعت است.',
    vernaEnMeaning: 'در ریشه‌شناسی انگلیسی، هم‌خانواده واژه "Vernal" به معنای بهاری، مرتبط با رویش و نوزایی گیاهان است.',
    vernaMatchTitle: 'یک تطابق بی‌نظیر',
    vernaMatchDesc: 'یک هم‌راستایی معنایی دوگانه و مدرن که اصالت گذشته را به آیندهٔ مراقبت هوشمند از گیاهان پیوند می‌زند.',
  }
};

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[Language]] || key;
  };

  return (
    <LanguageThemeContext.Provider value={{
      language,
      theme,
      direction,
      toggleLanguage,
      toggleTheme,
      t
    }}>
      {children}
    </LanguageThemeContext.Provider>
  );
};



export const useLanguageTheme = () => {
  const context = use(LanguageThemeContext);
  if (!context) {
    throw new Error('useLanguageTheme must be used within a LanguageThemeProvider');
  }
  return context;
};