import { useState, useEffect } from 'react';
import type { Plant } from '../types';
import { plantService } from '../services/api';

export const usePlants = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load plants
  const fetchPlants = async (query: string = '') => {
    try {
      setLoading(true);
      if (query.trim()) {
        const data = await plantService.searchPlants(query);
        setPlants(data);
      } else {
        // If no query, get all plants
        const data = await plantService.getAllPlants();
        setPlants(data);
      }
    } catch (err) {
      setError('Failed to load plants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  return {
    plants,
    loading,
    error,
    fetchPlants,
    setError
  };
};