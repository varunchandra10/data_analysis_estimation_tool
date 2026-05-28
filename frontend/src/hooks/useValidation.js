import { useState } from 'react';
import { useDatasetContext } from '../context/DatasetContext';
import { runValidation as apiRunValidation, suggestRules as apiSuggestRules } from '../services/api/validation.api';

export function useValidation() {
  const { datasetData, validationResult, setValidationResult, setAnalyticsViewData, setDatasetData, setAIResults, setAIResultsSourcePath } = useDatasetContext();
  const [loading, setLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState(null);

  const runValidationRules = async (rules) => {
    if (!datasetData?.metadata?.file_path) return null;
    setLoading(true);
    setError(null);
    try {
      const response = await apiRunValidation(datasetData.metadata.file_path, rules);
      setValidationResult(response);
      
      if (response?.file_path) {
        setAIResults(null);
        setAIResultsSourcePath(null);
        setAnalyticsViewData(null);
        setDatasetData((prev) => ({
          ...prev,
          preview: response.preview || prev.preview,
          metadata: { ...prev.metadata, file_path: response.file_path },
        }));
      }
      return response;
    } catch (err) {
      setError(err.message || 'Validation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSuggestedRules = async () => {
    if (!datasetData?.metadata?.file_path) return null;
    setIsSuggesting(true);
    setError(null);
    try {
      const response = await apiSuggestRules(datasetData.metadata.file_path);
      return response?.data?.rules || response?.rules || [];
    } catch (err) {
      setError(err.message || 'Suggesting rules failed');
      throw err;
    } finally {
      setIsSuggesting(false);
    }
  };

  return {
    validationResult,
    setValidationResult,
    loading,
    isSuggesting,
    error,
    runValidationRules,
    getSuggestedRules
  };
}
