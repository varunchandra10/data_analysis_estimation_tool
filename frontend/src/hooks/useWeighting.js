import { useState } from 'react';
import { useDatasetContext } from '../context/DatasetContext';
import { estimateWeights } from '../services/api/statistics.api';

export function useWeighting() {
  const { datasetData, estimationResult, setEstimationResult } = useDatasetContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const estimate = async (valueColumn, weightColumn, analysisType) => {
    if (!datasetData?.metadata?.file_path) return null;
    setLoading(true);
    setError(null);
    try {
      const response = await estimateWeights(
        datasetData.metadata.file_path,
        valueColumn,
        weightColumn,
        analysisType
      );
      setEstimationResult(response);
      return response;
    } catch (err) {
      setError(err.message || 'Weight estimation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    estimationResult,
    setEstimationResult,
    loading,
    error,
    estimate
  };
}
