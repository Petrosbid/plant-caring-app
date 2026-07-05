import React, { useState } from 'react';
import {m, AnimatePresence} from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguageTheme } from '../../contexts/LanguageThemeContext';
import CountryFlag from 'react-country-flag';
import { FiMenu, FiX } from 'react-icons/fi';

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
  },
  {
    key: "about-us",
    labelKey: "aboutUs",
    children: [
      { key: "about-us", labelKey: "aboutUs" },
      { key: "contact-us", labelKey: "contactUs" }
    ]
  }
];

const Navigation: React.FC<NavigationProps> = ({ navigateTo, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const { user, isAuthenticated, logout } = useAuth();
  const { language, theme, toggleLanguage, toggleTheme, t } = useLanguageTheme();
  const isRtl = language === 'fa';

  const closeAndNavigate = (page: string) => {
    navigateTo(page);
    setIsOpen(false);
  };

  const toggleExpand = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const flags = {
    en: <span className="flex items-center gap-1">FA <CountryFlag countryCode="IR" svg /></span>,
    fa: <span className="flex items-center gap-1">EN <CountryFlag countryCode="US" svg /></span>
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = currentPage === item.key;
    const isExpanded = !!expandedItems[item.key];

    if (hasChildren) {
      return (
        <div key={item.key} className="space-y-1">
          <button
            onClick={() => toggleExpand(item.key)}
            className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors ${
              isRtl ? 'flex-row-reverse' : ''
            }`}
          >
            <span>{t(item.labelKey)}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-250 ${
                isExpanded ? 'rotate-180' : ''
              } ${isRtl ? 'mr-auto ml-1' : 'ml-auto mr-1'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div
                  className={`space-y-1 ${
                    isRtl ? 'pr-4 border-r border-slate-200 dark:border-slate-800' : 'pl-4 border-l border-slate-200 dark:border-slate-800'
                  } ml-2 mr-2`}
                >
                  {item.children!.map(child => renderNavItem(child, depth + 1))}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <button
        key={item.key}
        onClick={() => closeAndNavigate(item.key)}
        className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-150 flex items-center ${
          isActive
            ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'
        } ${isRtl ? 'text-right justify-start' : 'text-left justify-start'}`}
      >
        {t(item.labelKey)}
      </button>
    );
  };

  return (
    <m.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="md:hidden sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-slate-700/50"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <m.button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xl">🌱</span>
            <span className="font-display font-semibold text-brand-600 dark:text-brand-400">{language === 'fa' ? 'ورنا' : 'Verna'}</span>
          </m.button>

          <div className="flex items-center gap-2">
            <m.button
              onClick={toggleLanguage}
              className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              {language === 'en' ? flags.en : flags.fa}
            </m.button>
            <m.button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </m.button>
            <m.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
              whileTap={{ scale: 0.95 }}
              aria-label="Menu"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </m.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 top-[3.5rem] bg-black/40 backdrop-blur-sm z-40"
            />
            
            {/* Dropdown Menu */}
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-b border-slate-200/60 dark:border-slate-700/50 shadow-2xl max-h-[calc(100vh-3.5rem)] overflow-y-auto z-50"
            >
              <ul className="p-4 space-y-1.5 list-none">
                {navItems.map((item) => (
                  <li key={item.key}>{renderNavItem(item)}</li>
                ))}
                {isAuthenticated ? (
                  <>
                    <li className="border-t border-slate-200/60 dark:border-slate-800 pt-2.5">
                      <button
                        onClick={() => closeAndNavigate('profile')}
                        className={`w-full py-3 px-4 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center gap-3 ${
                          isRtl ? 'flex-row-reverse justify-start text-right' : 'justify-start text-left'
                        }`}
                      >
                        <span className="text-lg">👤</span>
                        <span>{user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => { logout(); setIsOpen(false); }}
                        className={`w-full py-3 px-4 rounded-xl font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors ${
                          isRtl ? 'text-right' : 'text-left'
                        }`}
                      >
                        {t('logout')}
                      </button>
                    </li>
                  </>
                ) : (
                  <li className="border-t border-slate-200/60 dark:border-slate-800 pt-2.5">
                    <button
                      onClick={() => closeAndNavigate('login')}
                      className="w-full py-3 px-4 rounded-xl font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-colors text-center"
                    >
                      {t('signIn')}
                    </button>
                  </li>
                )}
              </ul>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </m.nav>
  );
};

export default Navigation;