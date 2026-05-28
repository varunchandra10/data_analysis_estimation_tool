import { useState } from 'react';
import { runFullPipeline as apiRunFullPipeline, fetchFullDatasetPreview as apiFetchFullDatasetPreview } from '../services/api/pipeline.api';

export function usePipeline() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [pipelineResult, setPipelineResult] = useState(null);

  const runPipeline = async (filePath) => {
    setLoading(true);
    setError(null);
    setPipelineStatus({ status: "running", message: "Pipeline execution started." });
    try {
      const response = await apiRunFullPipeline(filePath);
      const result = response?.data || response;
      setPipelineResult(result);
      const statusData = {
        status: result?.pipeline_status || "completed",
        currentVersion: result?.current_version || "N/A",
        stepsCompleted: result?.steps_completed || [],
        message: "Full pipeline completed successfully. Refreshing dashboard...",
      };
      setPipelineStatus(statusData);
      return { result, status: statusData };
    } catch (err) {
      const detail = err?.details?.detail || err?.message || "Pipeline execution failed.";
      setError(detail);
      setPipelineStatus({ status: "failed", message: detail });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    pipelineStatus,
    setPipelineStatus,
    pipelineResult,
    setPipelineResult,
    runPipeline,
    fetchFullDatasetPreview: apiFetchFullDatasetPreview
  };
}
