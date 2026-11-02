import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Database,
  Upload,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

import { useDataset } from '../hooks/useDataset';
import { useAI } from '../hooks/useAI';
import { usePipeline } from '../hooks/usePipeline';
import { useVersionContext } from '../context/VersionContext';
import AnalyticsDashboardView from './AnalyticsDashboard';
import { StatusBadge } from './common';

/**
 * AnalyticsDashboardContainer
 * State orchestrator for the Statistical Intelligence Terminal.
 * Handles data hydration, automated pipeline progression, error handling,
 * and empty-state fallbacks with enterprise UX.
 */
export default function AnalyticsDashboardContainer() {
  const navigate = useNavigate();

  const {
    datasetData,
    setDatasetData,
    validationResult,
    setValidationResult,
    estimationResult,
    setEstimationResult,
    outlierResult,
    setOutlierResult,
    duplicateResult,
    setDuplicateResult,
  } = useDataset();

  const { aiResults, setAIResults } = useAI();
  const { setActiveVersion } = useVersionContext();
  const {
    loading: isRunningPipeline,
    pipelineStatus,
    setPipelineStatus,
    pipelineResult,
    runPipeline,
    fetchFullDatasetPreview,
  } = usePipeline();

  const [pipelineError, setPipelineError] = useState(null);
  const [pipelineSuccess, setPipelineSuccess] = useState(false);

  const handleRunFullPipeline = async () => {
    setPipelineError(null);
    setPipelineSuccess(false);

    const filePath = datasetData?.metadata?.file_path || datasetData?.metadata?.filePath;
    if (!filePath) {
      setPipelineError('Dataset file path is not available in current session.');
      setPipelineStatus({ status: 'missing_file', message: 'Dataset file path is not available.' });
      return;
    }

    try {
      const { result } = await runPipeline(filePath);
      const finalDatasetPath =
        result.final_dataset_path ||
        result.current_dataset_path ||
        result.stage_results?.find((stage) => stage?.stage === 'weighting' && stage?.file_path)?.file_path ||
        result.stage_results?.find((stage) => stage?.file_path)?.file_path;

      if (finalDatasetPath && setDatasetData) {
        const newData = await fetchFullDatasetPreview(finalDatasetPath);

        // Merge updated metadata, null counts, and schema
        setDatasetData((prev) => {
          if (!prev) return newData;
          return {
            ...prev,
            ...newData,
            version: result.current_version || prev.version || null,
            metadata: {
              ...(prev.metadata || {}),
              ...(newData.metadata || {}),
              dataset_name: result.dataset_name || newData?.metadata?.dataset_name || prev.metadata?.dataset_name || null,
              file_path: finalDatasetPath || newData?.metadata?.file_path || prev.metadata?.file_path || null,
              version: result.current_version || prev.metadata?.version || null,
              current_version: result.current_version || prev.metadata?.current_version || null,
              pipeline_run_id: result.pipeline_run_id || result.summary?.pipeline_run_id || new Date().toISOString(),
              pipeline_report_path: result.report_path || prev.metadata?.pipeline_report_path || null,
              pipeline_report_download_url: result.report_download_url || prev.metadata?.pipeline_report_download_url || null,
              null_counts: result.summary?.null_counts || prev.metadata?.null_counts || {},
            },
            preview: Array.isArray(newData.rows) ? newData.rows.slice(0, 5) : (prev.preview || []),
          };
        });

        if (setActiveVersion && result.current_version) {
          setActiveVersion(result.current_version);
        }

        // Distribute pipeline results globally across state contexts
        const validationStage = result.stage_results?.find((s) => s.stage === 'validation');
        if (setValidationResult && validationStage?.data) setValidationResult(validationStage.data);

        const outlierStage = result.stage_results?.find((s) => s.stage === 'outliers');
        if (setOutlierResult && outlierStage?.data) setOutlierResult(outlierStage.data);

        const preprocessingStage = result.stage_results?.find((s) => s.stage === 'preprocessing');
        if (setDuplicateResult && preprocessingStage?.data?.duplicates) setDuplicateResult(preprocessingStage.data.duplicates);

        const weightingStage = result.stage_results?.find((s) => s.stage === 'weighting');
        if (setEstimationResult && weightingStage?.data) setEstimationResult(weightingStage.data);

        const aiStage = result.stage_results?.find((s) => s.stage === 'ai');
        if (setAIResults && aiStage?.data) setAIResults(aiStage.data);

        setPipelineSuccess(true);
        setTimeout(() => setPipelineSuccess(false), 5000);

        setPipelineStatus((prev) => ({
          ...prev,
          message: 'Dashboard successfully updated to latest pipeline version.',
        }));
      }
    } catch (error) {
      console.error('Pipeline execution failed:', error);
      setPipelineError(error.message || 'Pipeline execution encountered an unexpected error.');
    }
  };

  // 1. Empty State Fallback (No active dataset loaded in session)
  if (!datasetData) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center font-sans animate-in fade-in duration-200">
        <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center shadow-sm">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/60 mb-5 shadow-2xs">
            <BarChart3 size={28} />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Statistical Analytics Context
            </span>
            <StatusBadge variant="amber" size="xs">
              Buffer Empty
            </StatusBadge>
          </div>

          <h2 className="text-xl font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
            No Survey Dataset Active
          </h2>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Upload a survey microdata file (CSV, XLSX) or select a previously saved version to view
            multivariate distributions, covariance heatmaps, and automated pipeline diagnostics.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/ingestion')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-mono transition-all cursor-pointer shadow-sm"
            >
              <Upload size={14} />
              <span>Ingest Survey Data</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <Database size={14} className="text-slate-400" />
              <span>Go to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Dashboard View with Top Notification Feedback
  return (
    <div className="relative w-full">
      {/* Real-time Pipeline Execution Notification Banner */}
      {pipelineSuccess && (
        <div className="max-w-[1650px] mx-auto px-4 sm:px-6 pt-3">
          <div className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-mono shadow-xs animate-in slide-in-from-top-2 duration-200">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <div className="flex-1 font-semibold">
              Pipeline execution completed successfully! All analytical matrices, weights, and distributions updated.
            </div>
          </div>
        </div>
      )}

      {pipelineError && (
        <div className="max-w-[1650px] mx-auto px-4 sm:px-6 pt-3">
          <div className="flex items-center justify-between gap-2.5 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs font-mono shadow-xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <span>{pipelineError}</span>
            </div>
            <button
              onClick={() => setPipelineError(null)}
              className="text-rose-500 hover:text-rose-800 font-bold px-2 py-0.5 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Analytics Dashboard View */}
      <AnalyticsDashboardView
        datasetData={datasetData}
        setDatasetData={setDatasetData}
        validationResult={validationResult}
        setValidationResult={setValidationResult}
        estimationResult={estimationResult}
        setEstimationResult={setEstimationResult}
        outlierResult={outlierResult}
        setOutlierResult={setOutlierResult}
        duplicateResult={duplicateResult}
        setDuplicateResult={setDuplicateResult}
        aiResults={aiResults}
        setAIResults={setAIResults}
        pipelineStatus={pipelineStatus}
        pipelineResult={pipelineResult}
        isRunningPipeline={isRunningPipeline}
        onRunFullPipeline={handleRunFullPipeline}
      />
    </div>
  );
}
