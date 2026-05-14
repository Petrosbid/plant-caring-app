import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguageTheme } from "../../contexts/LanguageThemeContext";
import Navigation from "./Navigation";
import { LoginPopup } from "./LoginPopup";
import CountryFlag from "react-country-flag";
import { ThemeTransition } from './ThemeTransition';
import { FiBell } from 'react-icons/fi';
import NotificationPopover from './NotificationPopover';

interface HeaderProps {
  navigateTo: (page: string) => void;
  currentPage: string;
  onSearch?: (query: string) => void;
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

const Header: React.FC<HeaderProps> = ({ navigateTo, currentPage, onSearch }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, theme, toggleLanguage, toggleTheme, t } = useLanguageTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const isActive = (key: string) => currentPage === key;
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const flags = {
    en: <>English <CountryFlag countryCode="US" svg /></>,
    fa: <>فارسی <CountryFlag countryCode="IR" svg /></>
  };

  const renderNavItem = (item: NavItem, index: number) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.key);
    const isRtl = language === 'fa';

      
    return (
      <motion.li
        key={item.key}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        className="relative group"
      >
        <button
          onClick={() => !hasChildren && navigateTo(item.key)}
          className={`nav-link-underline relative px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1 ${
            isItemActive
              ? "text-brand-800 dark:text-brand-400"
              : "text-slate-600 dark:text-slate-300 hover:text-brand-800 dark:hover:text-brand-400"
          }`}
        >
          {t(item.labelKey)}
          {hasChildren && (
            <svg
              className={`w-3 h-3 transition-transform duration-200 group-hover:rotate-180 ${isRtl ? 'mr-1' : 'ml-1'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {hasChildren && (
          <div
            className={`absolute mt-2 w-64 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 ${
              isRtl ? 'right-0' : 'left-0'
            }`}
          >
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/60 dark:border-slate-700/50 overflow-hidden"
            >
              {item.children!.map((child) => (
                <button
                  key={child.key}
                  onClick={() => navigateTo(child.key)}
                  className={`block w-full text-left px-5 py-3 text-sm transition-all duration-150 ${
                    isActive(child.key)
                      ? "text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  } ${isRtl ? 'text-right' : 'text-left'}`}
                >
                  {t(child.labelKey)}
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </motion.li>
    );
  };

  return (
    <>
      <Navigation navigateTo={navigateTo} currentPage={currentPage} />
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="hidden md:block sticky top-0 z-40 glass border-b border-slate-200/60 dark:border-slate-700/50 shadow-sm backdrop-blur-lg rounded-xl mt-4 ml-auto mr-auto w-[90%]"
        dir={language === 'fa' ? 'rtl' : 'ltr'}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            <motion.button
              onClick={() => navigateTo("home")}
              className="flex items-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🌱</span>
              <span className="font-display text-xl font-bold text-brand-800 dark:text-brand-400">PlantCare</span>
            </motion.button>

            <ul className="flex items-center gap-1 list-none">
              {navItems.map((item, i) => renderNavItem(item, i))}
            </ul>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={toggleLanguage}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {language === "en" ? flags.fa : flags.en}
              </motion.button>
               {isAuthenticated && (
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors relative"
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiBell className="w-5 h-5" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                      )}
                    </motion.button>
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 z-50"
                        >
                          <NotificationPopover onClose={() => setShowNotifications(false)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              <ThemeTransition speed={1.0} blur={1} onToggle={toggleTheme}>
                <motion.button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  {theme === "light" ? "☀️" : "🌙"}
                </motion.button>
              </ThemeTransition>
              {isAuthenticated ? (
                <motion.button
                  onClick={() => navigateTo("profile")}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span>🙋</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => navigateTo("login")}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-700 text-white hover:bg-brand-800"
                >
                  {t("signIn")}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLogin={() => {
          setShowLoginPopup(false);
          navigateTo("login");
        }}
      />
    </>
  );
};

export default Header;