import React from 'react';
import { motion } from 'framer-motion';
import { useLanguageTheme } from '../../contexts/LanguageThemeContext';

interface FooterProps {
  navigateTo: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ navigateTo }) => {
  const { t } = useLanguageTheme();
  const isEn = t('home') === 'Home';

  const features = [
    { key: 'identify', labelKey: 'identify' },
    { key: 'disease', labelKey: 'disease' },
    { key: 'care-guide', labelKey: 'careGuide' },
    { key: 'reminders', labelKey: 'reminders' },
  ];

  const navResources: { key: string; labelKey: 'library' }[] = [{ key: 'library', labelKey: 'library' }];
  const extResources: { label: string; href: string }[] = [
    { label: isEn ? 'Blog' : 'بلاگ', href: '#' },
    { label: isEn ? 'Tutorials' : 'آموزش‌ها', href: '#' },
    { label: isEn ? 'Community' : 'جامعه', href: '#' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-auto bg-slate-900 dark:bg-slate-950 text-slate-200"
    >
      <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="lg:col-span-1">
            <motion.div
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-2xl">🌱</span>
              <span className="font-display text-xl font-semibold text-white">Verna</span>
            </motion.div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {isEn
                ? 'Helping plant lovers everywhere take better care of their green companions.'
                : 'کمک به عاشقان گیاه در سراسر جهان برای مراقبت بهتر از همدمان سبزشان.'}
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4">
              {isEn ? 'Features' : 'ویژگی‌ها'}
            </h3>
            <ul className="space-y-3">
              {features.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => navigateTo(item.key)}
                    className="text-slate-400 hover:text-brand-400 transition-colors text-sm"
                  >
                    {t(item.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4">
              {isEn ? 'Resources' : 'منابع'}
            </h3>
            <ul className="space-y-3">
              {navResources.map((r) => (
                <li key={r.key}>
                  <button
                    onClick={() => navigateTo(r.key)}
                    className="text-slate-400 hover:text-brand-400 transition-colors text-sm"
                  >
                    {t(r.labelKey)}
                  </button>
                </li>
              ))}
              {extResources.map((r, i) => (
                <li key={i}>
                  <a href={r.href} className="text-slate-400 hover:text-brand-400 transition-colors text-sm">
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4">
              {isEn ? 'Contact' : 'تماس با ما'}
            </h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <span>📧</span> support@Verna.com
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span> San Francisco, CA
              </li>
            </ul>
            <div className="mt-4">
              <p className="font-display font-semibold text-white mb-2">{isEn ? 'Follow Us' : 'دنبال کنید'}</p>
              <div className="flex gap-3">
                {['📘', '🐦', '📷'].map((icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    className="text-slate-400 hover:text-brand-400 transition-colors text-lg"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700/80 mt-10 pt-8 text-center">
          <p suppressHydrationWarning className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()}  {isEn ? 'Verna. All rights reserved.' : 'تمامی حقوق محفوظ است. ورنا'}
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
