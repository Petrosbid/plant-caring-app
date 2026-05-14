import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiX, FiSave, FiInfo, FiEdit, FiTrendingUp,
  FiBell, FiMessageCircle
} from 'react-icons/fi';
import PlantChat from './PlantChat';
import type { UserPlant } from '../../types';
import { gardenService } from '../../services/api';

interface Props {
  userPlant: UserPlant;
  language: 'en' | 'fa';
  onClose: () => void;
  onUpdate: (data: Partial<UserPlant>) => void;
  onRefresh?: () => void;                // ← تعریف شد
}

type Tab = 'info' | 'edit' | 'growth' | 'reminders' | 'chat';

const TAB_ICONS: Record<Tab, React.ReactNode> = {
  info: <FiInfo />,
  edit: <FiEdit />,
  growth: <FiTrendingUp />,
  reminders: <FiBell />,
  chat: <FiMessageCircle />,
};

const PlantDetailModal: React.FC<Props> = ({ userPlant, language, onClose, onUpdate, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const isEn = language === 'en';

  const [form, setForm] = useState({
    nickname: userPlant.nickname || '',
    notes: userPlant.notes || '',
    health_status: userPlant.health_status as 'healthy' | 'needs_attention' | 'unhealthy',
    pot_size: userPlant.pot_size || 'medium',
    watering_interval_days: userPlant.watering_interval_days,
    fertilizing_interval_days: userPlant.fertilizing_interval_days,
    pruning_interval_days: userPlant.pruning_interval_days,
  });

  const handleSave = () => {
    onUpdate(form);
    if (onRefresh) onRefresh();         // ← بعد از ذخیره کلی، رفرش کن
    onClose();
  };

  const tabs: { key: Tab; labelEn: string; labelFa: string }[] = [
    { key: 'info', labelEn: 'Overview', labelFa: 'نمای کلی' },
    { key: 'edit', labelEn: 'Edit', labelFa: 'ویرایش' },
    { key: 'growth', labelEn: 'Growth', labelFa: 'رشد' },
    { key: 'reminders', labelEn: 'Reminders', labelFa: 'یادآوری‌ها' },
    { key: 'chat', labelEn: 'AI Chat', labelFa: 'چت هوشمند' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 30 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {userPlant.nickname || userPlant.plant_details?.farsi_name}
            </h2>
            {userPlant.nickname && userPlant.plant_details?.farsi_name && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {userPlant.plant_details.farsi_name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 overflow-x-auto border-b border-slate-200 dark:border-slate-700 pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 shadow-sm translate-y-px'
                    : 'text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="text-lg">{TAB_ICONS[tab.key]}</span>
                {isEn ? tab.labelEn : tab.labelFa}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' && <InfoTab userPlant={userPlant} language={language} />}
          {activeTab === 'edit' && (
            <EditTab
              form={form}
              setForm={setForm}
              onSave={handleSave}
              language={language}
              onClose={onClose}
              userPlantId={userPlant.id}
              onRefresh={onRefresh}                // ← پاس داده شد
            />
          )}
          {activeTab === 'growth' && <GrowthTab userPlant={userPlant} language={language} />}
          {activeTab === 'reminders' && <RemindersTab userPlant={userPlant} language={language} />}
          {activeTab === 'chat' && (
            userPlant.plant_details?.id ? (
              <PlantChat plantId={userPlant.plant_details.id} language={language} />
            ) : (
              <EmptyState message={isEn ? 'Plant data not available' : 'اطلاعات گیاه در دسترس نیست'} />
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const InfoTab: React.FC<{ userPlant: UserPlant; language: 'en' | 'fa' }> = ({ userPlant, language }) => {
  const isEn = language === 'en';
  const plant = userPlant.plant_details;
  const latestGrowth = userPlant.growth_records?.[0];

  const healthLabel = userPlant.health_status === 'healthy'
    ? isEn ? 'Healthy' : 'سالم'
    : userPlant.health_status === 'needs_attention'
    ? isEn ? 'Needs Attention' : 'نیاز به توجه'
    : isEn ? 'Unhealthy' : 'ناسالم';
  const healthColor = userPlant.health_status === 'healthy'
    ? 'bg-green-500'
    : userPlant.health_status === 'needs_attention'
    ? 'bg-yellow-500'
    : 'bg-red-500';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoCard icon="📋" title={isEn ? 'Status' : 'وضعیت'}>
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white ${healthColor}`}>
          {healthLabel}
        </span>
      </InfoCard>

      <InfoCard icon="📅" title={isEn ? 'Next Watering' : 'آبیاری بعدی'}>
        {userPlant.next_watering_date
          ? new Date(userPlant.next_watering_date).toLocaleDateString(isEn ? 'en-US' : 'fa-IR')
          : '—'}
      </InfoCard>

      <InfoCard icon="🌱" title={isEn ? 'Next Fertilizing' : 'کوددهی بعدی'}>
        {userPlant.next_fertilizing_date
          ? new Date(userPlant.next_fertilizing_date).toLocaleDateString(isEn ? 'en-US' : 'fa-IR')
          : '—'}
      </InfoCard>

      <InfoCard icon="✂️" title={isEn ? 'Next Pruning' : 'هرس بعدی'}>
        {userPlant.next_pruning_date
          ? new Date(userPlant.next_pruning_date).toLocaleDateString(isEn ? 'en-US' : 'fa-IR')
          : '—'}
      </InfoCard>

      <InfoCard icon="💧" title={isEn ? 'Water Interval' : 'فاصله آبیاری'}>
        {userPlant.watering_interval_days} {isEn ? 'days' : 'روز'}
      </InfoCard>

      <InfoCard icon="🧪" title={isEn ? 'Fertilizer Interval' : 'فاصله کوددهی'}>
        {userPlant.fertilizing_interval_days} {isEn ? 'days' : 'روز'}
      </InfoCard>

      <InfoCard icon="🪴" title={isEn ? 'Pot Size' : 'سایز گلدان'}>
        {userPlant.pot_size || '—'}
      </InfoCard>
      <InfoCard icon="📏" title={isEn ? 'Plant Size' : 'اندازه گیاه'}>
        {latestGrowth ? (
          <span className="flex items-center gap-3">
            <span>
              {isEn ? 'Height' : 'ارتفاع'}: {latestGrowth.height} {latestGrowth.unit}
            </span>
            {latestGrowth.width && (
              <span>
                {isEn ? 'Width' : 'عرض'}: {latestGrowth.width} {latestGrowth.unit}
              </span>
            )}
            <span className="text-xs text-slate-400">
              {new Date(latestGrowth.date).toLocaleDateString(isEn ? 'en-US' : 'fa-IR')}
            </span>
          </span>
        ) : (
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            {isEn ? 'No size records yet' : 'هنوز اندازه‌ای ثبت نشده'}
          </span>
        )}
      </InfoCard>
      <InfoCard icon="📝" title={isEn ? 'Notes' : 'یادداشت‌ها'}>
        <span className="line-clamp-3">{userPlant.notes || '—'}</span>
      </InfoCard>
    </div>
  );
};

const InfoCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
    <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
      <span className="text-xl">{icon}</span>
      <h4 className="text-sm font-medium">{title}</h4>
    </div>
    <div className="text-slate-800 dark:text-white font-semibold">{children}</div>
  </div>
);
// فقط EditTab را با پراپ جدید بازنویسی می‌کنیم

const EditTab: React.FC<{
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  language: 'en' | 'fa';
  onClose: () => void;
  userPlantId: number;
  onRefresh?: () => void;                    // ← دریافت شد
}> = ({ form, setForm, onSave, language, onClose, userPlantId, onRefresh }) => {
  const isEn = language === 'en';
  const inputClass = "w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow";

  const [growth, setGrowth] = useState({
    height: '',
    width: '',
    unit: 'cm',
    notes: '',
  });
  const [savingGrowth, setSavingGrowth] = useState(false);
  const [growthError, setGrowthError] = useState('');

  const handleAddGrowth = async () => {
    const h = parseFloat(growth.height);
    if (isNaN(h) || h <= 0) {
      setGrowthError(isEn ? 'Height is required' : 'ارتفاع الزامی است');
      return;
    }
    setSavingGrowth(true);
    setGrowthError('');
    try {
      const payload: any = {
        user_plant: userPlantId,
        height: h,
        unit: growth.unit,
      };
      if (growth.width && parseFloat(growth.width) > 0) payload.width = parseFloat(growth.width);
      if (growth.notes) payload.notes = growth.notes;

      await gardenService.addGrowthRecord(payload);
      setGrowth({ height: '', width: '', unit: 'cm', notes: '' });

      // 1️⃣ ابتدا داده‌ها را تازه کن
      if (onRefresh) onRefresh();

      // 2️⃣ (اختیاری) مودال را ببند
      // onClose();
    } catch (err: any) {
      setGrowthError(err.message);
    } finally {
      setSavingGrowth(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Personalization */}
      <Section title={isEn ? 'Personalization' : 'شخصی‌سازی'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isEn ? 'Nickname' : 'نام مستعار'}
            </label>
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              placeholder={isEn ? 'e.g. My Little Cactus' : 'مثلاً کاکتوس کوچولوی من'}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isEn ? 'Notes' : 'یادداشت‌ها'}
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={isEn ? 'Any special care notes...' : 'یادداشت‌های مراقبتی...'}
              rows={3}
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      {/* Health & Pot */}
      <Section title={isEn ? 'Health & Pot' : 'وضعیت و گلدان'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isEn ? 'Health Status' : 'وضعیت سلامت'}
            </label>
            <select
              value={form.health_status}
              onChange={(e) => setForm({ ...form, health_status: e.target.value as 'healthy' | 'needs_attention' | 'unhealthy' })}
              className={inputClass}
            >
              <option value="healthy">{isEn ? 'Healthy' : 'سالم'}</option>
              <option value="needs_attention">{isEn ? 'Needs Attention' : 'نیاز به توجه'}</option>
              <option value="unhealthy">{isEn ? 'Unhealthy' : 'ناسالم'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isEn ? 'Pot Size' : 'سایز گلدان'}
            </label>
            <select
              value={form.pot_size}
              onChange={(e) => setForm({ ...form, pot_size: e.target.value })}
              className={inputClass}
            >
              <option value="no_pot">{isEn ? 'No Pot' : 'بدون گلدان'}</option>
              <option value="small">{isEn ? 'Small' : 'کوچک'}</option>
              <option value="medium">{isEn ? 'Medium' : 'متوسط'}</option>
              <option value="large">{isEn ? 'Large' : 'بزرگ'}</option>
              <option value="extra_large">{isEn ? 'Extra Large' : 'خیلی بزرگ'}</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Intervals */}
      <Section title={isEn ? 'Care Intervals' : 'فواصل مراقبتی'}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <IntervalInput
            label={isEn ? 'Water (days)' : 'آبیاری (روز)'}
            value={form.watering_interval_days}
            onChange={(val) => setForm({ ...form, watering_interval_days: val })}
          />
          <IntervalInput
            label={isEn ? 'Fertilizer (days)' : 'کوددهی (روز)'}
            value={form.fertilizing_interval_days}
            onChange={(val) => setForm({ ...form, fertilizing_interval_days: val })}
          />
          <IntervalInput
            label={isEn ? 'Pruning (days)' : 'هرس (روز)'}
            value={form.pruning_interval_days}
            onChange={(val) => setForm({ ...form, pruning_interval_days: val })}
          />
        </div>
      </Section>

      {/* Record Growth */}
      <Section title={isEn ? 'Record Growth' : 'ثبت رشد'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isEn ? 'Height' : 'ارتفاع'} *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={growth.height}
              onChange={(e) => setGrowth({ ...growth, height: e.target.value })}
              className={inputClass}
              placeholder={isEn ? 'e.g. 15.5' : 'مثال: ۱۵.۵'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isEn ? 'Width' : 'عرض'} ({isEn ? 'optional' : 'اختیاری'})
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={growth.width}
              onChange={(e) => setGrowth({ ...growth, width: e.target.value })}
              className={inputClass}
              placeholder={isEn ? 'e.g. 10.2' : 'مثال: ۱۰.۲'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isEn ? 'Unit' : 'واحد'}
            </label>
            <select
              value={growth.unit}
              onChange={(e) => setGrowth({ ...growth, unit: e.target.value })}
              className={inputClass}
            >
              <option value="cm">cm</option>
              <option value="inch">inch</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isEn ? 'Notes' : 'یادداشت'} ({isEn ? 'optional' : 'اختیاری'})
            </label>
            <input
              type="text"
              value={growth.notes}
              onChange={(e) => setGrowth({ ...growth, notes: e.target.value })}
              className={inputClass}
              placeholder={isEn ? 'e.g. New leaf appeared' : 'مثال: برگ جدید رویید'}
            />
          </div>
        </div>
        {growthError && (
          <p className="text-red-500 text-sm mt-2">{growthError}</p>
        )}
        <button
          onClick={handleAddGrowth}
          disabled={savingGrowth}
          className="mt-4 px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition font-medium flex items-center gap-2"
        >
          {savingGrowth ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiSave />
          )}
          {isEn ? 'Save Growth Record' : 'ثبت رکورد رشد'}
        </button>
      </Section>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium"
        >
          {isEn ? 'Cancel' : 'انصراف'}
        </button>
        <button
          onClick={onSave}
          className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition font-medium flex items-center gap-2"
        >
          <FiSave />
          {isEn ? 'Save Changes' : 'ذخیره تغییرات'}
        </button>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      {title}
    </h3>
    {children}
  </div>
);

const IntervalInput: React.FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
    <input
      type="number"
      min={1}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
    />
  </div>
);

const GrowthTab: React.FC<{ userPlant: UserPlant; language: 'en' | 'fa' }> = ({ userPlant, language }) => {
  const isEn = language === 'en';
  if (!userPlant.growth_records?.length) {
    return <EmptyState message={isEn ? 'No growth records yet.' : 'هنوز رکورد رشدی ثبت نشده.'} />;
  }
  return (
    <div className="space-y-4">
      {userPlant.growth_records.map((rec, idx) => (
        <motion.div
          key={rec.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center gap-4 p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm"
        >
          <div className="text-2xl">📏</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              {new Date(rec.date).toLocaleDateString(isEn ? 'en-US' : 'fa-IR')}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isEn ? 'Height' : 'ارتفاع'}: {rec.height} {rec.unit}
              {rec.width && ` | ${isEn ? 'Width' : 'عرض'}: ${rec.width} ${rec.unit}`}
            </p>
            {rec.notes && <p className="text-xs text-slate-500 mt-1">{rec.notes}</p>}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const RemindersTab: React.FC<{ userPlant: UserPlant; language: 'en' | 'fa' }> = ({ userPlant, language }) => {
  const isEn = language === 'en';
  if (!userPlant.reminders?.length) {
    return <EmptyState message={isEn ? 'No reminders set.' : 'یادآوری تنظیم نشده است.'} />;
  }
  const careIcons: Record<string, string> = {
    watering: '💧',
    fertilizing: '🌿',
    pruning: '✂️',
    pest_control: '🐛',
    repotting: '🪴',
    other: '📌',
  };
  return (
    <div className="space-y-3">
      {userPlant.reminders.map(rem => (
        <div
          key={rem.id}
          className="flex items-center gap-4 p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/50"
        >
          <span className="text-2xl">{careIcons[rem.care_type] || '📌'}</span>
          <div className="flex-1">
            <p className="font-semibold text-slate-800 dark:text-white">{rem.title}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {new Date(rem.scheduled_date).toLocaleDateString(isEn ? 'en-US' : 'fa-IR')}
              {rem.is_recurring && ` · ${isEn ? 'Recurring' : 'دوره‌ای'}`}
            </p>
          </div>
          {rem.is_completed && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs rounded-full">
              {isEn ? 'Done' : 'انجام شد'}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">{message}</div>
);

export default PlantDetailModal;