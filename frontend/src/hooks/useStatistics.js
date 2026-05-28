import { useState, useCallback } from 'react';
import { getDatasetProfile } from '../services/api/statistics.api';

export function useStatistics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);

  const fetchProfile = useCallback(async (filePath) => {
    if (!filePath) return null;
    setLoading(true);
    setError(null);
    try {
      const response = await getDatasetProfile(filePath);
      const stats = response?.data?.stats || response?.stats || null;
      setStatistics(stats);
      return stats;
    } catch (err) {
      setError(err.message || 'Failed to fetch statistics profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    statistics,
    loading,
    error,
    fetchProfile
  };
}
