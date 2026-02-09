import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguageTheme } from '../../contexts/LanguageThemeContext';
import Navigation from './Navigation';

interface HeaderProps {
  navigateTo: (page: string) => void;
  currentPage: string;
}

const navItems = [
  { key: 'home', labelKey: 'home' },
  { key: 'identify', labelKey: 'identify' },
  { key: 'disease', labelKey: 'disease' },
  { key: 'care-guide', labelKey: 'careGuide' },
  { key: 'reminders', labelKey: 'reminders' },
  { key: 'library', labelKey: 'library' },
];

const Header: React.FC<HeaderProps> = ({ navigateTo, currentPage }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, theme, toggleLanguage, toggleTheme, t } = useLanguageTheme();

  const isActive = (page: string) => currentPage === page;

  return (
    <>
      <Navigation navigateTo={navigateTo} currentPage={currentPage} />

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="hidden md:block sticky top-0 z-40 glass border-b border-slate-200/60 dark:border-slate-700/50 shadow-sm"
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            <motion.button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🌱</span>
              <span className="font-display text-xl font-bold text-brand-800 dark:text-brand-400 tracking-tight">
                PlantCare Pro
              </span>
            </motion.button>

            <ul className="flex items-center gap-1 list-none">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.key}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <button
                    onClick={() => navigateTo(item.key)}
                    className={`nav-link-underline relative px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      isActive(item.key)
                        ? 'text-brand-800 dark:text-brand-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-brand-800 dark:hover:text-brand-400'
                    } ${isActive(item.key) ? 'active' : ''}`}
                  >
                    {t(item.labelKey)}
                  </button>
                </motion.li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={toggleLanguage}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {language === 'en' ? t('persian') : t('english')}
              </motion.button>
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </motion.button>

              {isAuthenticated ? (
                <>
                  <motion.button
                    onClick={() => navigateTo('profile')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-lg">👤</span>
                    <span className="hidden lg:inline font-medium">{user?.first_name}</span>
                  </motion.button>
                  <motion.button
                    onClick={logout}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('logout')}
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={() => navigateTo('login')}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-700 text-white hover:bg-brand-800 dark:bg-brand-700 dark:hover:bg-brand-800 shadow-md hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('signIn')}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;
