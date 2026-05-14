import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Plant } from '../types';
import { plantService, gardenService } from '../services/api';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';

const PlantIdentification: React.FC = () => {
  const { t, language } = useLanguageTheme();
  const isEn = language === 'en';
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Plant | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResult(null);
        setError(null);
      } else {
        setError(isEn ? 'Please upload an image file (JPG, PNG)' : 'لطفاً یک فایل تصویری آپلود کنید (JPG، PNG)');
      }
    }
  };

  const handleIdentify = async () => {
    if (!selectedFile) {
      setError(isEn ? 'Please select an image first' : 'لطفاً ابتدا یک تصویر انتخاب کنید');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const identifiedPlant = await plantService.identifyPlant(selectedFile);
      if (identifiedPlant) setResult(identifiedPlant);
      else setError(isEn ? 'Could not identify the plant. Please try another image.' : 'نمی‌توان گیاه را شناسایی کرد. لطفاً تصویر دیگری امتحان کنید.');
    } catch (err) {
      setError(isEn ? 'An error occurred while identifying the plant. Please try again.' : 'هنگام شناسایی گیاه خطایی رخ داد. لطفاً دوباره امتحان کنید.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  if (result) {
    const name = isEn ? (result.english_name || result.farsi_name) : result.farsi_name;
    const desc = isEn ? (result.description_en || result.description) : result.description;
    const water = isEn ? (result.watering_frequency_en || result.watering_frequency) : result.watering_frequency;
    const light = isEn ? (result.light_requirements_en || result.light_requirements) : result.light_requirements;
    const fertilizer = isEn ? (result.fertilizer_schedule_en || result.fertilizer_schedule) : result.fertilizer_schedule;
    const temp = isEn ? (result.temperature_range_en || result.temperature_range) : result.temperature_range;
    const humidity = isEn ? (result.humidity_level_en || result.humidity_level) : result.humidity_level;
    const soil = isEn ? (result.soil_type_en || result.soil_type) : result.soil_type;
    const propagation = isEn ? (result.propagation_methods_en || result.propagation_methods) : result.propagation_methods;
    const difficultyLabel = result.care_difficulty_display
      ? (isEn ? result.care_difficulty_display.en : result.care_difficulty_display.fa)
      : (result.care_difficulty === 'easy' ? (isEn ? 'Easy' : 'آسان') : result.care_difficulty === 'medium' ? (isEn ? 'Medium' : 'متوسط') : (isEn ? 'Hard' : 'سخت'));

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setResult(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-brand-500 to-emerald-600 p-6 rounded-t-2xl z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-white mb-1">
                    {isEn ? 'Identification Results' : 'نتایج شناسایی'}
                  </h2>
                  <p className="text-white/90 text-sm">
                    {isEn ? 'Successfully identified your plant!' : 'گیاه شما با موفقیت شناسایی شد!'}
                  </p>
                </div>
                <motion.button
                  onClick={() => setResult(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 text-2xl transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  &times;
                </motion.button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/5">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
                    {result.primary_image ? (
                      <img src={result.primary_image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-8">
                        <span className="text-6xl">🌿</span>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{isEn ? 'No image available' : 'تصویری موجود نیست'}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="lg:w-3/5 space-y-6">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{name}</h3>
                    <p className="text-brand-600 dark:text-brand-400 italic">{result.scientific_name}</p>
                    <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${result.is_toxic ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'}`}>
                      {result.is_toxic ? (isEn ? 'Toxic Plant' : 'گیاه سمی') : (isEn ? 'Non-toxic Plant' : 'گیاه غیرسمی')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                      {isEn ? 'Description' : 'توضیحات'}
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{desc}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CareChip icon="💧" label={isEn ? 'Watering' : 'آبیاری'} value={water ?? ''} />
                    <CareChip icon="☀️" label={isEn ? 'Light' : 'نور'} value={light ?? ''} />
                    <CareChip icon="🌱" label={isEn ? 'Fertilizer' : 'کود'} value={fertilizer ?? ''} />
                    <CareChip icon="🌡️" label={isEn ? 'Temperature' : 'دما'} value={temp ?? ''} />
                    <CareChip icon="💧" label={isEn ? 'Humidity' : 'رطوبت'} value={humidity ?? ''} />
                    <CareChip icon="🌍" label={isEn ? 'Soil Type' : 'نوع خاک'} value={soil ?? ''} />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
                      <span>🌿</span> {isEn ? 'Propagation Methods' : 'روش‌های تکثیر'}
                    </h5>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{propagation ?? ''}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.care_difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' :
                      result.care_difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                    }`}>
                      {difficultyLabel ?? ''}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                      {isEn ? 'Added' : 'اضافه شده'} {new Date(result.created_at).toLocaleDateString(isEn ? 'en-US' : 'fa-IR')}
                    </span>
                  </div>
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {isEn ? 'Add to My Garden?' : 'به باغ من اضافه شود؟'}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                      {isEn ? 'Would you like to add this plant to your personal garden collection?' : 'آیا مایلید این گیاه را به مجموعه باغ شخصی خود اضافه کنید؟'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <motion.button
                        onClick={async () => {
                          try {
                            await gardenService.addUserPlant({ plant: result.id, nickname: result.farsi_name, notes: result.description });
                            alert(isEn ? 'Plant added to your garden successfully!' : 'گیاه با موفقیت به باغ شما اضافه شد!');
                            setResult(null);
                          } catch (err) {
                            console.error(err);
                            alert(isEn ? 'Failed to add plant to garden. Please try again.' : 'افزودن گیاه به باغ انجام نشد. لطفاً دوباره امتحان کنید.');
                          }
                        }}
                        className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isEn ? 'Yes, Add to Garden' : 'بله، به باغ اضافه کن'}
                      </motion.button>
                      <motion.button
                        onClick={() => setResult(null)}
                        className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isEn ? 'No, Thanks' : 'خیر، ممنون'}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-10 lg:py-14">
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl lg:text-4xl font-semibold text-center text-brand-700 dark:text-brand-400 mb-10">
        {t('identify')}
      </motion.h1>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto bg-white dark:bg-slate-800/80 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-700/50 p-6 lg:p-8">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-6">
          {isEn ? 'Upload a photo of a plant to identify it' : 'یک عکس از گیاه بارگذاری کنید تا شناسایی شود'}
        </h2>
        {!previewUrl ? (
          <motion.div
            layout
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-10 text-center cursor-pointer hover:border-brand-500 dark:hover:border-brand-400 hover:bg-brand-500/5 dark:hover:bg-brand-500/10 transition-all duration-300"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <span className="text-5xl">📷</span>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {isEn ? 'Drag & drop your plant photo here' : 'تصویر گیاه خود را اینجا بکشید و رها کنید'}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{isEn ? 'or' : 'یا'}</p>
              <span className="inline-flex px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium">
                {isEn ? 'Browse Files' : 'انتخاب فایل'}
              </span>
              <p className="text-slate-400 dark:text-slate-500 text-xs">
                {isEn ? 'Supports JPG, PNG up to 10MB' : 'پشتیبانی از JPG، PNG تا 10 مگابایت'}
              </p>
            </div>
            <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </motion.div>
        ) : (
          <motion.div layout className="text-center">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-4 rounded-xl overflow-hidden shadow-lg">
              <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto w-full object-cover" />
            </motion.div>
            <button onClick={handleReset} className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium text-sm">
              {isEn ? 'Choose Another Image' : 'انتخاب تصویر دیگر'}
            </button>
          </motion.div>
        )}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-xl text-sm">
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-6 text-center">
          <motion.button
            onClick={handleIdentify}
            disabled={isLoading || !selectedFile}
            className={`font-medium py-3 px-6 rounded-xl transition-all ${
              isLoading || !selectedFile ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed text-slate-500' : 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg hover:shadow-glow'
            }`}
            whileHover={!(isLoading || !selectedFile) ? { scale: 1.02 } : {}}
            whileTap={!(isLoading || !selectedFile) ? { scale: 0.98 } : {}}
          >
            {isLoading ? (isEn ? 'Identifying...' : 'در حال شناسایی...') : (isEn ? 'Identify Plant' : 'شناسایی گیاه')}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const CareChip: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
    <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
      <span>{icon}</span> {label}
    </h5>
    <p className="text-slate-600 dark:text-slate-400 text-sm">{value}</p>
  </div>
);

export default PlantIdentification;