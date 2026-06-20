import React, { useState, useEffect } from 'react';
import { FiX, FiDroplet, FiSun, FiScissors, FiAlertCircle } from 'react-icons/fi';
import { fetchNotifications, type NotificationsResponse, type Notification } from '../../services/notificationService';
import { useLanguageTheme } from '../../contexts/LanguageThemeContext';
import { Link } from 'react-router-dom';

interface NotificationPopoverProps {
  onClose?: () => void;
}

const getCareIcon = (careType: string) => {
  switch (careType) {
    case 'watering': return <FiDroplet className="text-blue-500" />;
    case 'fertilizing': return <FiSun className="text-green-500" />;
    case 'pruning': return <FiScissors className="text-purple-500" />;
    default: return <FiAlertCircle className="text-yellow-500" />;
  }
};

const formatDate = (dateStr: string, isEn: boolean) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(isEn ? 'en-US' : 'fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NotificationPopover: React.FC<NotificationPopoverProps> = ({ onClose }) => {
  const { language } = useLanguageTheme();
  const isEn = language === 'en';
  const [notifications, setNotifications] = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (err) {
        setError(isEn ? 'Failed to load notifications' : 'خطا در بارگیری اعلانات');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const renderNotificationList = (items: Notification[], title: string) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 px-3">
          {title}
        </h4>
        <div className="space-y-2">
          {items.map(notif => (
            <Link
              key={notif.id}
              to={notif.plant_id ? `/plant/${notif.plant_id}` : '#'}
              onClick={() => onClose?.()}
              className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-3">
                {notif.plant_image ? (
                  <img src={notif.plant_image} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl">
                    🌿
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {notif.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    {getCareIcon(notif.care_type)}
                    <span>{formatDate(notif.scheduled_date, isEn)}</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 max-h-[500px] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/50">
      <div className="sticky top-0 bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
          {isEn ? 'Notifications' : 'اعلانات'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          <FiX className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="text-center py-8 text-slate-500">...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : notifications && (notifications.today.length > 0 || notifications.tomorrow.length > 0) ? (
          <>
            {renderNotificationList(notifications.today, isEn ? 'Today' : 'امروز')}
            {renderNotificationList(notifications.tomorrow, isEn ? 'Tomorrow' : 'فردا')}
          </>
        ) : (
          <div className="text-center py-8 text-slate-500">
            {isEn ? 'No new notifications' : 'اعلان جدیدی وجود ندارد'}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPopover;