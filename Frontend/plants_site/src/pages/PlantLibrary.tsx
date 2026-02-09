import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlants } from '../hooks/usePlants';
import { useUserPlants } from '../hooks/useUserPlants';
import { debounce } from '../utils/helpers';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';

interface PlantLibraryProps {
  navigateTo?: (page: string, params?: Record<string, string>) => void;
}

const PlantLibrary: React.FC<PlantLibraryProps> = ({ navigateTo }) => {
  const { t } = useLanguageTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const { plants, loading, error } = usePlants();
  const { userPlants, removeUserPlant, loading: userPlantsLoading } = useUserPlants();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const isEn = t('home') === 'Home';

  React.useEffect(() => {
    const debouncedFn = debounce((term: string) => setDebouncedSearchTerm(term), 500);
    debouncedFn(searchTerm);
  }, [searchTerm]);

  // Check if a plant is in the user's garden
  const isInGarden = (plantId: number) => {
    return userPlants.some(userPlant => userPlant.plant === plantId);
  };

  // Get the user plant ID for a given plant
  const getUserPlantId = (plantId: number) => {
    const userPlant = userPlants.find(userPlant => userPlant.plant === plantId);
    return userPlant ? userPlant.id : null;
  };

  const filteredPlants = plants.filter(
    (plant) =>
      (plant.farsi_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (plant.scientific_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (plant.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-16 flex justify-center items-center min-h-[40vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-2 border-brand-500 border-t-transparent"
          />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {isEn ? 'Loading plant library...' : 'در حال بارگذاری کتابخانه گیاهان...'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-10 lg:py-14">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl lg:text-4xl font-bold text-center text-brand-700 dark:text-brand-400 mb-10"
      >
        {t('library')}
      </motion.h1>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-xl text-center text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative max-w-xl mx-auto">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg">🔍</span>
          <input
            type="text"
            placeholder={isEn ? 'Search plants by name, category...' : 'جستجوی گیاهان بر اساس نام، دسته...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
          />
        </div>
      </motion.div>

      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredPlants.map((plant, i) => (
            <motion.div
              key={plant.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.3 }}
              className="group bg-white dark:bg-slate-800/80 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-700/50 overflow-hidden hover:shadow-card-hover transition-all duration-300"
            >
              <div className="h-48 bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
                {plant.primary_image ? (
                  <img
                    src={plant.primary_image}
                    alt={plant.farsi_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite loop
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%23cccccc'/%3E%3Ctext x='12' y='16' font-size='12' text-anchor='middle' fill='%23666666'%3EPlant Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <span className="text-5xl">🌿</span>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <h2 className="font-display text-xl font-bold text-brand-700 dark:text-brand-400 truncate">
                    {plant.farsi_name}
                  </h2>
                  <span className="flex-shrink-0 px-2.5 py-0.5 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-semibold">
                    {plant.care_difficulty}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 italic text-sm mb-4">{plant.scientific_name}</p>
                <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium w-16">{isEn ? 'Light:' : 'نور:'}</span>
                    <span className="truncate">{plant.light_requirements}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium w-16">{isEn ? 'Water:' : 'آب:'}</span>
                    <span className="truncate">{plant.watering_frequency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium w-16">{isEn ? 'Toxic:' : 'سمی:'}</span>
                    <span>{plant.is_toxic ? (isEn ? 'Yes' : 'بله') : (isEn ? 'No' : 'خیر')}</span>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">{plant.description}</p>

                <div className="flex gap-2">
                  <motion.button
                    onClick={() => navigateTo?.('plant-details', { id: plant.id.toString() })}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-brand-100 dark:bg-brand-900/50 hover:bg-brand-200 dark:hover:bg-brand-800/50 text-brand-700 dark:text-brand-300 font-medium text-sm transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isEn ? 'View Details' : 'مشاهده جزئیات'}
                  </motion.button>

                  {isInGarden(plant.id) && (
                    <motion.button
                      onClick={async () => {
                        const userPlantId = getUserPlantId(plant.id);
                        if (userPlantId) {
                          try {
                            await removeUserPlant(userPlantId);
                          } catch (err) {
                            console.error('Failed to remove plant from garden:', err);
                            // Error is already handled in the hook
                          }
                        }
                      }}
                      className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 font-medium text-sm transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={isEn ? 'Remove from garden' : 'حذف از باغ'}
                    >
                      🗑️
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {filteredPlants.length === 0 && debouncedSearchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {isEn ? 'No plants found' : 'گیاهی یافت نشد'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isEn ? 'Try adjusting your search terms' : 'تلاش کنید عبارات جستجوی خود را تنظیم کنید'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredPlants.length === 0 && !debouncedSearchTerm && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <span className="text-5xl mb-4 block">🌱</span>
          <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {isEn ? 'Plant library is empty' : 'کتابخانه گیاهان خالی است'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isEn ? 'Check back later for more plants' : 'بعداً برای گیاهان بیشتر بازگردید'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default PlantLibrary;
