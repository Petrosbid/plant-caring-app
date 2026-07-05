// src/pages/DiseaseLibrary.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {m} from 'framer-motion';
import { Link } from 'react-router-dom';
import { diseaseService } from '../services/api';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import { LoaderGooeyBlobs } from '../components/animation/gooey-loader';
import FadeContent from '../components/animation/Fadein';
import type { Disease } from '../types';
import {
  FiAlertCircle, FiActivity, FiShield, FiEye, FiMessageCircle,
  FiSearch, FiX
} from 'react-icons/fi';

const SEVERITY_OPTIONS = [
  { value: 'low', labelEn: 'Low', labelFa: 'کم' },
  { value: 'medium', labelEn: 'Medium', labelFa: 'متوسط' },
  { value: 'high', labelEn: 'High', labelFa: 'زیاد' },
  { value: 'critical', labelEn: 'Critical', labelFa: 'بحرانی' },
];

const SPREAD_RATE_OPTIONS = [
  { value: 'slow', labelEn: 'Slow', labelFa: 'کند' },
  { value: 'moderate', labelEn: 'Moderate', labelFa: 'متوسط' },
  { value: 'fast', labelEn: 'Fast', labelFa: 'سریع' },
];

const SORT_OPTIONS = [
  { key: '-created_at', labelEn: 'Newest', labelFa: 'جدیدترین' },
  { key: '-view_count', labelEn: 'Most Viewed', labelFa: 'پربازدیدترین' },
  { key: '-comment_count', labelEn: 'Most Discussed', labelFa: 'پرمبحث‌ترین' },
  { key: 'name', labelEn: 'Name A-Z', labelFa: 'نام الفبایی' },
];

const DiseaseCard: React.FC<{ disease: Disease; language: 'en' | 'fa'; delay?: number }> = ({
  disease,
  language,
  delay = 0
}) => {
  const isEn = language === 'en';
  const name = isEn ? disease.name : (disease.name_fa || disease.name);
  const severityLabel = isEn ? disease.severity_level : {
    low: 'کم', medium: 'متوسط', high: 'زیاد', critical: 'بحرانی'
  }[disease.severity_level];
  const severityColor = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }[disease.severity_level];

  const spreadLabel = isEn ? disease.spread_rate : {
    slow: 'کند', moderate: 'متوسط', fast: 'سریع'
  }[disease.spread_rate];

  const description = isEn ? disease.description : (disease.description_fa || disease.description);

  return (
    <FadeContent delay={delay} blur duration={1000} ease="ease-out" initialOpacity={0.1}>
      <m.div className="group bg-white dark:bg-slate-800/80 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-700/50 overflow-hidden hover:shadow-card-hover transition-all duration-300 h-full">
        <Link to={`/disease/${disease.id}`} className="block h-full">
          <div className="p-5">
            <div className="flex justify-between items-start gap-2 mb-2">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 flex-1">
                {name}
              </h2>
              <span className={`flex-shrink-0 px-2 py-0.5 rounded-lg text-xs font-semibold ${severityColor}`}>
                {severityLabel}
              </span>
            </div>

            <p className="text-xs italic text-slate-500 dark:text-slate-400 mb-3">
              {disease.name_fa && !isEn && disease.name}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
                <FiActivity className="w-3 h-3" />
                <span>{spreadLabel}</span>
              </div>
              <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
                <FiAlertCircle className="w-3 h-3" />
                <span>{isEn ? 'Infectious' : 'مسری'}: {disease.is_infectious_en === 'yes' ? (isEn ? 'Yes' : 'بله') : (isEn ? 'No' : 'خیر')}</span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-3">
              {description?.substring(0, 120)}...
            </p>

            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <span className="flex items-center gap-1"><FiEye className="w-3 h-3" /> {disease.view_count}</span>
              <span className="flex items-center gap-1"><FiMessageCircle className="w-3 h-3" /> {disease.comment_count || 0}</span>
              <span className="flex items-center gap-1"><FiShield className="w-3 h-3" /> {severityLabel}</span>
            </div>
          </div>
        </Link>
      </m.div>
    </FadeContent>
  );
};

const DiseaseLibrary: React.FC = () => {
  const { language } = useLanguageTheme();
  const isEn = language === 'en';
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{ severity_level?: string; spread_rate?: string }>({});
  const [ordering, setOrdering] = useState('-created_at');

  const observer = useRef<IntersectionObserver | null>(null);
  const lastDiseaseRef = useCallback(
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

  useEffect(() => {
    const fetchDiseases = async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          page_size: 12,
          search: search || undefined,
          ordering,
          ...filters,
        };
        const data = await diseaseService.getDiseasesPaginated(params);
        const newDiseases = data.results || [];
        setDiseases((prev) => (page === 1 ? newDiseases : [...prev, ...newDiseases]));
        setHasMore(!!data.next);
      } catch (err) {
        console.error('Failed to fetch diseases', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiseases();
  }, [page, search, filters, ordering]);

  useEffect(() => {
    setPage(1);
  }, [search, filters, ordering]);

  const handleFilterChange = (key: 'severity_level' | 'spread_rate', value: string) => {
    setFilters((prev) => {
      if (prev[key] === value) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 min-h-screen" dir={isEn ? 'ltr' : 'rtl'}>
      <m.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl lg:text-4xl font-semibold text-center text-brand-700 dark:text-brand-400 mb-8"
      >
        {isEn ? 'Disease Library' : 'کتابخانه بیماری‌ها'}
      </m.h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-2xl shadow p-5 border border-slate-200/60 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {isEn ? 'Filters' : 'فیلترها'}
            </h2>
            <div className="space-y-5">
              {/* Severity Filter */}
              <div>
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {isEn ? 'Severity' : 'شدت بیماری'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SEVERITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFilterChange('severity_level', opt.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        filters.severity_level === opt.value
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {isEn ? opt.labelEn : opt.labelFa}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spread Rate Filter */}
              <div>
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {isEn ? 'Spread Rate' : 'سرعت انتشار'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SPREAD_RATE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFilterChange('spread_rate', opt.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        filters.spread_rate === opt.value
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {isEn ? opt.labelEn : opt.labelFa}
                    </button>
                  ))}
                </div>
              </div>
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
                placeholder={isEn ? 'Search diseases...' : 'جستجوی بیماری‌ها...'}
                className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <FiX className="text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setOrdering(opt.key)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                    ordering === opt.key
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {isEn ? opt.labelEn : opt.labelFa}
                </button>
              ))}
            </div>
          </div>

          {/* Diseases Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {diseases.map((disease, index) => {
              const isLast = index === diseases.length - 1;
              return (
                <div key={disease.id} ref={isLast ? lastDiseaseRef : null}>
                  <DiseaseCard disease={disease} language={language} delay={index * 0.05} />
                </div>
              );
            })}
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <LoaderGooeyBlobs size={25} color="#10b981" />
            </div>
          )}
          {!hasMore && diseases.length > 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400 mt-8">
              {isEn ? 'All diseases loaded.' : 'همه بیماری‌ها بارگذاری شدند.'}
            </p>
          )}
          {!loading && diseases.length === 0 && (
            <div className="text-center py-16">
              <span className="text-5xl mb-4 block">🔍</span>
              <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {isEn ? 'No diseases found' : 'بیماری‌ای یافت نشد'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                {isEn ? 'Try different filters.' : 'فیلترها را تغییر دهید.'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DiseaseLibrary;