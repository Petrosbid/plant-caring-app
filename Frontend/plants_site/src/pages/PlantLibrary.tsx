import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { plantService } from '../services/api';
import { useUserPlants } from '../hooks/useUserPlants';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import { LoaderGooeyBlobs } from '../components/animation/gooey-loader';
import type { Plant } from '../types';
import FadeContent from '../components/animation/Fadein';

const FILTER_OPTIONS: Record<
  string,
  {
    labelEn: string;
    labelFa: string;
    values: { en: string; fa: string; query: string }[];
  }
> = {
  watering_frequency: {
    labelEn: 'Watering',
    labelFa: 'میزان آب',
    values: [
      { en: 'Very Low', fa: 'خیلی کم', query: 'very low' },
      { en: 'Low', fa: 'کم', query: 'low' },
      { en: 'Medium', fa: 'متوسط', query: 'medium' },
      { en: 'High', fa: 'زیاد', query: 'high' },
      { en: 'Very High', fa: 'خیلی زیاد', query: 'very high' },
    ],
  },
  fertilizer_schedule: {
    labelEn: 'Fertilizer',
    labelFa: 'کوددهی',
    values: [
      { en: 'Never', fa: 'هرگز', query: 'never' },
      { en: 'Once a year', fa: 'سالی یکبار', query: 'once a year' },
      { en: 'Every 3 months', fa: 'هر ۳ ماه', query: 'every 3 months' },
      { en: 'Monthly', fa: 'ماهانه', query: 'monthly' },
      { en: 'Every 2 weeks', fa: 'هر ۲ هفته', query: 'every 2 weeks' },
      { en: 'Weekly', fa: 'هفتگی', query: 'weekly' },
    ],
  },
  light_requirements: {
    labelEn: 'Light',
    labelFa: 'نور',
    values: [
      { en: 'Low Light', fa: 'نور کم', query: 'low light' },
      { en: 'Medium Indirect', fa: 'نور غیرمستقیم متوسط', query: 'medium indirect light' },
      { en: 'Bright Indirect', fa: 'نور غیرمستقیم زیاد', query: 'bright indirect light' },
      { en: 'Direct Sun', fa: 'نور مستقیم', query: 'direct sun' },
      { en: 'Full/Partial Sun', fa: 'آفتاب کامل تا نیمه‌سایه', query: 'full sun to partial shade' },
    ],
  },
  humidity_level: {
    labelEn: 'Humidity',
    labelFa: 'رطوبت',
    values: [
      { en: 'Low', fa: 'کم', query: 'low' },
      { en: 'Moderate', fa: 'متوسط', query: 'moderate' },
      { en: 'High', fa: 'زیاد', query: 'high' },
      { en: 'Very High', fa: 'خیلی زیاد', query: 'very high' },
    ],
  },
  temperature_range: {
    labelEn: 'Temperature',
    labelFa: 'دما',
    values: [
      { en: '10-15°C', fa: '۱۰-۱۵ درجه', query: '10-15°C' },
      { en: '15-20°C', fa: '۱۵-۲۰ درجه', query: '15-20°C' },
      { en: '18-24°C', fa: '۱۸-۲۴ درجه', query: '18-24°C' },
      { en: '20-30°C', fa: '۲۰-۳۰ درجه', query: '20-30°C' },
      { en: 'Above 15°C', fa: 'بالای ۱۵ درجه', query: 'above 15°C' },
      { en: 'Above 20°C', fa: 'بالای ۲۰ درجه', query: 'above 20°C' },
    ],
  },
  soil_type: {
    labelEn: 'Soil',
    labelFa: 'خاک',
    values: [
      { en: 'Cactus Mix', fa: 'خاک کاکتوس', query: 'cactus mix' },
      { en: 'Succulent Mix', fa: 'خاک ساکولنت', query: 'succulent mix' },
      { en: 'Standard Potting', fa: 'خاک گلدان استاندارد', query: 'standard potting mix' },
      { en: 'Peat-based', fa: 'خاک پیت', query: 'peat-based mix' },
      { en: 'Loamy Soil', fa: 'خاک لومی', query: 'loamy soil' },
      { en: 'Orchid Bark', fa: 'پوست درخت ارکیده', query: 'orchid bark mix' },
    ],
  },
  pruning_info: {
    labelEn: 'Pruning',
    labelFa: 'هرس',
    values: [
      { en: 'Minimal', fa: 'حداقل', query: 'minimal' },
      { en: 'Light', fa: 'سبک', query: 'light pruning' },
      { en: 'Regular', fa: 'معمولی', query: 'regular pruning' },
      { en: 'Heavy', fa: 'سنگین', query: 'heavy pruning' },
    ],
  },
  propagation_methods: {
    labelEn: 'Propagation',
    labelFa: 'تکثیر',
    values: [
      { en: 'Stem Cuttings', fa: 'قلمه ساقه', query: 'stem cuttings' },
      { en: 'Leaf Cuttings', fa: 'قلمه برگ', query: 'leaf cuttings' },
      { en: 'Root Division', fa: 'تقسیم ریشه', query: 'root division' },
      { en: 'Seeds', fa: 'بذر', query: 'seeds' },
      { en: 'Air Layering', fa: 'خوابانیدن هوایی', query: 'air layering' },
      { en: 'Offsets / Pups', fa: 'پاجوش', query: 'offsets / pups' },
    ],
  },
  care_difficulty: {
    labelEn: 'Difficulty',
    labelFa: 'سختی',
    values: [
      { en: 'Easy', fa: 'آسان', query: 'easy' },
      { en: 'Medium', fa: 'متوسط', query: 'medium' },
      { en: 'Hard', fa: 'سخت', query: 'hard' },
    ],
  },
  is_toxic: {
    labelEn: 'Toxicity',
    labelFa: 'سمی بودن',
    values: [
      { en: 'Toxic', fa: 'سمی', query: 'true' },
      { en: 'Non‑toxic', fa: 'غیرسمی', query: 'false' },
    ],
  },
};

const SORT_OPTIONS = [
  { key: '-created_at', labelEn: 'Newest', labelFa: 'جدیدترین' },
  { key: '-view_count', labelEn: 'Most Viewed', labelFa: 'پربازدیدترین' },
  { key: '-favourite_count', labelEn: 'Most Favorited', labelFa: 'محبوب‌ترین' },
  { key: '-garden_count', labelEn: 'Most in Garden', labelFa: 'بیشترین در باغچه' },
];

const QuickInfoChip: React.FC<{ icon: string; label: string; value: string; className?: string }> = ({
  icon,
  label,
  value,
  className = '',
}) => (
  <div
    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ${className}`}
    title={`${label}: ${value}`}
  >
    <span className="text-sm leading-none">{icon}</span>
    <span className="truncate max-w-[100px]">{value}</span>
  </div>
);

const PlantCard: React.FC<{ plant: Plant; language: 'en' | 'fa'; isInGarden: boolean;   delay?: number;}> = ({
  plant,
  language,
  isInGarden,
  delay = 0
}) => {
  const name = language === 'en' ? plant.english_name || plant.farsi_name : plant.farsi_name;
  const difficulty = plant.care_difficulty_display?.[language] || plant.care_difficulty;
  const toxicLabel = plant.is_toxic
    ? language === 'en' ? 'Toxic' : 'سمی'
    : language === 'en' ? 'Non‑toxic' : 'غیرسمی';
  const light = language === 'en' ? plant.light_requirements_en || plant.light_requirements : plant.light_requirements;
  const water = language === 'en' ? plant.watering_frequency_en || plant.watering_frequency : plant.watering_frequency;
  return (
    <FadeContent delay={delay} blur={true} duration={1000} ease="ease-out" initialOpacity={0.1}>
    <motion.div
      className="group bg-white dark:bg-slate-800/80 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-700/50 overflow-hidden hover:shadow-card-hover transition-all duration-300 relative"
    >
      {isInGarden && (
        <span className="absolute top-3 right-3 z-10 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
          🌱 {language === 'en' ? 'In Garden' : 'در باغ'}
        </span>
      )}
      <Link to={`/plant/${plant.id}`}>
        <div className="h-48 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
          {plant.primary_image ? (
            <img
              src={plant.primary_image}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%23cccccc'/%3E%3Ctext x='12' y='16' font-size='12' text-anchor='middle' fill='%23666666'%3EPlant%3C/text%3E%3C/svg%3E";
              }}
            />
          ) : (
            <span className="text-5xl">🌿</span>
          )}
        </div>
        <div className="p-4">
          {/* Title & Difficulty */}
          <div className="flex justify-between items-start gap-2 mb-1">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white truncate">{name}</h2>
            <span className="flex-shrink-0 px-2 py-0.5 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-semibold">
              {difficulty}
            </span>
          </div>
          <p className="text-sm italic text-slate-500 dark:text-slate-400 mb-3">{plant.scientific_name}</p>

          {/* Quick Info Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {water && <QuickInfoChip icon="💧" label={language === 'en' ? 'Water' : 'آب'} value={water} />}
            {light && <QuickInfoChip icon="☀️" label={language === 'en' ? 'Light' : 'نور'} value={light} />}
            <QuickInfoChip
              icon={plant.is_toxic ? '⚠️' : '✅'}
              label={language === 'en' ? 'Toxic' : 'سمی'}
              value={toxicLabel}
              className={plant.is_toxic ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' : ''}
            />
          </div>

          {/* Description (short) */}
          <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-3">
            {language === 'en' ? plant.description_en || plant.description : plant.description}
          </p>

          {/* Stats */}
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <span>👁 {plant.view_count}</span>
            <span>❤️ {plant.favourite_count}</span>
            <span>🏡 {plant.garden_count}</span>
          </div>
        </div>
      </Link>
    </motion.div>
    </FadeContent>
  );
};

/* ---------- MAIN COMPONENT ---------- */
const PlantLibrary: React.FC = () => {
  const { t, language } = useLanguageTheme();
  const isEn = language === 'en';
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [ordering, setOrdering] = useState('-created_at'); // پیش‌فرض: جدیدترین

  const { userPlants } = useUserPlants();

  const observer = useRef<IntersectionObserver | null>(null);
  const lastPlantRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Fetch plants
  useEffect(() => {
    const fetchPlants = async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          page_size: 12,
          search: search || undefined,
          ordering,
          ...filters,
        };
        const data = await plantService.getPlants(params);
        const newPlants = data.results || [];
        setPlants((prev) => (page === 1 ? newPlants : [...prev, ...newPlants]));
        setHasMore(!!data.next);
      } catch (err) {
        console.error('Failed to fetch plants', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlants();
  }, [page, search, filters, ordering]);

  // Reset page when search/filters/ordering change
  useEffect(() => {
    setPage(1);
  }, [search, filters, ordering]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const current = prev[key];
      if (current === value) {
        const { [key]: _, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [key]: value };
      }
    });
  };

  const isPlantInGarden = (plantId: number) => userPlants.some((up) => up.plant === plantId);

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 min-h-screen" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl lg:text-4xl font-bold text-center text-brand-700 dark:text-brand-400 mb-8"
      >
        {t('library')}
      </motion.h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-2xl shadow p-5 border border-slate-200/60 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {isEn ? 'Filters' : 'فیلترها'}
            </h2>
            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
              {Object.entries(FILTER_OPTIONS).map(([key, { labelEn, labelFa, values }]) => (
                <div key={key}>
                  <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {isEn ? labelEn : labelFa}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {values.map(({ en, fa, query }) => {
                      const isActive = filters[key] === query;
                      const display = isEn ? en : fa;
                      return (
                        <button
                          key={query}
                          onClick={() => handleFilterChange(key, query)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            isActive
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {display}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isEn ? 'Search plants...' : 'جستجوی گیاهان...'}
                className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">🔍</span>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              )}
            </div>
            {/* Sort Selector */}
            <div className="flex flex-wrap gap-2 items-center">
              {SORT_OPTIONS.map((opt) => {
                const isActive = ordering === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setOrdering(opt.key)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isEn ? opt.labelEn : opt.labelFa}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plant Grid */}
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {plants.map((plant, index) => {
                const isLast = index === plants.length - 1;
                const fadeDelay = index * 0.05;
                return (
                  <div key={plant.id} ref={isLast ? lastPlantRef : null}>
                    <PlantCard plant={plant} language={language} isInGarden={isPlantInGarden(plant.id)} delay={fadeDelay}   />
                  </div>
                );
              })}
          </motion.div>

          {loading && (
            <div className="flex justify-center py-8">
              <LoaderGooeyBlobs size={25} color="#10b981" />
            </div>
          )}
          {!hasMore && plants.length > 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400 mt-8">
              {isEn ? 'All plants loaded.' : 'همه گیاهان بارگذاری شدند.'}
            </p>
          )}
          {!loading && plants.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <span className="text-5xl mb-4 block">🔍</span>
              <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {isEn ? 'No plants found' : 'گیاهی یافت نشد'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                {isEn ? 'Try different filters.' : 'فیلترها را تغییر دهید.'}
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PlantLibrary;