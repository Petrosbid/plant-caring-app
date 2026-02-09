import { useState, useEffect } from 'react';
import type { Reminder } from '../types';
import { reminderService } from '../services/api';

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load reminders on mount
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const data = await reminderService.getReminders();
        setReminders(data);
      } catch (err) {
        // Don't show error if it's a 401/403 (unauthenticated), just set empty array
        if (err instanceof Error && (err.message.includes('401') || err.message.includes('403') || err.message.includes('404'))) {
          setReminders([]);
        } else {
          setError('Failed to load reminders');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const addReminder = async (reminder: Omit<Reminder, 'id'>) => {
    try {
      const newReminder = await reminderService.createReminder(reminder);
      setReminders([...reminders, newReminder]);
      return newReminder;
    } catch (err) {
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) {
        setError('Please log in to add reminders');
      } else {
        setError('Failed to add reminder');
      }
      console.error(err);
      throw err;
    }
  };

  const updateReminder = async (id: number, updates: Partial<Reminder>) => {
    try {
      const updatedReminder = await reminderService.updateReminder(id, updates);
      setReminders(reminders.map(rem => rem.id === id ? updatedReminder : rem));
      return updatedReminder;
    } catch (err) {
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) {
        setError('Please log in to update reminders');
      } else {
        setError('Failed to update reminder');
      }
      console.error(err);
      throw err;
    }
  };

  const deleteReminder = async (id: number) => {
    try {
      await reminderService.deleteReminder(id);
      setReminders(reminders.filter(rem => rem.id !== id));
    } catch (err) {
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) {
        setError('Please log in to delete reminders');
      } else {
        setError('Failed to delete reminder');
      }
      console.error(err);
      throw err;
    }
  };

  const toggleReminder = async (id: number) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      return await updateReminder(id, { is_completed: !reminder.is_completed });
    }
  };

  return {
    reminders,
    loading,
    error,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    setError
  };
};