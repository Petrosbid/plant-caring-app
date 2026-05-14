import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguageTheme } from '../../contexts/LanguageThemeContext';

interface NavigationProps {
  navigateTo: (page: string) => void;
  currentPage: string;
}

interface NavItem {
  key: string;
  labelKey: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { key: "home", labelKey: "home" },
  { key: "care-guide", labelKey: "careGuide" },
  { key: "reminder", labelKey: "reminders" },
  {
    key: "garden",
    labelKey: "garden",
    children: [
      { key: "garden", labelKey: "garden" },
      { key: "mygarden", labelKey: "mygarden" }
    ]
  },
  { key: "diseases", labelKey: "diseases" },
  { key: "blog", labelKey: "blog" },
  {
    key: "AI",
    labelKey: "AI",
    children: [
      { key: "identify", labelKey: "identify" },
      { key: "disease", labelKey: "disease" },
      { key: "recommend", labelKey: "recommend" }
    ]
  }
];

const Navigation: React.FC<NavigationProps> = ({ navigateTo, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { language, theme, toggleLanguage, toggleTheme, t } = useLanguageTheme();
  const isRtl = language === 'fa';

  const closeAndNavigate = (page: string) => {
    navigateTo(page);
    setIsOpen(false);
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = currentPage === item.key;

    if (hasChildren) {
      return (
        <div key={item.key} className="space-y-1">
          <div
            className={`py-3 px-4 rounded-xl font-medium flex items-center justify-between text-slate-700 dark:text-slate-200 ${
              isRtl ? 'flex-row-reverse' : ''
            }`}
          >
            <span>{t(item.labelKey)}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isRtl ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div
            className={`space-y-1 ${
              isRtl ? 'pr-4 border-r-2' : 'pl-4 border-l-2'
            } border-slate-200 dark:border-slate-700 ml-2 mr-2`}
          >
            {item.children!.map(child => renderNavItem(child, depth + 1))}
          </div>
        </div>
      );
    }

    return (
      <button
        key={item.key}
        onClick={() => closeAndNavigate(item.key)}
        className={`w-full text-left py-3 px-4 rounded-xl font-medium transition-colors ${
          isActive
            ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400'
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80'
        } ${isRtl ? 'text-right' : 'text-left'}`}
      >
        {t(item.labelKey)}
      </button>
    );
  };

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="md:hidden sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-slate-700/50"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <motion.button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xl">🌱</span>
            <span className="font-display font-bold text-brand-600 dark:text-brand-400">PlantCare</span>
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
              {navItems.map((item) => (
                <li key={item.key}>{renderNavItem(item)}</li>
              ))}
              {isAuthenticated ? (
                <>
                  <li>
                    <button
                      onClick={() => closeAndNavigate('profile')}
                      className={`w-full py-3 px-4 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center gap-2 ${
                        isRtl ? 'flex-row-reverse justify-end' : ''
                      }`}
                    >
                      <span>👤</span> {user?.first_name}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { logout(); setIsOpen(false); }}
                      className={`w-full py-3 px-4 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 ${
                        isRtl ? 'text-right' : 'text-left'
                      }`}
                    >
                      {t('logout')}
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <button
                    onClick={() => closeAndNavigate('login')}
                    className={`w-full py-3 px-4 rounded-xl font-medium bg-brand-500 text-white ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}
                  >
                    {t('signIn')}
                  </button>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;