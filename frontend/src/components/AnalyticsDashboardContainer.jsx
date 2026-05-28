import React from 'react';
import { useDataset } from '../hooks/useDataset';
import { useAI } from '../hooks/useAI';
import { usePipeline } from '../hooks/usePipeline';
import { useVersionContext } from '../context/VersionContext';
import AnalyticsDashboardView from './AnalyticsDashboard';

export default function AnalyticsDashboardContainer() {
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
    setDuplicateResult
  } = useDataset();

  const { aiResults, setAIResults } = useAI();
  const { setActiveVersion } = useVersionContext();
  const {
    loading: isRunningPipeline,
    pipelineStatus,
    setPipelineStatus,
    pipelineResult,
    runPipeline,
    fetchFullDatasetPreview
  } = usePipeline();

  const handleRunFullPipeline = async () => {
    const filePath = datasetData?.metadata?.file_path || datasetData?.metadata?.filePath;
    if (!filePath) {
      setPipelineStatus({ status: "missing_file", message: "Dataset file path is not available." });
      return;
    }

    try {
      const { result } = await runPipeline(filePath);
      const finalDatasetPath = result.final_dataset_path
        || result.current_dataset_path
        || result.stage_results?.find((stage) => stage?.stage === 'weighting' && stage?.file_path)?.file_path
        || result.stage_results?.find((stage) => stage?.file_path)?.file_path;

      if (finalDatasetPath && setDatasetData) {
        const newData = await fetchFullDatasetPreview(finalDatasetPath);
        
        // Preserve existing statistics, schema, and merge new metadata with updated null counts
        setDatasetData(prev => {
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
              null_counts: result.summary?.null_counts || prev.metadata?.null_counts || {}
            },
            preview: Array.isArray(newData.rows) ? newData.rows.slice(0, 5) : (prev.preview || []),
          };
        });

        if (setActiveVersion && result.current_version) {
          setActiveVersion(result.current_version);
        }
        
        // Distribute pipeline results globally so all tabs reflect the latest execution seamlessly
        const validationStage = result.stage_results?.find(s => s.stage === 'validation');
        if (setValidationResult && validationStage?.data) setValidationResult(validationStage.data);

        const outlierStage = result.stage_results?.find(s => s.stage === 'outliers');
        if (setOutlierResult && outlierStage?.data) setOutlierResult(outlierStage.data);

        const preprocessingStage = result.stage_results?.find(s => s.stage === 'preprocessing');
        if (setDuplicateResult && preprocessingStage?.data?.duplicates) setDuplicateResult(preprocessingStage.data.duplicates);

        const weightingStage = result.stage_results?.find(s => s.stage === 'weighting');
        if (setEstimationResult && weightingStage?.data) setEstimationResult(weightingStage.data);

        const aiStage = result.stage_results?.find(s => s.stage === 'ai');
        if (setAIResults && aiStage?.data) setAIResults(aiStage.data);
        
        setPipelineStatus(prev => ({
          ...prev,
          message: "Dashboard successfully updated to latest pipeline version."
        }));
      }

    } catch (error) {
      console.error("Pipeline run failed:", error);
    }
  };

  return (
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
  );
}
