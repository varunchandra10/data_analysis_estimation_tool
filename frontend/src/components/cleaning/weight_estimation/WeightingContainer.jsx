import React, { useState } from 'react';
import { useDataset } from '../../../hooks/useDataset';
import { useWeighting } from '../../../hooks/useWeighting';
import { useAI } from '../../../hooks/useAI';
import WeightEstimationPanel from './WeightEstimationPanel';

export default function WeightingContainer() {
  const { datasetData } = useDataset();
  const { estimate, estimationResult, loading, error } = useWeighting();
  const { aiResults, fetchAIExplanations } = useAI();

  const [valueColumn, setValueColumn] = useState('');
  const [weightColumn, setWeightColumn] = useState('');
  const [analysisType, setAnalysisType] = useState('mean');

  // Convert AI recommendations/insights specifically related to weighting
  const aiInsights = aiResults?.recommendations
    ?.filter(rec => rec.recommendations?.outlier_method || rec.recommendations?.missing_value_method)
    ?.map(rec => rec.column) || [];

  const handleRunAnalysis = async () => {
    try {
      const res = await estimate(valueColumn, weightColumn, analysisType);
      if (res && res.results) {
        await fetchAIExplanations({
          weighting_summary: {
            analysis_type: res.results.analysis_type || 'weighted_mean',
            weighted_value: res.results.weighted_mean || res.results.weighted_proportion,
            unweighted_value: res.results.unweighted_mean || res.results.unweighted_proportion,
            margin_of_error: res.results.margin_of_error || res.results.moe
          }
        });
      }
    } catch (err) {
      console.error("Weighting Execution Error:", err);
    }
  };

  return (
    <WeightEstimationPanel
      data={datasetData}
      aiInsights={aiInsights}
      valueColumn={valueColumn}
      setValueColumn={setValueColumn}
      weightColumn={weightColumn}
      setWeightColumn={setWeightColumn}
      analysisType={analysisType}
      setAnalysisType={setAnalysisType}
      result={estimationResult}
      loading={loading}
      error={error}
      onRunAnalysis={handleRunAnalysis}
    />
  );
}
