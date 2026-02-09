import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';

interface HomeProps {
  navigateTo: (page: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  visible: (_i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  }),
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const features = [
  {
    icon: '🌿',
    titleKey: 'identify' as const,
    descEn: 'Snap a photo and instantly identify thousands of plant species with our advanced AI technology.',
    descFa: 'عکس بگیرید و فوراً هزاران گونه گیاه را با فناوری پیشرفته هوش مصنوعی ما شناسایی کنید.',
    page: 'identify' as const,
  },
  {
    icon: '🪴',
    titleKey: 'disease' as const,
    descEn: 'Detect plant diseases early and get treatment recommendations to save your plants.',
    descFa: 'بیماری‌های گیاهی را زودهنگام تشخیص دهید و توصیه‌های درمانی را برای نجات گیاهانتان دریافت کنید.',
    page: 'disease' as const,
  },
  {
    icon: '💧',
    titleKey: 'reminders' as const,
    descEn: "Never forget to water your plants with personalized reminders tailored to each plant's needs.",
    descFa: 'هرگز فراموش نکنید گیاهانتان را آبیاری کنید با یادآوری‌های شخصی‌سازی شده متناسب با نیازهای هر گیاه.',
    page: 'reminders' as const,
  },
];

const stats = [
  { value: '10K+', labelEn: 'Happy Users', labelFa: 'کاربران خوشحال' },
  { value: '500+', labelEn: 'Plant Species', labelFa: 'گونه گیاهی' },
  { value: '98%', labelEn: 'Accuracy Rate', labelFa: 'نرخ دقت' },
  { value: '24/7', labelEn: 'Support', labelFa: 'پشتیبانی' },
];

const Home: React.FC<HomeProps> = ({ navigateTo }) => {
  const { t } = useLanguageTheme();
  const isEn = t('home') === 'Home';

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-mesh bg-gradient-to-br from-brand-50 via-white to-emerald-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-brand-950/30 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,197,94,0.12),transparent)] dark:opacity-60" />
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-700 dark:text-brand-600 text-sm font-medium mb-6">
              <span className="animate-float">🌱</span>
              <span>{isEn ? 'AI-Powered Plant Care' : 'مراقبت از گیاه با هوش مصنوعی'}</span>
            </motion.div>
            <motion.h1
              variants={item}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight"
            >
              PlantCare Pro
            </motion.h1>
            <motion.p
              variants={item}
              className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              {isEn
                ? 'Identify plants, detect diseases, and get personalized care tips for your green companions'
                : 'شناسایی گیاهان، تشخیص بیماری‌ها و دریافت نکات مراقبت شخصی‌سازی شده برای همدمان سبز'}
            </motion.p>
            <motion.div variants={item} className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="primary" size="lg" onClick={() => navigateTo('identify')}>
                {t('identify')}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigateTo('disease')}>
                {t('disease')}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-24 bg-slate-50/80 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {isEn ? 'Powerful Plant Care Tools' : 'ابزارهای قدرتمند مراقبت از گیاه'}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
              {isEn
                ? 'Everything you need to keep your plants healthy and thriving'
                : 'همه چیزی که برای سالم و پررونق نگه داشتن گیاهانتان نیاز دارید'}
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((f) => (
              <motion.div
                key={f.page}
                variants={item}
                className="group relative bg-white dark:bg-slate-800/80 rounded-2xl p-8 shadow-card hover:shadow-card-hover border border-slate-200/60 dark:border-slate-700/50 transition-all duration-300 overflow-hidden"
                whileHover={{ y: -6 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {f.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {t(f.titleKey)}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    {isEn ? f.descEn : f.descFa}
                  </p>
                  <button
                    onClick={() => navigateTo(f.page)}
                    className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-medium hover:gap-3 transition-all"
                  >
                    {isEn ? 'Learn more' : 'بیشتر بدانید'}
                    <span className="text-lg">→</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 lg:py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-4xl lg:text-5xl font-bold text-brand-600 dark:text-brand-400 mb-2">
                  {s.value}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  {isEn ? s.labelEn : s.labelFa}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-700 to-emerald-800" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto text-white"
          >
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              {isEn ? 'Ready to become a plant expert?' : 'آماده شدن یک متخصص گیاه هستید؟'}
            </h2>
            <p className="text-white/90 text-lg mb-10">
              {isEn
                ? 'Join thousands of plant lovers who trust our app to care for their green friends'
                : 'به هزاران عاشق گیاه بپیوندید که به برنامه ما اعتماد می‌کنند تا از دوستان سبزشان مراقبت کنند'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="secondary" size="lg" onClick={() => navigateTo('identify')}>
                {isEn ? 'Get Started' : 'شروع کنید'}
              </Button>
              <motion.button
                onClick={() => navigateTo('library')}
                className="px-6 py-3 rounded-xl font-medium bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {isEn ? 'Explore Plants' : 'کشف گیاهان'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
