import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReminders } from '../hooks/useReminders';
import { useUserPlants } from '../hooks/useUserPlants';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';

const Reminders: React.FC = () => {
  const { t } = useLanguageTheme();
  const {
    reminders,
    loading,
    error,
    addReminder: addReminderApi,
    toggleReminder: toggleReminderApi,
    deleteReminder: deleteReminderApi
  } = useReminders();

  const { userPlants, loading: plantsLoading } = useUserPlants();

  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    user_plant: null as number | null, // Selected plant from user's garden
    care_type: 'watering' as 'watering' | 'fertilizing' | 'pruning' | 'pest_control' | 'repotting' | 'other', // Type of care
    scheduled_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    time: '09:00',
    is_completed: false,
    is_recurring: false, // Whether this is a recurring reminder
    recurrence_interval: 7 // Days between recurring reminders (default 7 days)
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setNewReminder(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : name === 'user_plant'
          ? value ? parseInt(value, 10) : null
          : name === 'recurrence_interval'
            ? parseInt(value, 10)
            : value
    }));
  };

  // Handle date change separately to combine with time
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewReminder(prev => ({
      ...prev,
      scheduled_date: e.target.value
    }));
  };

  // Handle time change separately to combine with date
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewReminder(prev => ({
      ...prev,
      time: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Combine date and time into a single ISO string for the backend
      const scheduledDateTime = new Date(`${newReminder.scheduled_date}T${newReminder.time}:00`);

      // Create a proper reminder object that matches the backend API
      const apiPayload = {
        title: newReminder.title || `${newReminder.care_type.charAt(0).toUpperCase() + newReminder.care_type.slice(1)} for ${userPlants.find(p => p.id === newReminder.user_plant)?.nickname || 'plant'}`,
        description: newReminder.description || `Reminder to ${newReminder.care_type} ${userPlants.find(p => p.id === newReminder.user_plant)?.nickname || 'your plant'}`,
        user_plant: newReminder.user_plant, // Selected plant from user's garden
        care_type: newReminder.care_type, // Type of care
        scheduled_date: scheduledDateTime.toISOString(), // Backend expects ISO string
        is_completed: newReminder.is_completed,
        is_recurring: newReminder.is_recurring, // Whether this is a recurring reminder
        recurrence_interval: newReminder.is_recurring ? newReminder.recurrence_interval : undefined, // Interval in days for recurring reminders
        // Don't include user field - backend will auto-populate from auth
        // Don't include timestamps - backend will auto-populate
      };

      await addReminderApi(apiPayload);

      // Reset form
      setNewReminder({
        title: '',
        description: '',
        user_plant: null,
        care_type: 'watering',
        scheduled_date: new Date().toISOString().split('T')[0],
        time: '09:00',
        is_completed: false,
        is_recurring: false,
        recurrence_interval: 7
      });
    } catch (err) {
      console.error('Error adding reminder:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            {t('home') === 'Home' ? 'Loading reminders...' : 'در حال بارگذاری یادآوری‌ها...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-green-800 dark:text-green-300 mb-2">
            {t('home') === 'Home' ? 'Plant Care Reminders' : 'یادآوری‌های مراقبت از گیاه'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('home') === 'Home'
              ? 'Set reminders to take care of your plants on time'
              : 'یادآوری‌ها را تنظیم کنید تا به موقع از گیاهان خود مراقبت کنید'}
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 rounded-xl text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Reminder Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                  <span className="text-green-600 dark:text-green-400 text-xl">➕</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {t('home') === 'Home' ? 'Add New Reminder' : 'افزودن یادآوری جدید'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Plant Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="user_plant">
                    {t('home') === 'Home' ? 'Select Plant' : 'انتخاب گیاه'}
                  </label>
                  {plantsLoading ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                      {t('home') === 'Home' ? 'Loading plants...' : 'در حال بارگذاری گیاهان...'}
                    </div>
                  ) : (
                    <select
                      id="user_plant"
                      name="user_plant"
                      value={newReminder.user_plant || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                      required
                    >
                      <option value="">-- {t('home') === 'Home' ? 'Select a plant' : 'انتخاب یک گیاه'} --</option>
                      {userPlants.map(plant => (
                        <option key={plant.id} value={plant.id}>
                          {plant.nickname || plant.plant_details?.farsi_name || `Plant ${plant.id}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Care Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="care_type">
                    {t('home') === 'Home' ? 'Care Type' : 'نوع مراقبت'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['watering', 'fertilizing', 'pruning', 'pest_control', 'repotting', 'other'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewReminder(prev => ({ ...prev, care_type: type }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          newReminder.care_type === type
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {t('home') === 'Home'
                          ? type.charAt(0).toUpperCase() + type.slice(1)
                          : {
                              'watering': 'آبیاری',
                              'fertilizing': 'کوددهی',
                              'pruning': 'اصلاح شاخه‌ها',
                              'pest_control': 'کنترل آفات',
                              'repotting': 'جابجایی گلدان',
                              'other': 'سایر'
                            }[type]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="title">
                    {t('home') === 'Home' ? 'Title' : 'عنوان'}
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newReminder.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder={t('home') === 'Home' ? 'Enter reminder title...' : 'عنوان یادآوری را وارد کنید...'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="description">
                    {t('home') === 'Home' ? 'Description' : 'توضیحات'}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newReminder.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder={t('home') === 'Home' ? 'Enter reminder details...' : 'جزئیات یادآوری را وارد کنید...'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="scheduled_date">
                      {t('home') === 'Home' ? 'Date' : 'تاریخ'}
                    </label>
                    <input
                      type="date"
                      id="scheduled_date"
                      name="scheduled_date"
                      value={newReminder.scheduled_date}
                      onChange={handleDateChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="time">
                      {t('home') === 'Home' ? 'Time' : 'زمان'}
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={newReminder.time}
                      onChange={handleTimeChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    />
                  </div>
                </div>

                {/* Recurring Reminder Options */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('home') === 'Home' ? 'Recurring reminder' : 'یادآوری تکرارشونده'}
                    </label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        name="is_recurring"
                        checked={newReminder.is_recurring}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        onClick={() => setNewReminder(prev => ({ ...prev, is_recurring: !prev.is_recurring }))}
                        className={`block w-10 h-6 rounded-full cursor-pointer ${
                          newReminder.is_recurring ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          newReminder.is_recurring ? 'transform translate-x-4' : ''
                        }`}
                      ></div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {newReminder.is_recurring && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="recurrence_interval">
                          {t('home') === 'Home' ? 'Repeat every (days)' : 'تکرار هر (روز)'}
                        </label>
                        <input
                          type="number"
                          id="recurrence_interval"
                          name="recurrence_interval"
                          min="1"
                          value={newReminder.recurrence_interval}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t('home') === 'Home' ? 'Add Reminder' : 'افزودن یادآوری'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Reminders List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mr-3">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xl">📅</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {t('home') === 'Home' ? 'Your Reminders' : 'یادآوری‌های شما'}
                  </h2>
                </div>
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium px-3 py-1 rounded-full">
                  {reminders.length} {t('home') === 'Home' ? 'items' : 'مورد'}
                </span>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                <AnimatePresence>
                  {reminders.length > 0 ? (
                    reminders.map(reminder => {
                      // Find the associated plant if available
                      const associatedPlant = userPlants.find(plant => plant.id === reminder.user_plant);

                      return (
                        <motion.div
                          key={reminder.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`bg-gradient-to-r ${
                            !reminder.is_completed
                              ? 'from-white to-green-50 dark:from-gray-800 dark:to-gray-800/50 border-l-4 border-green-500'
                              : 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800 border-l-4 border-gray-400'
                          } rounded-xl shadow-sm p-5 transition-all`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-2">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">
                                  {reminder.title}
                                </h3>
                                {reminder.is_recurring && (
                                  <span className="ml-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                                    <span className="mr-1">🔄</span> {t('home') === 'Home' ? 'Recurring' : 'تکرارشونده'}
                                  </span>
                                )}
                              </div>

                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                                {reminder.description}
                              </p>

                              <div className="flex flex-wrap gap-2 text-xs">
                                {associatedPlant && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                    <span className="mr-1">🌿</span>
                                    {associatedPlant.nickname || associatedPlant.plant_details?.farsi_name || `Plant ${associatedPlant.id}`}
                                  </span>
                                )}

                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                                  {reminder.care_type === 'watering' && '💧'}
                                  {reminder.care_type === 'fertilizing' && '🌱'}
                                  {reminder.care_type === 'pruning' && '✂️'}
                                  {reminder.care_type === 'pest_control' && '🐜'}
                                  {reminder.care_type === 'repotting' && '🪴'}
                                  {reminder.care_type === 'other' && '📝'}

                                  {t('home') === 'Home'
                                    ? reminder.care_type.charAt(0).toUpperCase() + reminder.care_type.slice(1)
                                    : {
                                        'watering': 'آبیاری',
                                        'fertilizing': 'کوددهی',
                                        'pruning': 'اصلاح شاخه‌ها',
                                        'pest_control': 'کنترل آفات',
                                        'repotting': 'جابجایی گلدان',
                                        'other': 'سایر'
                                      }[reminder.care_type]}
                                </span>

                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                                  📅 {new Date(reminder.scheduled_date).toLocaleDateString()}
                                </span>

                                {reminder.is_recurring && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                    🔄 {t('home') === 'Home' ? `Every ${reminder.recurrence_interval} days` : `هر ${reminder.recurrence_interval} روز`}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => toggleReminderApi(reminder.id)}
                                className={`p-2 rounded-full transition-all ${
                                  !reminder.is_completed
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-800/50'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                                }`}
                                title={t('home') === 'Home' ? 'Toggle completion' : 'تغییر وضعیت'}
                              >
                                {!reminder.is_completed ? '🔔' : '✅'}
                              </button>
                              <button
                                onClick={() => deleteReminderApi(reminder.id)}
                                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50 transition-all"
                                title={t('home') === 'Home' ? 'Delete reminder' : 'حذف یادآوری'}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              !reminder.is_completed
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {!reminder.is_completed
                                ? (t('home') === 'Home' ? 'Pending' : 'در انتظار')
                                : (t('home') === 'Home' ? 'Completed' : 'تکمیل شده')}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                        <span className="text-4xl">🌱</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        {t('home') === 'Home' ? 'No reminders yet' : 'هنوز یادآوری‌ای وجود ندارد'}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {t('home') === 'Home'
                          ? 'Add your first reminder to stay on top of your plant care routine'
                          : 'اولین یادآوری خود را اضافه کنید تا مراقبت از گیاهان خود را به موقع انجام دهید'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Reminders;