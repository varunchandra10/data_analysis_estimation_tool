import React, { createContext, useContext, useRef, useState } from 'react';
import { useDatasetContext } from './DatasetContext';
import { getAIRecommendations, getAIExplanations } from '../services/api/ai.api';

export const AIContext = createContext(null);

export function AIProvider({ children }) {
  const {
    datasetData,
    aiResults,
    setAIResults,
    aiResultsSourcePath,
    setAIResultsSourcePath,
    validationResult,
    estimationResult
  } = useDatasetContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [explanations, setExplanations] = useState(null);
  const [loadingExplanations, setLoadingExplanations] = useState(false);
  const [explanationsError, setExplanationsError] = useState(null);
  const [cacheUsed, setCacheUsed] = useState(false);
  const lastExplanationSignatureRef = useRef('');

  const buildExplanationSignature = () => {
    const path = datasetData?.metadata?.file_path || '';
    const recommendations = Array.isArray(aiResults?.recommendations)
      ? aiResults.recommendations
        .map((item) => {
          const rec = item?.recommendations || {};
          return `${item?.column || ''}:${rec?.missing_value_method || ''}:${rec?.outlier_method || ''}`;
        })
        .join('|')
      : '';

    const validationSig = validationResult
      ? `${validationResult?.failed_rules || validationResult?.total_violations || 0}`
      : '';
    const weightingSig = estimationResult
      ? `${estimationResult?.results?.analysis_type || ''}:${estimationResult?.results?.weighted_mean || estimationResult?.results?.weighted_proportion || ''}`
      : '';

    return `${path}::${recommendations}::${validationSig}::${weightingSig}`;
  };

  const fetchAIExplanations = async (customPayload = null) => {
    const path = datasetData?.metadata?.file_path;
    if (!path) return null;

    setLoadingExplanations(true);
    setExplanationsError(null);
    try {
      const recommendations = aiResults?.recommendations || [];
      
      const validationSummary = customPayload?.validation_summary || (validationResult ? {
        column: 'dataset',
        rule_type: 'dsl_rules',
        total_violations: validationResult.failed_rules || validationResult.total_violations || 0
      } : {});

      const weightingSummary = customPayload?.weighting_summary || (estimationResult ? {
        analysis_type: estimationResult.results?.analysis_type || 'weighted_mean',
        weighted_value: estimationResult.results?.weighted_mean || estimationResult.results?.weighted_proportion,
        unweighted_value: estimationResult.results?.unweighted_mean || estimationResult.results?.unweighted_proportion,
        margin_of_error: estimationResult.results?.margin_of_error || estimationResult.results?.moe
      } : {});

      const qualitySummary = customPayload?.quality_summary || (datasetData?.statistics ? {
        score: datasetData.statistics.quality_score || datasetData.statistics.score,
        grade: datasetData.statistics.grade,
        components: datasetData.statistics.components
      } : {});

      const response = await getAIExplanations(
        path,
        customPayload?.recommendations || recommendations,
        validationSummary,
        weightingSummary,
        qualitySummary
      );

      const responseData = response?.data?.data || response?.data || response || {};
      setExplanations(responseData);
      setCacheUsed(!!responseData.cache_used);
      return responseData;
    } catch (err) {
      setExplanationsError(err.message || 'Failed to fetch AI explanations');
      console.error('AI Context Explanations Error:', err);
      throw err;
    } finally {
      setLoadingExplanations(false);
    }
  };

  const handleResetAIExplanations = () => {
    setExplanations(null);
    setExplanationsError(null);
    setCacheUsed(false);
  };

  React.useEffect(() => {
    if (!aiResults || loadingExplanations || !datasetData?.metadata?.file_path) {
      return;
    }

    const signature = buildExplanationSignature();
    if (!signature || signature === lastExplanationSignatureRef.current) {
      return;
    }

    lastExplanationSignatureRef.current = signature;
    fetchAIExplanations().catch(err => console.error("Auto-fetch explanations failed:", err));
  }, [aiResults, datasetData?.metadata?.file_path, validationResult, estimationResult, loadingExplanations]);

  const fetchAIRecommendations = async (filePath, schema, metadata) => {
    const path = filePath || datasetData?.metadata?.file_path;
    const finalSchema = schema || datasetData?.schema;
    const finalMeta = metadata || datasetData?.metadata;

    if (!path) return null;

    if (aiResultsSourcePath === path && aiResults) {
      return aiResults;
    }

    setLoading(true);
    setError(null);
    setExplanations(null);
    setCacheUsed(false);
    try {
      const response = await getAIRecommendations(path, finalSchema, finalMeta);
      const result = response?.data || response;
      setAIResults(result);
      setAIResultsSourcePath(path);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fetch AI recommendations');
      console.error('AI Context Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const aiRecommendations = aiResults?.recommendations || [];
  const missingValueInsights = aiRecommendations.map((item) => {
    const recommendation = item.recommendations || {};
    const reasonParts = [];

    if (item.statistics?.missing_percent !== undefined) {
      reasonParts.push(`Missing ${item.statistics.missing_percent}%`);
    }

    if (Array.isArray(recommendation.reason_codes) && recommendation.reason_codes.length > 0) {
      reasonParts.push(recommendation.reason_codes.join(', '));
    }

    return {
      column: item.column,
      recommended_method: recommendation.missing_value_method || 'review',
      reason: reasonParts.join(' • ') || 'Backend AI recommendation available',
      warning: recommendation.warnings?.[0] || null,
    };
  });

  const outlierInsights = aiRecommendations.map((item) => {
    const recommendation = item.recommendations || {};

    return {
      column: item.column,
      recommended_method: recommendation.outlier_method || 'iqr',
      reason: recommendation.warnings?.[0] || recommendation.reason_codes?.[0] || 'Backend AI recommendation available',
      warning: recommendation.warnings?.[0] || null,
    };
  });

  const validationInsights = aiRecommendations.map((item) => {
    const recommendation = item.recommendations || {};

    return {
      column: item.column,
      operator: '==',
      value: recommendation.missing_value_method || recommendation.outlier_method || 'review',
      severity: recommendation.validation_priority || 'low',
    };
  });

  return (
    <AIContext.Provider
      value={{
        aiResults,
        setAIResults,
        aiResultsSourcePath,
        setAIResultsSourcePath,
        aiLoading: loading,
        aiError: error,
        fetchAIRecommendations,
        missingValueInsights,
        outlierInsights,
        validationInsights,
        explanations,
        setExplanations,
        loadingExplanations,
        explanationsError,
        explanationsCacheUsed: cacheUsed,
        fetchAIExplanations,
        resetAIExplanations: handleResetAIExplanations
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAIContext() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
}
