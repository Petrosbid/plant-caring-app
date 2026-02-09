import React, { useState, useEffect } from 'react';
import type { Plant } from '../types';
import { plantService } from '../services/api';
import { useUserPlants } from '../hooks/useUserPlants';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';

interface PlantDetailsProps {
  plantId?: string;
  navigateTo?: (page: string, params?: Record<string, string>) => void;
}

const PlantDetails: React.FC<PlantDetailsProps> = ({ plantId, navigateTo }) => {
  const { t } = useLanguageTheme();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userPlants, removeUserPlant, loading: userPlantsLoading } = useUserPlants();

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        // Use the plantId prop if provided, otherwise look for it in the navigation params
        // For the custom navigation system, we'll need to access the params differently
        // Since we're using a custom navigation system, we'll pass the ID via props
        const id = plantId;
        if (id) {
          const plantData = await plantService.getPlantById(parseInt(id));
          setPlant(plantData);
        } else {
          setError(t('home') === 'Home'
            ? 'Plant ID not provided.'
            : '.شناسه گیاه ارائه نشده است');
        }
      } catch (err) {
        setError(t('home') === 'Home'
          ? 'Failed to load plant details. Please try again.'
          : '.جزئیات گیاه بارگذاری نشد. لطفاً دوباره امتحان کنید');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlant();
  }, [plantId, t]);

  // Check if the current plant is in the user's garden
  const isInGarden = () => {
    if (!plant) return false;
    return userPlants.some(userPlant => userPlant.plant === plant.id);
  };

  // Get the user plant ID for the current plant
  const getUserPlantId = () => {
    if (!plant) return null;
    const userPlant = userPlants.find(userPlant => userPlant.plant === plant.id);
    return userPlant ? userPlant.id : null;
  };

  // Handle removing the plant from the garden
  const handleRemoveFromGarden = async () => {
    const userPlantId = getUserPlantId();
    if (userPlantId) {
      try {
        await removeUserPlant(userPlantId);
        // Optionally show a success message
      } catch (err) {
        console.error('Failed to remove plant from garden:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="text-2xl">
          {t('home') === 'Home' ? 'Loading plant details...' : 'در حال بارگذاری جزئیات گیاه...'}
        </div>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigateTo?.('library')}
              className="flex items-center text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
            >
              ← {t('home') === 'Home' ? 'Back to Library' : 'بازگشت به کتابخانه'}
            </button>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 p-6 rounded-xl text-center">
            {error || (t('home') === 'Home' ? 'Plant not found' : 'گیاه یافت نشد')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigateTo && navigateTo('library')}
            className="flex items-center text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
          >
            ← {t('home') === 'Home' ? 'Back to Library' : 'بازگشت به کتابخانه'}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{plant.farsi_name}</h1>
            <p className="text-green-100 italic text-lg">{plant.scientific_name}</p>
          </div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Plant Image */}
              <div className="lg:w-2/5">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
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
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">🌿</div>
                      <p className="text-gray-500 dark:text-gray-400">
                        {t('home') === 'Home' ? 'No image available' : 'تصویری موجود نیست'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Delete button if plant is in garden */}
                {isInGarden() && (
                  <div className="mt-4">
                    <button
                      onClick={handleRemoveFromGarden}
                      className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <span>🗑️</span>
                      {t('home') === 'Home' ? 'Remove from Garden' : 'حذف از باغ'}
                    </button>
                  </div>
                )}
              </div>

              {/* Plant Information */}
              <div className="lg:w-3/5">
                <div className="mb-6">
                  {/* Toxicity Badge */}
                  <div className="inline-block px-3 py-1 rounded-full text-sm font-medium
                    bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mb-4">
                    {plant.is_toxic
                      ? (t('home') === 'Home' ? 'Toxic Plant' : 'گیاه سمی')
                      : (t('home') === 'Home' ? 'Non-toxic Plant' : 'گیاه غیرسمی')}
                  </div>

                  {/* Care Difficulty */}
                  <div className="inline-block px-3 py-1 rounded-full text-sm font-medium ml-2
                    bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {plant.care_difficulty === 'easy'
                      ? (t('home') === 'Home' ? 'Easy Care' : 'مراقبت آسان')
                      : plant.care_difficulty === 'medium'
                        ? (t('home') === 'Home' ? 'Medium Care' : 'مراقبت متوسط')
                        : (t('home') === 'Home' ? 'Hard Care' : 'مراقبت سخت')}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">
                    {t('home') === 'Home' ? 'Description' : 'توضیحات'}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {plant.description}
                  </p>
                </div>

                {/* Care Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Watering Frequency */}
                  <div className="bg-green-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-700 dark:text-green-400 mb-1 flex items-center">
                      <span className="mr-2">💧</span>
                      {t('home') === 'Home' ? 'Watering' : 'آبیاری'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {plant.watering_frequency}
                    </p>
                  </div>

                  {/* Light Requirements */}
                  <div className="bg-yellow-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1 flex items-center">
                      <span className="mr-2">☀️</span>
                      {t('home') === 'Home' ? 'Light' : 'نور'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {plant.light_requirements}
                    </p>
                  </div>

                  {/* Fertilizer Schedule */}
                  <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-1 flex items-center">
                      <span className="mr-2">🌱</span>
                      {t('home') === 'Home' ? 'Fertilizer' : 'کود'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {plant.fertilizer_schedule}
                    </p>
                  </div>

                  {/* Temperature Range */}
                  <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-700 dark:text-purple-400 mb-1 flex items-center">
                      <span className="mr-2">🌡️</span>
                      {t('home') === 'Home' ? 'Temperature' : 'دما'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {plant.temperature_range}
                    </p>
                  </div>

                  {/* Humidity Level */}
                  <div className="bg-indigo-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center">
                      <span className="mr-2">💧</span>
                      {t('home') === 'Home' ? 'Humidity' : 'رطوبت'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {plant.humidity_level}
                    </p>
                  </div>

                  {/* Soil Type */}
                  <div className="bg-orange-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-1 flex items-center">
                      <span className="mr-2">🌍</span>
                      {t('home') === 'Home' ? 'Soil Type' : 'نوع خاک'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {plant.soil_type}
                    </p>
                  </div>

                  {/* Propagation Methods */}
                  <div className="md:col-span-2 bg-teal-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-teal-700 dark:text-teal-400 mb-1 flex items-center">
                      <span className="mr-2">🌿</span>
                      {t('home') === 'Home' ? 'Propagation Methods' : 'روش‌های تکثیر'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {plant.propagation_methods}
                    </p>
                  </div>

                  {/* Pruning Info */}
                  {plant.pruning_info && (
                    <div className="md:col-span-2 bg-cyan-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-cyan-700 dark:text-cyan-400 mb-1 flex items-center">
                        <span className="mr-2">✂️</span>
                        {t('home') === 'Home' ? 'Pruning Information' : 'اطلاعات اصلاح'}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {plant.pruning_info}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetails;