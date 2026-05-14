// src/pages/PlantRecommender.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import { LoaderGooeyBlobs } from '../components/animation/gooey-loader';
import { SECTIONS, QUESTIONS, type Question } from '../types/recommendationQuestions';
import { sendRecommendationRequest, type RecommendationResponse } from '../services/recommendationApi';
import { Link } from 'react-router-dom';
import {
  FiHome, FiHeart, FiShield, FiAward, FiCpu,
  FiChevronRight, FiChevronLeft, FiSend, FiX,
  FiCheckCircle, FiDroplet, FiSun, FiThermometer,
  FiWind, FiMapPin, FiUsers, FiAlertCircle, FiSmile
} from 'react-icons/fi';

type Answers = Record<string, string | string[] | boolean>;

// آیکون‌های شاد برای هر بخش
const sectionIcons = [
  <FiHome className="w-6 h-6" />,
  <FiHeart className="w-6 h-6" />,
  <FiShield className="w-6 h-6" />,
  <FiAward className="w-6 h-6" />,
  <FiCpu  className="w-6 h-6" />
];

const PlantRecommender: React.FC = () => {
  const { language } = useLanguageTheme();
  const isEn = language === 'en';

  const [currentSection, setCurrentSection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // ذخیره و بازیابی از localStorage
  useEffect(() => {
    const saved = localStorage.getItem('plantRecommenderAnswers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnswers(parsed);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('plantRecommenderAnswers', JSON.stringify(answers));
  }, [answers]);

  const updateAnswer = (questionId: string, value: string | string[] | boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const getQuestionValue = (q: Question): any => {
    const val = answers[q.id];
    if (val === undefined) {
      if (q.type === 'checkbox') return [];
      if (q.type === 'boolean') return undefined;
      return '';
    }
    return val;
  };

  const validateSection = (sectionId: number): boolean => {
    const sectionQuestions = QUESTIONS.filter(q => q.section === sectionId && q.required);
    let hasError = false;
    const newErrors: Record<string, boolean> = {};

    for (const q of sectionQuestions) {
      const val = answers[q.id];
      let isValid = true;
      if (q.type === 'checkbox') {
        isValid = Array.isArray(val) && val.length > 0;
      } else if (q.type === 'boolean') {
       isValid = val !== undefined;
      } else if (q.type === 'text') {
        isValid = typeof val === 'string' && val.trim().length > 0;
      } else {
        isValid = val !== undefined && val !== null && val !== '';
      }
      if (!isValid) {
        hasError = true;
        newErrors[q.id] = true;
      }
    }
    setErrors(prev => ({ ...prev, ...newErrors }));
    return !hasError;
  };

  const goToNextSection = () => {
    if (validateSection(currentSection)) {
      if (currentSection < 5) {
        setCurrentSection(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const goToPrevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    let allValid = true;
    for (let i = 1; i <= 5; i++) {
      if (!validateSection(i)) allValid = false;
    }
    if (!allValid) {
      alert(isEn ? 'Please answer all required questions.' : 'لطفاً به تمام سوالات اجباری پاسخ دهید.');
      return;
    }
    setLoading(true);
    try {
      const response = await sendRecommendationRequest({
        language,
        answers,
        additional_notes: additionalNotes,
      });
      setResult(response);
      setShowResultModal(true);
    } catch (error) {
      console.error('Recommendation failed:', error);
      alert(isEn ? 'Failed to get recommendation. Please try again.' : 'خطا در دریافت پیشنهاد. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAnswers({});
    setAdditionalNotes('');
    setCurrentSection(1);
    localStorage.removeItem('plantRecommenderAnswers');
  };

  const currentSectionData = SECTIONS.find(s => s.id === currentSection)!;
  const sectionQuestions = QUESTIONS.filter(q => q.section === currentSection);
  const isLastSection = currentSection === 5;
  const answeredCount = sectionQuestions.filter(q => {
    const val = answers[q.id];
    if (q.required) {
      if (q.type === 'checkbox') return Array.isArray(val) && val.length > 0;
      if (q.type === 'boolean') return typeof val === 'boolean';
      return val !== undefined && val !== null && val !== '';
    }
    return false;
  }).length;
  const requiredCount = sectionQuestions.filter(q => q.required).length;
  const sectionProgress = requiredCount > 0 ? (answeredCount / requiredCount) * 100 : 0;
  const totalProgress = ((currentSection - 1) / 5) * 100 + (sectionProgress / 5);

  const renderQuestion = (q: Question) => {
    const value = getQuestionValue(q);
    const hasError = errors[q.id];
    const label = isEn ? q.labelEn : q.labelFa;

    // کلاس‌های پایه برای ورودی‌ها با استایل مدرن
    const inputBaseClass = `w-full rounded-xl border-2 transition-all duration-200 bg-white dark:bg-slate-800/90 
      ${hasError ? 'border-red-400 dark:border-red-500 ring-2 ring-red-200 dark:ring-red-500/30' : 'border-slate-200 dark:border-slate-700 focus:border-green-400 dark:focus:border-green-500'} 
      focus:outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-500/30 text-slate-800 dark:text-white p-3`;

    // آیکون‌های کمکی برای برخی سوالات خاص (می‌توان گسترش داد)
    const getQuestionIcon = () => {
      if (q.id.includes('light')) return <FiSun className="text-yellow-500" />;
      if (q.id.includes('water')) return <FiDroplet className="text-blue-500" />;
      if (q.id.includes('temp')) return <FiThermometer className="text-red-400" />;
      if (q.id.includes('humidity')) return <FiWind className="text-teal-500" />;
      if (q.id.includes('pet') || q.id.includes('child')) return <FiUsers className="text-purple-500" />;
      if (q.id.includes('allergy')) return <FiAlertCircle className="text-amber-500" />;
      return <FiSmile className="text-green-500" />;
    };

    switch (q.type) {
      case 'radio':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              {getQuestionIcon()}
              <span>{label}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options?.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${value === opt.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500'
                    : 'border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${value === opt.value ? 'border-green-500 bg-green-500' : 'border-slate-400 dark:border-slate-500'}`}>
                    {value === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={() => updateAnswer(q.id, opt.value)}
                    className="hidden"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                    {isEn ? opt.labelEn : opt.labelFa}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              {getQuestionIcon()}
              <span>{label}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options?.map(opt => {
                const isChecked = selectedValues.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${isChecked
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isChecked ? 'border-green-500 bg-green-500' : 'border-slate-400 dark:border-slate-500'}`}>
                      {isChecked && <FiCheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      value={opt.value}
                      checked={isChecked}
                      onChange={(e) => {
                        const newVal = e.target.checked
                          ? [...selectedValues, opt.value]
                          : selectedValues.filter(v => v !== opt.value);
                        updateAnswer(q.id, newVal);
                      }}
                      className="hidden"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                      {isEn ? opt.labelEn : opt.labelFa}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              {getQuestionIcon()}
              <span>{label}</span>
            </label>
            <select
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => updateAnswer(q.id, e.target.value)}
              className={inputBaseClass}
            >
              <option value="">{isEn ? 'Select an option...' : 'یک گزینه انتخاب کنید...'}</option>
              {q.options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {isEn ? opt.labelEn : opt.labelFa}
                </option>
              ))}
            </select>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              {getQuestionIcon()}
              <span>{label}</span>
            </label>
            <input
              type="text"
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => updateAnswer(q.id, e.target.value)}
              placeholder={isEn ? q.placeholderEn : q.placeholderFa}
              className={inputBaseClass}
            />
          </div>
        );

      case 'boolean':
        const boolValue = value === undefined ? undefined : value; 
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
        {getQuestionIcon()}
        <span>{label}</span>
      </div>
      <div className="flex gap-4">
        {[
          { val: true, label: isEn ? 'Yes' : 'بله' },
          { val: false, label: isEn ? 'No' : 'خیر' }
        ].map(option => {
          const isActive = boolValue === option.val;
          return (
            <button
              key={option.val.toString()}
              onClick={() => updateAnswer(q.id, option.val)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 border ${
                isActive
                  ? 'bg-green-500 text-white border-green-500 shadow-md'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-green-400'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-10 px-4 sm:px-6" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="max-w-5xl mx-auto">
        {/* Header with glass effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mb-3">
            {isEn ? 'Smart Plant Recommender' : 'پیشنهاددهنده هوشمند گیاه'}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {isEn
              ? 'Answer a few questions and get a personalized plant recommendation based on your home, lifestyle, and preferences.'
              : 'به چند سوال پاسخ دهید و یک پیشنهاد شخصی‌سازی شده بر اساس خانه، سبک زندگی و سلیقه خود دریافت کنید.'}
          </p>
        </motion.div>

        {/* Progress Bar - Modern design with step indicator */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {isEn ? `Step ${currentSection} of 5` : `مرحله ${currentSection} از 5`}
            </span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {Math.round(totalProgress)}%
            </span>
          </div>
          <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {[1, 2, 3, 4, 5].map(step => (
              <div
                key={step}
                className={`flex flex-col items-center transition-all duration-300 ${step <= currentSection ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-600'
                  }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step < currentSection
                    ? 'bg-green-500 text-white'
                    : step === currentSection
                      ? 'bg-green-100 dark:bg-green-900/50 border-2 border-green-500 text-green-600 dark:text-green-400'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  }`}>
                  {step < currentSection ? <FiCheckCircle className="w-4 h-4" /> : step}
                </div>
                <span className="text-xs mt-1 hidden sm:block">
                  {isEn ? SECTIONS[step - 1].titleEn.split(' ')[0] : SECTIONS[step - 1].titleFa.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section Card with Glassmorphism */}
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: isEn ? 30 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isEn ? -30 : 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center gap-3">
            <div className="text-white/90">
              {sectionIcons[currentSection - 1]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEn ? currentSectionData.titleEn : currentSectionData.titleFa}
              </h2>
              <p className="text-white/80 text-sm">
                {isEn ? currentSectionData.descriptionEn : currentSectionData.descriptionFa}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {sectionQuestions.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="rounded-2xl bg-white/80 dark:bg-slate-800/50 p-5 shadow-sm border border-slate-200/60 dark:border-slate-700/50 hover:shadow-md transition-shadow"
              >
                {renderQuestion(q)}
                {!q.required && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
                    {isEn ? 'Optional' : 'اختیاری'}
                  </p>
                )}
                {errors[q.id] && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" />
                    {isEn ? 'This question is required.' : 'این سوال اجباری است.'}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Notes */}
        {isLastSection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 mb-8 border border-white/30 dark:border-slate-700/50"
          >
            <label className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 mb-3">
              <FiSmile className="text-green-500" />
              <span>{isEn ? 'Additional Notes (Optional)' : 'نکات اضافی (اختیاری)'}</span>
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              placeholder={isEn ? 'Anything else you want to share? (e.g., specific plant you love, allergies, etc.)' : 'هر اطلاعات دیگری که می‌خواهید به اشتراک بگذارید؟ (مثلاً گیاه خاص مورد علاقه، آلرژی و...)'}
              className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white p-3 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-500/30 transition-all"
            />
          </motion.div>
        )}

        {/* Navigation Buttons with modern design */}
        <div className="flex justify-between items-center mt-6">
          {currentSection > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={goToPrevSection}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium shadow-sm hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all"
            >
              <FiChevronLeft className={isEn ? '' : 'rotate-180'} />
              {isEn ? 'Previous' : 'قبلی'}
            </motion.button>
          )}
          <div className="flex-1"></div>
          {!isLastSection ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={goToNextSection}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              {isEn ? 'Next' : 'بعدی'}
              <FiChevronRight className={isEn ? '' : 'rotate-180'} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoaderGooeyBlobs size={22} color="#ffffff" />
              ) : (
                <>
                  <FiSend />
                  {isEn ? 'Get Recommendation' : 'دریافت پیشنهاد'}
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Reset Link */}
        <div className="text-center mt-8">
          <button
            onClick={resetForm}
            className="text-sm text-slate-400 hover:text-green-600 dark:hover:text-green-400 underline transition-colors"
          >
            {isEn ? 'Clear all answers and start over' : 'پاک کردن همه پاسخ‌ها و شروع مجدد'}
          </button>
        </div>
      </div>

      {/* Result Modal - Enhanced */}
      <AnimatePresence>
        {showResultModal && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowResultModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 p-5 rounded-t-3xl flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌿</span>
                  <h2 className="text-xl font-bold text-white">
                    {isEn ? 'Your Perfect Match' : 'گیاه مناسب شما'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowResultModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {result.primary_image && (
                    <div className="md:w-1/3">
                      <img
                        src={result.primary_image}
                        alt={result.plant_name}
                        className="w-full h-48 object-cover rounded-2xl shadow-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-bold text-slate-800 dark:text-white">
                      {result.plant_name}
                    </h3>
                    <p className="text-green-600 dark:text-green-400 italic text-sm mb-3">
                      {result.scientific_name}
                    </p>
                    <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-2xl mb-4 border-l-4 border-green-500">
                      <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                        💡 {result.reason}
                      </p>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3">
                      {result.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Link
                    to={`/plant/${result.plant_id}`}
                    className="flex-1 text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:shadow-lg transition-all"
                    onClick={() => setShowResultModal(false)}
                  >
                    {isEn ? 'View Plant Details' : 'مشاهده جزئیات گیاه'}
                  </Link>
                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                  >
                    {isEn ? 'Start Over' : 'شروع مجدد'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlantRecommender;