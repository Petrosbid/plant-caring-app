import React, { useState, useEffect } from 'react';
import type { Plant } from '../types';
import { plantService, gardenService } from '../services/api';
import { useUserPlants } from '../hooks/useUserPlants';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import { LoaderGooeyBlobs } from '../components/animation/gooey-loader';

interface PlantDetailsProps {
  plantId?: string;
  navigateTo?: (page: string, params?: Record<string, string>) => void;
}

const PlantDetails: React.FC<PlantDetailsProps> = ({ plantId, navigateTo }) => {
  const { language } = useLanguageTheme();
  const isEn = language === 'en';
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userPlants } = useUserPlants();

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        const id = plantId;
        if (id) {
          const plantData = await plantService.getPlantById(parseInt(id));
          setPlant(plantData);
        } else {
          setError(isEn ? 'Plant ID not provided.' : 'شناسه گیاه ارائه نشده است.');
        }
      } catch (err) {
        setError(isEn ? 'Failed to load plant details. Please try again.' : 'جزئیات گیاه بارگذاری نشد. لطفاً دوباره امتحان کنید.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlant();
  }, [plantId, isEn]);

  const isInGarden = () => {
    if (!plant) return false;
    return userPlants.some(userPlant => userPlant.plant === plant.id);
  };

  const getUserPlantId = () => {
    if (!plant) return null;
    const userPlant = userPlants.find(userPlant => userPlant.plant === plant.id);
    return userPlant ? userPlant.id : null;
  };

  const handleRemoveFromGarden = async () => {
    const userPlantId = getUserPlantId();
    if (userPlantId) {
      try {
        await gardenService.removeUserPlant(userPlantId);
      } catch (err) {
        console.error('Failed to remove plant from garden:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <LoaderGooeyBlobs size={25} color="#10b981" duration={1} />
        <div className="text-2xl">{isEn ? 'Loading plant details...' : 'در حال بارگذاری جزئیات گیاه...'}</div>
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
              ← {isEn ? 'Back to Library' : 'بازگشت به کتابخانه'}
            </button>
          </div>
          <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 p-6 rounded-xl text-center">
            {error || (isEn ? 'Plant not found' : 'گیاه یافت نشد')}
          </div>
        </div>
      </div>
    );
  }

  const name = isEn ? (plant.english_name || plant.farsi_name) : plant.farsi_name;
  const desc = isEn ? (plant.description_en || plant.description) : plant.description;
  const water = (isEn ? (plant.watering_frequency_en || plant.watering_frequency) : plant.watering_frequency) ?? '';
  const light = (isEn ? (plant.light_requirements_en || plant.light_requirements) : plant.light_requirements) ?? '';
  const fertilizer = (isEn ? (plant.fertilizer_schedule_en || plant.fertilizer_schedule) : plant.fertilizer_schedule) ?? '';
  const temp = (isEn ? (plant.temperature_range_en || plant.temperature_range) : plant.temperature_range) ?? '';
  const humidity = (isEn ? (plant.humidity_level_en || plant.humidity_level) : plant.humidity_level) ?? '';
  const soil = (isEn ? (plant.soil_type_en || plant.soil_type) : plant.soil_type) ?? '';
  const propagation = (isEn ? (plant.propagation_methods_en || plant.propagation_methods) : plant.propagation_methods) ?? '';
  const pruning = (isEn ? (plant.pruning_info_en || plant.pruning_info) : plant.pruning_info) ?? '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigateTo && navigateTo('library')}
            className="flex items-center text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
          >
            ← {isEn ? 'Back to Library' : 'بازگشت به کتابخانه'}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{name}</h1>
            <p className="text-green-100 italic text-lg">{plant.scientific_name}</p>
          </div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-2/5">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
                  {plant.primary_image ? (
                    <img
                      src={plant.primary_image}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%23cccccc'/%3E%3Ctext x='12' y='16' font-size='12' text-anchor='middle' fill='%23666666'%3EPlant Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">🌿</div>
                      <p className="text-gray-500 dark:text-gray-400">{isEn ? 'No image available' : 'تصویری موجود نیست'}</p>
                    </div>
                  )}
                </div>
                {isInGarden() && (
                  <div className="mt-4">
                    <button
                      onClick={handleRemoveFromGarden}
                      className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <span>🗑️</span>
                      {isEn ? 'Remove from Garden' : 'حذف از باغ'}
                    </button>
                  </div>
                )}
              </div>

              <div className="lg:w-3/5">
                <div className="mb-6">
                  <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mb-4">
                    {plant.is_toxic ? (isEn ? 'Toxic Plant' : 'گیاه سمی') : (isEn ? 'Non-toxic Plant' : 'گیاه غیرسمی')}
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full text-sm font-medium ml-2 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {plant.care_difficulty_display
                      ? (isEn ? plant.care_difficulty_display.en : plant.care_difficulty_display.fa)
                      : (plant.care_difficulty === 'easy' ? (isEn ? 'Easy Care' : 'مراقبت آسان') : plant.care_difficulty === 'medium' ? (isEn ? 'Medium Care' : 'مراقبت متوسط') : (isEn ? 'Hard Care' : 'مراقبت سخت'))}
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">
                    {isEn ? 'Description' : 'توضیحات'}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{desc}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CareInfoBox icon="💧" label={isEn ? 'Watering' : 'آبیاری'} value={water} color="green" />
                  <CareInfoBox icon="☀️" label={isEn ? 'Light' : 'نور'} value={light} color="yellow" />
                  <CareInfoBox icon="🌱" label={isEn ? 'Fertilizer' : 'کود'} value={fertilizer} color="blue" />
                  <CareInfoBox icon="🌡️" label={isEn ? 'Temperature' : 'دما'} value={temp} color="purple" />
                  <CareInfoBox icon="💧" label={isEn ? 'Humidity' : 'رطوبت'} value={humidity} color="indigo" />
                  <CareInfoBox icon="🌍" label={isEn ? 'Soil Type' : 'نوع خاک'} value={soil} color="orange" />
                  <div className="md:col-span-2 bg-teal-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-teal-700 dark:text-teal-400 mb-1 flex items-center gap-2">
                      <span>🌿</span> {isEn ? 'Propagation Methods' : 'روش‌های تکثیر'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{propagation}</p>
                  </div>
                  {pruning && (
                    <div className="md:col-span-2 bg-cyan-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-cyan-700 dark:text-cyan-400 mb-1 flex items-center gap-2">
                        <span>✂️</span> {isEn ? 'Pruning Information' : 'اطلاعات اصلاح'}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{pruning}</p>
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

const CareInfoBox: React.FC<{ icon: string; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <div className={`bg-gray-700 p-4 rounded-lg`}>
    <h3 className={`font-semibold text-gray-400 mb-1 flex items-center gap-2`}>
      <span>{icon}</span> {label}
    </h3>
    <p className="text-gray-300 text-sm">{value}</p>
  </div>
);

export default PlantDetails;