// src/pages/MyGardenPage.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiSearch } from 'react-icons/fi';
import { useUserPlants } from '../hooks/useUserPlants';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import { LoaderGooeyBlobs } from '../components/animation/gooey-loader';
import PlantDetailModal from '../components/garden/PlantDetailModal';
import type { UserPlant } from '../types';

// ===== آپشن‌های مرتب‌سازی =====
const SORT_OPTIONS = [
  { key: 'added_date_desc', labelEn: 'Newest First', labelFa: 'جدیدترین' },
  { key: 'added_date_asc', labelEn: 'Oldest First', labelFa: 'قدیمی‌ترین' },
  { key: 'next_watering', labelEn: 'Next Watering', labelFa: 'آبیاری بعدی' },
  { key: 'health_status', labelEn: 'Health Status', labelFa: 'وضعیت سلامت' },
  { key: 'name', labelEn: 'Name A‑Z', labelFa: 'نام الفبایی' },
];

// ===== کامپوننت کارت گیاه باغچه =====
const GardenPlantCard: React.FC<{
  userPlant: UserPlant;
  language: 'en' | 'fa';
  onOpenDetail: () => void;
}> = ({ userPlant, language, onOpenDetail }) => {
  const plant = userPlant.plant_details!;
  const isEn = language === 'en';
  const originalName = isEn ? (plant.english_name || plant.farsi_name) : plant.farsi_name;
  const displayName = userPlant.nickname || originalName;
  const waterDue = userPlant.next_watering_date
    ? new Date(userPlant.next_watering_date).toLocaleDateString(isEn ? 'en-US' : 'fa-IR')
    : null;
  const fertDue = userPlant.next_fertilizing_date
    ? new Date(userPlant.next_fertilizing_date).toLocaleDateString(isEn ? 'en-US' : 'fa-IR')
    : null;
  const pruneDue = userPlant.next_pruning_date
    ? new Date(userPlant.next_pruning_date).toLocaleDateString(isEn ? 'en-US' : 'fa-IR')
    : null;

  const healthColor =
    userPlant.health_status === 'healthy'
      ? 'bg-green-500'
      : userPlant.health_status === 'needs_attention'
      ? 'bg-yellow-500'
      : 'bg-red-500';

  const healthLabel =
    userPlant.health_status === 'healthy'
      ? isEn ? 'Healthy' : 'سالم'
      : userPlant.health_status === 'needs_attention'
      ? isEn ? 'Needs Attention' : 'نیاز به توجه'
      : isEn ? 'Unhealthy' : 'ناسالم';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 dark:border-slate-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
      onClick={onOpenDetail}
    >
      {/* تصویر */}
      <div className="h-44 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
        {plant.primary_image ? (
          <img
            src={plant.primary_image}
            alt={originalName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-5xl">🌿</span>
        )}

        {/* نام گیاه */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="text-white font-semibold text-sm truncate">{displayName}</h3>
          {userPlant.nickname && (
            <p className="text-white/80 text-xs truncate">{originalName}</p>
          )}
        </div>
      </div>

      {/* اطلاعات */}
      <div className="p-4 space-y-3">
        {/* وضعیت سلامت */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {healthLabel}
          </span>
          <span className={`w-3 h-3 rounded-full ${healthColor}`} />
        </div>

        {/* یادآوری‌ها */}
        <div className="space-y-1 text-xs">
          {waterDue && (
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>💧 {isEn ? 'Water' : 'آب'}:</span>
              <span>{waterDue}</span>
            </div>
          )}
          {fertDue && (
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>🌿 {isEn ? 'Fert' : 'کود'}:</span>
              <span>{fertDue}</span>
            </div>
          )}
          {pruneDue && (
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>✂️ {isEn ? 'Prune' : 'هرس'}:</span>
              <span>{pruneDue}</span>
            </div>
          )}
        </div>

        {/* یادداشت (خلاصه) */}
        {userPlant.notes && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            📝 {userPlant.notes}
          </p>
        )}

        {/* دکمه‌ی صفحه عمومی گیاه */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <Link
            to={`/plant/${plant.id}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
            onClick={(e) => e.stopPropagation()}
            title={isEn ? 'View plant details' : 'مشاهده جزئیات گیاه'}
          >
            <FiExternalLink className="w-3 h-3" />
            {isEn ? 'Plant Page' : 'صفحه گیاه'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// ===== صفحه اصلی =====
const MyGardenPage: React.FC = () => {
  const { language } = useLanguageTheme();
  const isEn = language === 'en';
  const { userPlants, loading, updateUserPlant , refreshUserPlants, } = useUserPlants();
  const [selectedPlant, setSelectedPlant] = useState<UserPlant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('added_date_desc');

  // فیلتر و مرتب‌سازی
  const filteredAndSorted = useMemo(() => {
    let plants = [...userPlants];

    // جستجو
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      plants = plants.filter((up) => {
        const plant = up.plant_details;
        const fields = [
          plant?.farsi_name,
          plant?.english_name,
          plant?.scientific_name,
          up.nickname,
          up.notes,
        ];
        return fields.some(
          (field) => field && field.toLowerCase().includes(query)
        );
      });
    }

    // مرتب‌سازی
    switch (sortKey) {
      case 'added_date_asc':
        plants.sort((a, b) => new Date(a.added_date).getTime() - new Date(b.added_date).getTime());
        break;
      case 'next_watering':
        plants.sort((a, b) => {
          const aDate = a.next_watering_date ? new Date(a.next_watering_date).getTime() : Infinity;
          const bDate = b.next_watering_date ? new Date(b.next_watering_date).getTime() : Infinity;
          return aDate - bDate;
        });
        break;
      case 'health_status': {
        const order = ['healthy', 'needs_attention', 'unhealthy'];
        plants.sort((a, b) => order.indexOf(a.health_status) - order.indexOf(b.health_status));
        break;
      }
      case 'name':
        plants.sort((a, b) => {
          const nameA = a.nickname || a.plant_details?.farsi_name || '';
          const nameB = b.nickname || b.plant_details?.farsi_name || '';
          return nameA.localeCompare(nameB, 'fa');
        });
        break;
      default: // added_date_desc
        plants.sort((a, b) => new Date(b.added_date).getTime() - new Date(a.added_date).getTime());
        break;
    }

    return plants;
  }, [userPlants, searchTerm, sortKey]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoaderGooeyBlobs size={30} color="#10b981" />
      </div>
    );
  }

  if (userPlants.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl mb-4 block">🌱</span>
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
          {isEn ? 'Your garden is empty.' : 'باغچه شما خالی است.'}
        </h2>
        <Link to="/library" className="mt-4 inline-block text-green-600 hover:underline">
          {isEn ? 'Explore plants to add' : 'گیاهان را کاوش کنید'}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 min-h-screen" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl lg:text-4xl font-semibold text-center text-brand-700 dark:text-brand-400 mb-8"
      >
        {isEn ? 'My Garden' : 'باغ من'}
      </motion.h1>

      {/* نوار جستجو و مرتب‌سازی */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isEn ? 'Search your garden...' : 'جستجو در باغچه...'}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {SORT_OPTIONS.map((opt) => {
            const isActive = sortKey === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
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

      {/* گرید کارت‌ها */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredAndSorted.map((up) => (
            <GardenPlantCard
              key={up.id}
              userPlant={up}
              language={language}
              onOpenDetail={() => setSelectedPlant(up)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🔍</span>
          <p className="text-slate-500 dark:text-slate-400">
            {isEn ? 'No plants match your search.' : 'گیاهی با این مشخصات یافت نشد.'}
          </p>
        </div>
      )}

      {/* مودال جزئیات */}
      <AnimatePresence>
        {selectedPlant && (
          <PlantDetailModal
            userPlant={selectedPlant}
            language={language}
            onClose={() => setSelectedPlant(null)}
            onUpdate={async (updatedData) => {
              await updateUserPlant(selectedPlant.id, updatedData);
              setSelectedPlant(null);
            }}
             onRefresh={refreshUserPlants}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyGardenPage;