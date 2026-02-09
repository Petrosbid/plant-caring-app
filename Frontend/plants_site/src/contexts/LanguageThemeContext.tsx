import React, { createContext, useContext, useState, useEffect } from 'react';
import type {ReactNode} from 'react';
type Language = 'en' | 'fa';
type Theme = 'light' | 'dark';

interface LanguageThemeContextType {
  language: Language;
  theme: Theme;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  t: (key: string) => string;
}

const LanguageThemeContext = createContext<LanguageThemeContextType | undefined>(undefined);

interface LanguageThemeProviderProps {
  children: ReactNode;
}

export const LanguageThemeProvider: React.FC<LanguageThemeProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang as Language) || 'en';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'en' ? 'fa' : 'en';
      localStorage.setItem('language', newLang);
      return newLang;
    });
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      // Apply theme to document immediately
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newTheme;
    });
  };

  // Translation function
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
      english: 'English',
      persian: 'Persian'
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
      english: 'انگلیسی',
      persian: 'فارسی'
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[Language]] || key;
  };

  return (
    <LanguageThemeContext.Provider value={{
      language,
      theme,
      toggleLanguage,
      toggleTheme,
      t
    }}>
      {children}
    </LanguageThemeContext.Provider>
  );
};

export const useLanguageTheme = () => {
  const context = useContext(LanguageThemeContext);
  if (!context) {
    throw new Error('useLanguageTheme must be used within a LanguageThemeProvider');
  }
  return context;
};