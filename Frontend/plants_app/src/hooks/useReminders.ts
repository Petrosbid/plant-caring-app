import { useState, useEffect, useCallback } from 'react';
import type { Reminder } from '../types';
import { reminderService } from '../services/api';

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reminderService.getReminders();
      setReminders(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const addReminder = async (reminder: Partial<Reminder>) => {
    try {
      const newReminder = await reminderService.createReminder(reminder);
      setReminders(prev => [newReminder, ...prev]);
      return newReminder;
    } catch (err) {
      setError('Failed to add reminder');
      throw err;
    }
  };

  const toggleReminder = async (id: number) => {
    try {
      await reminderService.toggleReminder(id);
      setReminders(prev => prev.map(rem => 
        rem.id === id ? { ...rem, is_completed: !rem.is_completed } : rem
      ));
    } catch (err) {
      setError('Failed to update reminder');
    }
  };

  const deleteReminder = async (id: number) => {
    try {
      await reminderService.deleteReminder(id);
      setReminders(prev => prev.filter(rem => rem.id !== id));
    } catch (err) {
      setError('Failed to delete reminder');
    }
  };

  return {
    reminders,
    loading,
    error,
    addReminder,
    toggleReminder,
    deleteReminder,
    refreshReminders: fetchReminders,
  };
};
