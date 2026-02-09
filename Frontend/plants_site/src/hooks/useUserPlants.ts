import { useState, useEffect } from 'react';
import type { UserPlant } from '../types';
import { gardenService } from '../services/api';

export const useUserPlants = () => {
  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user plants on mount
  useEffect(() => {
    const fetchUserPlants = async () => {
      try {
        const data = await gardenService.getUserPlants();
        setUserPlants(data);
      } catch (err) {
        // Don't show error if it's a 401/403 (unauthenticated), just set empty array
        if (err instanceof Error && (err.message.includes('401') || err.message.includes('403') || err.message.includes('404'))) {
          setUserPlants([]);
        } else {
          setError('Failed to load your plants');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlants();
  }, []);

  return {
    userPlants,
    loading,
    error
  };
};