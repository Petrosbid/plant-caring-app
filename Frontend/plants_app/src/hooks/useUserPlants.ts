import { useState, useEffect, useCallback } from 'react';
import type { UserPlant } from '../types';
import { gardenService } from '../services/api';

export const useUserPlants = () => {
  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserPlants = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gardenService.getUserPlants();
      // Adjusting for potential paginated response
      const plants = Array.isArray(data) ? data : (data as any).results || [];
      setUserPlants(plants);
    } catch (err) {
      console.error('Failed to fetch user plants:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserPlants();
  }, [fetchUserPlants]);

  const addUserPlant = async (data: { plant: number; nickname?: string }) => {
    try {
      const newUp = await gardenService.addUserPlant(data);
      setUserPlants((prev) => [...prev, newUp]);
      return newUp;
    } catch (err) {
      console.error('Failed to add plant to garden:', err);
      throw err;
    }
  };

  const removeUserPlant = async (id: number) => {
    try {
      await gardenService.removeUserPlant(id);
      setUserPlants((prev) => prev.filter((up) => up.id !== id));
    } catch (err) {
      console.error('Failed to remove plant from garden:', err);
      throw err;
    }
  };

  const updateUserPlant = async (id: number, data: Partial<UserPlant>) => {
    try {
      const updated = await gardenService.updateUserPlant(id, data);
      setUserPlants((prev) => prev.map(up => up.id === id ? { ...up, ...updated } : up));
      return updated;
    } catch (err) {
      console.error('Update failed', err);
      throw err;
    }
  };

  return {
    userPlants,
    loading,
    addUserPlant,
    removeUserPlant,
    updateUserPlant,
    refreshUserPlants: fetchUserPlants,
  };
};
