import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowRight } from 'lucide-react';
import { useDataset } from '../../../hooks/useDataset';
import { useWeighting } from '../../../hooks/useWeighting';
import { useAI } from '../../../hooks/useAI';
import WeightEstimationPanel from './WeightEstimationPanel';

export default function WeightingContainer() {
  const navigate = useNavigate();
  const { datasetData } = useDataset();
  const { estimate, estimationResult, loading, error } = useWeighting();
  const { aiResults, fetchAIExplanations } = useAI();

  const [localValueCol, setLocalValueCol] = useState('');
  const [localWeightCol, setLocalWeightCol] = useState('');
  const [analysisType, setAnalysisType] = useState('mean');

  // Schema analysis
  const schema = useMemo(() => {
    return Array.isArray(datasetData?.schema) ? datasetData.schema : [];
  }, [datasetData]);
  const numericColumns = useMemo(() => {
    return schema.filter(
      (col) => col.type === "Numerical" || col.type === "numeric" || col.type === "Integer" || col.type === "Float"
    );
  }, [schema]);

  // Auto-detect weight candidate column (e.g., columns named weight, weights, wgt, sample_weight)
  const defaultWeightCol = useMemo(() => {
    if (numericColumns.length === 0) return '';
    const match = numericColumns.find(c => /weight|wgt|ipf|calibrated/i.test(c.column));
    return match ? match.column : (numericColumns.length > 1 ? numericColumns[numericColumns.length - 1].column : '');
  }, [numericColumns]);

  // Auto-detect target value column (first numeric column that is not the weight column)
  const defaultValueCol = useMemo(() => {
    if (numericColumns.length === 0) return schema[0]?.column || '';
    const nonWeight = numericColumns.find(c => c.column !== defaultWeightCol);
    return nonWeight ? nonWeight.column : numericColumns[0].column;
  }, [numericColumns, defaultWeightCol, schema]);

  const valueColumn = localValueCol || defaultValueCol;
  const weightColumn = localWeightCol || defaultWeightCol;

  // AI recommendations/insights specifically related to weighting and distributions
  const aiInsights = useMemo(() => {
    if (!aiResults?.recommendations) return [];
    return aiResults.recommendations
      .filter(rec => rec.recommendations?.outlier_method || rec.recommendations?.missing_value_method)
      .map(rec => rec.column) || [];
  }, [aiResults]);

  const handleRunAnalysis = async () => {
    if (!valueColumn || !weightColumn) return;
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

  // Standby Empty State if no active dataset buffer is hydrated
  if (!datasetData) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm max-w-xl mx-auto my-12 font-sans">
        <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mb-4 shadow-2xs">
          <Scale size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono uppercase tracking-tight">
          No Active Dataset Buffer
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm leading-relaxed">
          Ingest a microdata dataset or select an active file in Dataset Explorer to run probability weighting, post-stratification, and survey inference.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dataset-explorer')}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer font-mono"
        >
          <span>Open Dataset Explorer</span>
          <ArrowRight size={13} />
        </button>
      </div>
    );
  }

  return (
    <WeightEstimationPanel
      data={datasetData}
      aiInsights={aiInsights}
      valueColumn={valueColumn}
      setValueColumn={setLocalValueCol}
      weightColumn={weightColumn}
      setWeightColumn={setLocalWeightCol}
      analysisType={analysisType}
      setAnalysisType={setAnalysisType}
      result={estimationResult}
      loading={loading}
      error={error}
      onRunAnalysis={handleRunAnalysis}
    />
  );
}
