import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import LatestPostsCarousel from '../components/home/LatestPostsCarousel';
import CountUp from '../components/animation/CountUp';
import FloatingLines from '../components/animation/background_Floating Lines';
import PopularBlogsCarousel from "../components/home/PopularBlogsCarousel";
import MostViewedBlogsCarousel from "../components/home/MostViewedBlogsCarousel";
import FavoritePlantsCarousel from "../components/home/FavoritePlantsCarousel";
import MostViewedDiseasesCarousel from "../components/home/MostViewedDiseasesCarousel";

interface HomeProps {
  navigateTo: (page: string) => void;
}

const parseValue = (valueStr: string) => {
  const match = valueStr.match(/^[\d.]+/);
  if (!match) return { number: 0, suffix: valueStr };
  
  const number = parseFloat(match[0]);
  const suffix = valueStr.replace(match[0], '');
  return { number, suffix };
};

const AnimatedStat: React.FC<{ value: string; from?: number; duration?: number; delay?: number; className?: string; }> = ({ value, from = 0, duration = 1, delay = 0, className = '', ...rest }) => {
  const { number, suffix } = parseValue(value);
  
  return (
    <span className={className}>
      <CountUp
        from={from}
        to={number}
        duration={duration}
        delay={delay}
        direction="up"
        separator=""
        {...rest}
      />
      {suffix}
    </span>
  );
};

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
  const { t, theme } = useLanguageTheme(); 
  const isEn = t('home') === 'Home';

  const linesGradientLight = ["#238161", "#8c3636", "#314f81"]; 
  const linesGradientDark = ["#0c7351", "#482121", "#224988"]; 
  const linesGradient = theme === 'dark' ? linesGradientDark : linesGradientLight;

  const lineCount = theme === 'dark' ? 8 : 9;
  const bendStrength = theme === 'dark' ? -1.5 : -2;

  return (
    <div className="min-h-screen">
      {/* Hero section*/}
      <section className="relative overflow-hidden h-[100vh] py-20 lg:py-28 -mt-[84px]">
        <div className={`absolute inset-0 z-0 ${theme === 'light' ? 'mix-blend-color-burn' : ''}`} id="floating-lines-wrapper">
          <FloatingLines 
            enabledWaves={["middle", "top", "bottom"]}
            lineCount={lineCount}
            lineDistance={8}
            bendRadius={8}
            bendStrength={bendStrength}
            interactive
            parallax
            animationSpeed={1}
            linesGradient={linesGradient}
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 lg:px-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto pt-[85px]"
          >
            <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-700 dark:text-brand-600 text-sm font-medium mb-6">
              <span className="animate-float">🌱</span>
              <span>{isEn ? 'AI-Powered Plant Care' : 'مراقبت از گیاه با هوش مصنوعی'}</span>
            </motion.div>
            <motion.h1
              variants={item}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight"
            >
              PlantCare
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
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white mb-4">
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
                  <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white mb-3">
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

      {/* Carousels*/}
      <section className="py-20 lg:py-24 bg-slate-50/80 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto mb-8 text-center"
          style={{ width: "80%"}}
        />
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white text-center"
        >
          {isEn ? "Our newest blogs" : "تازه ترین مقالات ما"}
        </motion.h2>
          
          <motion.div>
            <LatestPostsCarousel />
          </motion.div>
      </div>
      <div className="container mx-auto px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto mb-8 text-center"
              style={{ width: "80%"}}
            />
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white text-center"
            >
              {isEn ? 'Most favorite Plants' : 'محبوب‌ترین گیاهان'}
            </motion.h2>
           <motion.div>
            <FavoritePlantsCarousel  />
          </motion.div>

      </div>
      <div className="container mx-auto px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto mb-8 text-center"
              style={{ width: "80%"}}
            />
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white text-center"
            >
              {isEn ? 'Most favorite blogs' : 'محبوب‌ترین مقالات '}
            </motion.h2>
           <motion.div>
            <PopularBlogsCarousel  />
          </motion.div>

      </div>
      <div className="container mx-auto px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto mb-8 text-center"
              style={{ width: "80%"}}
            />
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white text-center"
            >
              {isEn ? 'most viewd blogs' : 'پربازدیدترین بیماری‌ها'}
            </motion.h2>
           <motion.div>
            <MostViewedDiseasesCarousel  />
          </motion.div>
      </div>
      <div className="container mx-auto px-4 lg:px-6">  
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto mb-8 text-center"
              style={{ width: "80%"}}
            />
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white text-center"
            >
              {isEn ? 'Most viewd blogs' : 'پربیننده‌ترین مقالات '}
            </motion.h2>
           <motion.div>
            <MostViewedBlogsCarousel  />
          </motion.div>
      </div>
        </section>
      {/* Stats */}
      <section className="py-20 lg:py-24 bg-white dark:bg-slate-900 text-center">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((s, i) => (
              <motion.div key={i} className="stat-item">
                <AnimatedStat
                  value={s.value}
                  from={0}
                  duration={1}
                  delay={i * 0.2} 
                  className="text-center font-display text-4xl lg:text-5xl font-semibold text-brand-600 dark:text-brand-400 mb-2"
                />
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
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6">
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