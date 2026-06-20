import { useState, useEffect, useCallback } from 'react';
import type { UserPlant } from '../types';
import { gardenService } from '../services/api';

export const useUserPlants = () => {
  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!localStorage.getItem('access_token');

  const fetchUserPlants = useCallback(async () => {
    if (!isLoggedIn) {
      setUserPlants([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await gardenService.getUserPlants() as any;
      const plants = Array.isArray(data) ? data : data.results || [];
      setUserPlants(plants);
    } catch (err) {
      console.error('Failed to fetch user plants:', err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchUserPlants();
  }, [fetchUserPlants]);


  const addUserPlant = async (data: { plant: number; nickname?: string }) => {
    try {
      const newUp = await gardenService.addUserPlant(data);
      setUserPlants((prev) => [...prev, newUp]);
    } catch (err) {
      console.error('Failed to add plant to garden:', err);
    }
  };

  const removeUserPlant = async (id: number) => {
    try {
      await gardenService.removeUserPlant(id);
      setUserPlants((prev) => prev.filter((up) => up.id !== id));
    } catch (err) {
      console.error('Failed to remove plant from garden:', err);
    }
  };

  const updateUserPlant = async (id: number, data: Partial<UserPlant>) => {
    try {
      const updated = await gardenService.updateUserPlant(id, data);
      setUserPlants((prev) => prev.map(up => up.id === id ? { ...up, ...updated } : up));
    } catch (err) {
      console.error('Update failed', err);
    }
  };

   const refreshUserPlants = useCallback(() => {
    fetchUserPlants();
  }, [fetchUserPlants]);

  return {
    userPlants,
    loading,
    addUserPlant,
    removeUserPlant,
    updateUserPlant,
    refreshUserPlants,
  };
};