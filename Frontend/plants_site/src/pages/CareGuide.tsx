import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';

const CareGuide: React.FC = () => {
  const { t } = useLanguageTheme();
  const [activeTab, setActiveTab] = useState('watering');

  const careGuides = {
    watering: {
      title: '💧 ' + (t('home') === 'Home' ? 'Watering Guide' : 'راهنمای آبیاری'),
      description: t('home') === 'Home'
        ? 'Proper watering is essential for healthy plants. Different plants have different needs.'
        : 'آبیاری مناسب برای گیاهان سالم ضروری است. گیاهان مختلف نیازهای متفاوتی دارند.',
      tips: [
        t('home') === 'Home' ? 'Check soil moisture before watering' : 'قبل از آبیاری رطوبت خاک را بررسی کنید',
        t('home') === 'Home' ? 'Water deeply but less frequently' : 'عمیق اما کمتر آبیاری کنید',
        t('home') === 'Home' ? 'Morning is the best time to water' : 'صبح بهترین زمان برای آبیاری است',
        t('home') === 'Home' ? 'Use room temperature water' : 'از آب دمای اتاق استفاده کنید',
        t('home') === 'Home' ? 'Ensure proper drainage to prevent root rot' : 'درازه خوب برای جلوگیری از پوسیدگی ریشه فراهم کنید',
        t('home') === 'Home' ? 'Adjust watering frequency based on seasons' : 'فرکانس آبیاری را بر اساس فصل تنظیم کنید'
      ]
    },
    light: {
      title: '☀️ ' + (t('home') === 'Home' ? 'Light Requirements' : 'نیازهای نوری'),
      description: t('home') === 'Home'
        ? 'Understanding light needs helps plants thrive in the right environment.'
        : 'درک نیازهای نوری به گیاهان کمک می‌کند تا در محیط مناسب رشد کنند.',
      tips: [
        t('home') === 'Home' ? 'Direct sunlight: 6+ hours (South-facing windows)' : 'نور مستقیم خورشید: 6+ ساعت (پنجره‌های جنوبی)',
        t('home') === 'Home' ? 'Bright indirect light: near a window (East/West-facing)' : 'نور غیرمستقیم روشن: نزدیک یک پنجره (شرقی/غربی)',
        t('home') === 'Home' ? 'Low light: further from windows (North-facing)' : 'نور کم: دورتر از پنجره‌ها (شمالی)',
        t('home') === 'Home' ? 'Rotate plants regularly for even growth' : 'گیاهان را به طور منظم بچرخانید تا رشد یکنواخت داشته باشند',
        t('home') === 'Home' ? 'Consider grow lights for low-light situations' : 'برای موقعیت‌های کم نور از چراغ‌های رشد استفاده کنید',
        t('home') === 'Home' ? 'Watch for signs of too much or too little light' : 'به نشانه‌های نور بیش از حد یا کمتر از حد توجه کنید'
      ]
    },
    fertilizing: {
      title: '🌿 ' + (t('home') === 'Home' ? 'Fertilizing Tips' : 'نکات کوددهی'),
      description: t('home') === 'Home'
        ? 'Feed your plants the nutrients they need to grow strong and healthy.'
        : 'گیاهان خود را با مواد مغذی مورد نیاز برای رشد قوی و سالم تغذیه کنید.',
      tips: [
        t('home') === 'Home' ? 'Use balanced fertilizer during growing season' : 'در فصل رشد از کود متعادل استفاده کنید',
        t('home') === 'Home' ? 'Reduce feeding in winter months' : 'در ماه‌های زمستان تغذیه را کاهش دهید',
        t('home') === 'Home' ? 'Follow package instructions carefully' : 'دستورالعمل‌های بسته را با دقت دنبال کنید',
        t('home') === 'Home' ? 'Fertilize during active growth periods' : 'در دوره‌های رشد فعال کوددهی کنید',
        t('home') === 'Home' ? 'Flush soil occasionally to prevent salt buildup' : 'گاهی خاک را شستشو دهید تا از تجمع نمک جلوگیری شود',
        t('home') === 'Home' ? 'Choose organic options when possible' : 'وقتی امکان دارد گزینه‌های ارگانیک را انتخاب کنید'
      ]
    },
    pruning: {
      title: '✂️ ' + (t('home') === 'Home' ? 'Pruning Guidelines' : 'راهنمای اصلاح شاخه‌ها'),
      description: t('home') === 'Home'
        ? 'Pruning promotes healthy growth and maintains plant shape.'
        : 'اصلاح شاخه‌ها رشد سالم را ترویج می‌دهد و شکل گیاه را حفظ می‌کند.',
      tips: [
        t('home') === 'Home' ? 'Use clean, sharp tools to prevent disease' : 'از ابزارهای تمیز و تیز برای جلوگیری از بیماری استفاده کنید',
        t('home') === 'Home' ? 'Prune during active growing season' : 'در فصل رشد فعال اصلاح کنید',
        t('home') === 'Home' ? 'Remove dead, damaged, or diseased parts first' : 'ابتدا قسمت‌های مرده، آسیب دیده یا بیمار را بردارید',
        t('home') === 'Home' ? 'Cut just above a leaf node or bud' : 'دقیقاً بالای یک گره یا جوانه برش دهید',
        t('home') === 'Home' ? 'Don\'t remove more than 1/3 of the plant at once' : 'بیش از 1/3 گیاه را یکجا نبرید',
        t('home') === 'Home' ? 'Pinch growing tips to encourage bushiness' : 'نکات رشد را قل قل دهید تا گیاه پرپشت شود'
      ]
    }
  };

  const plantCareSchedules = [
    {
      type: t('home') === 'Home' ? 'Succulents' : 'گیاهان گوشتی',
      watering: t('home') === 'Home' ? 'Every 2-3 weeks' : 'هر 2-3 هفته',
      light: t('home') === 'Home' ? 'Bright, direct' : 'روشن، مستقیم',
      fertilizing: t('home') === 'Home' ? 'Monthly in spring/summer' : 'ماهانه در بهار/تابستان',
      pruning: t('home') === 'Home' ? 'As needed' : 'هنگام نیاز'
    },
    {
      type: t('home') === 'Home' ? 'Ferns' : 'فندقیان',
      watering: t('home') === 'Home' ? 'Keep soil moist' : 'خاک را مرطوب نگه دارید',
      light: t('home') === 'Home' ? 'Indirect, low light' : 'غیرمستقیم، نور کم',
      fertilizing: t('home') === 'Home' ? 'Bi-weekly in growing season' : 'دو هفته یکبار در فصل رشد',
      pruning: t('home') === 'Home' ? 'Remove yellow fronds' : 'برگ‌های زرد را بردارید'
    },
    {
      type: t('home') === 'Home' ? 'Orchids' : 'ارکیده‌ها',
      watering: t('home') === 'Home' ? 'Once a week' : 'یک بار در هفته',
      light: t('home') === 'Home' ? 'Bright, indirect' : 'روشن، غیرمستقیم',
      fertilizing: t('home') === 'Home' ? 'Weekly with orchid fertilizer' : 'هفتگی با کود ارکیده',
      pruning: t('home') === 'Home' ? 'After flowering' : 'پس از گل‌دهی'
    },
    {
      type: t('home') === 'Home' ? 'Snake Plant' : 'گیاه مار',
      watering: t('home') === 'Home' ? 'Every 2-3 weeks' : 'هر 2-3 هفته',
      light: t('home') === 'Home' ? 'Low to bright indirect' : 'کم تا غیرمستقیم روشن',
      fertilizing: t('home') === 'Home' ? 'Monthly in growing season' : 'ماهانه در فصل رشد',
      pruning: t('home') === 'Home' ? 'Remove damaged leaves' : 'برگ‌های آسیب دیده را بردارید'
    },
    {
      type: t('home') === 'Home' ? 'Peace Lily' : 'لاله صلح',
      watering: t('home') === 'Home' ? 'When soil feels dry' : 'وقتی خاک خشک است',
      light: t('home') === 'Home' ? 'Low to moderate indirect' : 'کم تا متوسط غیرمستقیم',
      fertilizing: t('home') === 'Home' ? 'Monthly in growing season' : 'ماهانه در فصل رشد',
      pruning: t('home') === 'Home' ? 'Remove dead flowers/leaves' : 'گل‌ها/برگ‌های خشک را بردارید'
    }
  ];

  const isEn = t('home') === 'Home';

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-900/50 py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl lg:text-5xl font-semibold text-brand-700 dark:text-brand-400 mb-4">{t('careGuide')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            {isEn
              ? 'Comprehensive care instructions to help your plants thrive and flourish'
              : 'دستورالعمل‌های جامع مراقبت برای کمک به رشد و شکوفایی گیاهان شما'}
          </p>
        </motion.div>

        {/* Care Tabs */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {Object.keys(careGuides).map((key) => (
              <motion.button
                key={key}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-brand-500 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-brand-500/10 dark:hover:bg-brand-500/20 border border-slate-200/60 dark:border-slate-700/50'
                }`}
                onClick={() => setActiveTab(key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {careGuides[key as keyof typeof careGuides].title.split(' ')[1]}
              </motion.button>
            ))}
          </motion.div>

          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Card
              title={careGuides[activeTab as keyof typeof careGuides].title}
              subtitle={careGuides[activeTab as keyof typeof careGuides].description}
            >
              <ul className="space-y-3">
                {careGuides[activeTab as keyof typeof careGuides].tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-brand-500 mt-0.5">✓</span>
                    <span className="text-slate-700 dark:text-slate-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* Care Schedule Table */}
        <div className="mb-12">
          <Card
            title={isEn ? 'Care Schedule by Plant Type' : 'برنامه مراقبت بر اساس نوع گیاه'}
            subtitle={isEn ? 'Recommended care routines for common houseplants' : 'روتین‌های مراقبت توصیه شده برای گیاهان خانگی رایج'}
          >
            <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-700/50">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {isEn ? 'Plant Type' : 'نوع گیاه'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {isEn ? 'Watering' : 'آبیاری'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {isEn ? 'Light' : 'نور'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {isEn ? 'Fertilizing' : 'کوددهی'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {isEn ? 'Pruning' : 'اصلاح شاخه'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800/50 divide-y divide-slate-200 dark:divide-slate-700">
                  {plantCareSchedules.map((plant, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-slate-800/30' : 'bg-slate-50/80 dark:bg-slate-800/50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{plant.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{plant.watering}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{plant.light}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{plant.fertilizing}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{plant.pruning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <Card
            title={isEn ? 'Seasonal Care' : 'مراقبت فصلی'}
            subtitle={isEn ? 'Adjust care based on the season' : 'مراقبت را بر اساس فصل تنظیم کنید'}
          >
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-brand-500">•</span>
                <span className="text-slate-700 dark:text-slate-300">{isEn ? 'Spring: Increase watering and fertilizing' : 'بهار: آبیاری و کوددهی را افزایش دهید'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500">•</span>
                <span className="text-slate-700 dark:text-slate-300">{isEn ? 'Summer: Watch for increased water needs' : 'تابستان: نیازهای افزایش یافته به آب را رصد کنید'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500">•</span>
                <span className="text-slate-700 dark:text-slate-300">{isEn ? 'Fall: Reduce watering and stop fertilizing' : 'پاییز: آبیاری را کاهش دهید و کوددهی را متوقف کنید'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500">•</span>
                <span className="text-slate-700 dark:text-slate-300">{isEn ? 'Winter: Minimal care, protect from cold' : 'زمستان: مراقبت حداقلی، از سرما محافظت کنید'}</span>
              </li>
            </ul>
          </Card>

          <Card
            title={isEn ? 'Common Problems' : 'مشکلات رایج'}
            subtitle={isEn ? 'How to address typical plant issues' : 'چگونه مشکلات معمول گیاهان را حل کنیم'}
          >
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-brand-500">•</span>
                <span className="text-slate-700 dark:text-slate-300">{isEn ? 'Yellow leaves: Overwatering or nutrient deficiency' : 'برگ‌های زرد: آبیاری بیش از حد یا کمبود مواد مغذی'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500">•</span>
                <span className="text-slate-700 dark:text-slate-300">{isEn ? 'Brown tips: Low humidity or fluoride in water' : 'نکات قهوه‌ای: رطوبت کم یا فلورید در آب'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500">•</span>
                <span className="text-slate-700 dark:text-slate-300">{isEn ? 'Dropping leaves: Stress from environmental changes' : 'ریزش برگ: استرس ناشی از تغییرات محیطی'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500">•</span>
                <span className="text-slate-700 dark:text-slate-300">{isEn ? 'Slow growth: Insufficient light or nutrients' : 'رشد کند: نور یا مواد مغذی ناکافی'}</span>
              </li>
            </ul>
          </Card>

          <Card
            title={isEn ? 'Healthy Habits' : 'عادت‌های سالم'}
            subtitle={isEn ? 'Best practices for plant care' : 'بهترین روش‌ها برای مراقبت از گیاه'}
          >
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-brand-500">•</span>
                <span className="text-slate-700 dark:text-slate-300">{isEn ? 'Inspect plants weekly for pests or problems' : 'گیاهان را هفتگی برای آفات یا مشکلات معاینه کنید'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500">•</span>
                <span className="text-slate-700 dark:text-slate-300">{isEn ? 'Clean leaves monthly to remove dust' : 'برگ‌ها را ماهانه تمیز کنید تا گرد و غبار را بردارید'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500">•</span>
                <span className="text-slate-700 dark:text-slate-300">{isEn ? 'Rotate pots regularly for even growth' : 'گلدان‌ها را به طور منظم بچرخانید تا رشد یکنواخت داشته باشند'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500">•</span>
                <span className="text-slate-700 dark:text-slate-300">{isEn ? 'Group plants with similar needs together' : 'گیاهان با نیازهای مشابه را گروه‌بندی کنید'}</span>
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CareGuide;