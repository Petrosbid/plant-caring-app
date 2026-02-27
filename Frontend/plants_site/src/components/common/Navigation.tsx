import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguageTheme } from '../../contexts/LanguageThemeContext';

interface NavigationProps {
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

const Navigation: React.FC<NavigationProps> = ({ navigateTo, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { language, theme, toggleLanguage, toggleTheme, t } = useLanguageTheme();

  const closeAndNavigate = (page: string) => {
    navigateTo(page);
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="md:hidden sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-slate-700/50 header-ltr"
      dir="ltr"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <motion.button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xl">🌱</span>
            <span className="font-display font-bold text-brand-600 dark:text-brand-400">PlantCare Pro</span>
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleLanguage}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 text-xs font-medium"
              whileTap={{ scale: 0.95 }}
            >
              {language === 'en' ? t('persian') : t('english')}
            </motion.button>
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/80"
              whileTap={{ scale: 0.95 }}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </motion.button>
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80"
              whileTap={{ scale: 0.95 }}
              aria-label="Menu"
            >
              <span className="text-2xl">{isOpen ? '✕' : '☰'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-slate-200/60 dark:border-slate-700/50"
          >
            <ul className="py-4 space-y-1 px-4">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <button
                    onClick={() => closeAndNavigate(item.key)}
                    className={`w-full text-left py-3 px-4 rounded-xl font-medium transition-colors ${
                      currentPage === item.key
                        ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    {t(item.labelKey)}
                  </button>
                </motion.li>
              ))}
              {isAuthenticated ? (
                <>
                  <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <button
                      onClick={() => closeAndNavigate('profile')}
                      className="w-full text-left py-3 px-4 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center gap-2"
                    >
                      <span>👤</span> {user?.first_name}
                    </button>
                  </motion.li>
                  <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.22 }}>
                    <button
                      onClick={() => { logout(); setIsOpen(false); }}
                      className="w-full text-left py-3 px-4 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10"
                    >
                      {t('logout')}
                    </button>
                  </motion.li>
                </>
              ) : (
                <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}>
                  <button
                    onClick={() => closeAndNavigate('login')}
                    className="w-full text-left py-3 px-4 rounded-xl font-medium bg-brand-500 text-white"
                  >
                    {t('signIn')}
                  </button>
                </motion.li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
