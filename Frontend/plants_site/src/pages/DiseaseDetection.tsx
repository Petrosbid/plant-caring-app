import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Disease } from '../types';
import { diseaseService } from '../services/api';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';

const DiseaseDetection: React.FC = () => {
  const { t } = useLanguageTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Disease | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
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
        setError(t('home') === 'Home' ? 'Please upload an image file (JPG, PNG)' : 'لطفاً یک فایل تصویری آپلود کنید (JPG، PNG)');
      }
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      setError(t('home') === 'Home' ? 'Please select an image first' : 'لطفاً ابتدا یک تصویر انتخاب کنید');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const detectedDisease = await diseaseService.detectDisease(selectedFile);
      if (detectedDisease) setResult(detectedDisease);
      else setError(t('home') === 'Home' ? 'No disease detected or could not analyze the image. Please try another image.' : 'هیچ بیماری شناسایی نشد یا نمی‌توان تصویر را تحلیل کرد. لطفاً تصویر دیگری امتحان کنید.');
    } catch (err) {
      setError(t('home') === 'Home' ? 'An error occurred while scanning for diseases. Please try again.' : 'هنگام اسکن بیماری‌ها خطایی رخ داد. لطفاً دوباره امتحان کنید.');
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

  const isEn = t('home') === 'Home';

  return (
    <div className="container mx-auto px-4 lg:px-6 py-10 lg:py-14">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl lg:text-4xl font-bold text-center text-brand-700 dark:text-brand-400 mb-10"
      >
        {t('disease')}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto bg-white dark:bg-slate-800/80 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-700/50 p-6 lg:p-8"
      >
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-6">
          {isEn ? 'Upload a photo of a plant showing symptoms' : 'تصویر گیاهی که علائم دارد را بارگذاری کنید'}
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
              <span className="text-5xl">🔍</span>
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
            <button
              onClick={handleReset}
              className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium text-sm"
            >
              {isEn ? 'Choose Another Image' : 'انتخاب تصویر دیگر'}
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-xl text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center">
          <motion.button
            onClick={handleScan}
            disabled={isLoading || !selectedFile}
            className={`font-medium py-3 px-6 rounded-xl transition-all ${
              isLoading || !selectedFile
                ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed text-slate-500'
                : 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg hover:shadow-glow'
            }`}
            whileHover={!(isLoading || !selectedFile) ? { scale: 1.02 } : {}}
            whileTap={!(isLoading || !selectedFile) ? { scale: 0.98 } : {}}
          >
            {isLoading ? (isEn ? 'Scanning...' : 'در حال اسکن...') : (isEn ? 'Scan for Diseases' : 'اسکن بیماری‌ها')}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto mt-10 bg-white dark:bg-slate-800/80 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-700/50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6">
              <h2 className="font-display text-2xl font-bold text-white mb-1">
                {isEn ? 'Disease Detected' : 'بیماری شناسایی شد'}
              </h2>
              <p className="text-white/90 text-sm">
                {isEn ? "Analysis of your plant's condition" : 'تحلیل وضعیت گیاه شما'}
              </p>
            </div>

            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/5">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-xl aspect-square flex items-center justify-center">
                    <div className="text-center p-8">
                      <span className="text-6xl">🦠</span>
                      <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{isEn ? 'Disease Image' : 'تصویر بیماری'}</p>
                    </div>
                  </div>
                </div>

                <div className="lg:w-3/5 space-y-6">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                      {result.detected_name || result.name || (result.llm_analysis?.disease_name_fa || 'Unknown Disease')}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                        {result.severity_level || result.llm_analysis?.severity || 'Unknown Severity'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                        {result.llm_analysis?.is_infectious ? (isEn ? 'Contagious' : 'مسری') : (isEn ? 'Non-contagious' : 'غیرمسری')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                      {isEn ? 'Description' : 'توضیحات'}
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {result.description || result.llm_analysis?.description || (isEn ? 'No description available' : 'توضیحی موجود نیست')}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                      {isEn ? 'Treatment Steps' : 'مراحل درمان'}
                    </h4>
                    <div className="space-y-3">
                      {(Array.isArray(result.llm_analysis?.treatment_steps)
                        ? result.llm_analysis!.treatment_steps
                        : (result.symptoms?.split(', ') || [])
                      ).map((step: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 text-sm">{step.trim()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                      {isEn ? 'Prevention Tips' : 'نکات پیشگیری'}
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">
                      {result.llm_analysis?.prevention || result.prevention_methods?.join(', ') || (isEn ? 'Follow proper plant care guidelines to prevent recurrence.' : 'دستورالعمل‌های مراقبت از گیاه را رعایت کنید.')}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">{isEn ? 'Confidence' : 'اطمینان'}</span>
                    <span className="font-display font-bold text-brand-600 dark:text-brand-400">
                      {result.confidence ? `${result.confidence.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiseaseDetection;
