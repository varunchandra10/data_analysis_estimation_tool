import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import { useVersioning } from '../hooks/useVersioning';
import { useDataset } from '../hooks/useDataset';
import { useStatistics } from '../hooks/useStatistics';
import VersioningPanel from './VersioningPanel';
import { StatusBadge } from './common';

/**
 * Enterprise VersioningContainer Component
 * Orchestrator managing dataset repository discovery, file stage pipelines,
 * checkpoint previews, rollback restores, and directory compression.
 */
export default function VersioningContainer({ className = '' }) {
  const navigate = useNavigate();
  const {
    datasetData,
    setDatasetData,
    setActiveTab,
    setAnalyticsViewData,
  } = useDataset();

  const { fetchProfile } = useStatistics();

  const {
    fetchDatasetsList,
    fetchFiles,
    deleteFile,
    previewFile,
    analyticsFile,
    compressFolder,
    rollback,
    setActiveVersion,
  } = useVersioning();

  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [datasetFiles, setDatasetFiles] = useState([]);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState('');

  const normalizeOutput = (response, fallbackMessage = 'Operation completed successfully.') => {
    if (!response) {
      return { success: false, message: fallbackMessage };
    }

    const payload = response?.data || response;
    const success =
      Boolean(payload?.success) ||
      payload?.status === 'success' ||
      Boolean(response?.success) ||
      response?.status === 'success';
    const message = payload?.message || response?.message || fallbackMessage;

    return {
      ...payload,
      success,
      message,
    };
  };

  const currentDatasetName = useMemo(() => {
    return (
      datasetData?.metadata?.dataset_name ||
      datasetData?.metadata?.filename?.replace(/\.[^.]+$/, '') ||
      datasetData?.dataset_name ||
      ''
    );
  }, [datasetData]);

  const pipelineRefreshToken =
    datasetData?.metadata?.pipeline_run_id ||
    datasetData?.metadata?.file_path ||
    '';

  const activeSelectedDataset = useMemo(() => {
    if (selectedDataset) return selectedDataset;
    if (currentDatasetName && datasets.some((item) => item.dataset_name === currentDatasetName)) {
      return currentDatasetName;
    }
    return datasets[0]?.dataset_name || '';
  }, [selectedDataset, currentDatasetName, datasets]);

  const loadFiles = useCallback(async (datasetName) => {
    if (!datasetName) return;
    setLoading(true);
    try {
      const files = await fetchFiles(datasetName);
      const STAGE_ORDER = {
        raw: 0,
        clean: 1,
        cleaned: 1,
        outlier: 2,
        outlier_detected: 2,
        validation: 3,
        validated: 3,
        estimation: 4,
        estimated: 4,
      };
      const orderedFiles = [...(files || [])].sort((left, right) => {
        const leftStage = left.stage || left.file_name.split('_', 1)[0];
        const rightStage = right.stage || right.file_name.split('_', 1)[0];
        const rankDiff = (STAGE_ORDER[leftStage] ?? 99) - (STAGE_ORDER[rightStage] ?? 99);
        return rankDiff !== 0 ? rankDiff : left.file_name.localeCompare(right.file_name);
      });
      setDatasetFiles(orderedFiles);

      if (orderedFiles.length > 0) {
        setSelectedFile(orderedFiles[0].file_name);
        setSelectedFilePath(orderedFiles[0].file_path);
      } else {
        setSelectedFile('');
        setSelectedFilePath('');
      }
    } catch (error) {
      setOutput({
        success: false,
        status: 'error',
        detail: error.message,
        message: error.message,
      });
      setDatasetFiles([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFiles]);

  const loadDatasets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDatasetsList();
      const items = data?.datasets || [];
      setDatasets(items);
    } catch (error) {
      setOutput({
        success: false,
        status: 'error',
        detail: error.message,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [fetchDatasetsList]);

  // Initial load
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadDatasets();
    });
    return () => {
      active = false;
    };
  }, [loadDatasets]);

  // Load files when activeSelectedDataset changes
  useEffect(() => {
    if (activeSelectedDataset) {
      let active = true;
      Promise.resolve().then(() => {
        if (active) loadFiles(activeSelectedDataset);
      });
      return () => {
        active = false;
      };
    }
  }, [activeSelectedDataset, pipelineRefreshToken, loadFiles]);

  const handlePreviewFile = async (mode = 'preview') => {
    const targetDataset = activeSelectedDataset;
    if (!targetDataset || !selectedFile) return;
    setLoading(true);
    try {
      if (mode === 'preview' || mode === 'dataset_viewer') {
        const targetFilePath =
          selectedFilePath ||
          datasetFiles.find((file) => file.file_name === selectedFile)?.file_path ||
          '';

        const [previewData, stats] = await Promise.all([
          previewFile(targetDataset, selectedFile),
          fetchProfile(targetFilePath),
        ]);

        const previewRows = Array.isArray(previewData?.preview) ? previewData.preview : [];
        const newColumns = previewData?.columns_list || [];
        const preservedSchema = newColumns.map((colName) => {
          const existingCol = (datasetData?.schema || []).find((c) => c.column === colName);
          return (
            existingCol || {
              column: colName,
              type: 'Unknown',
              pandas_dtype: 'unknown',
            }
          );
        });

        const preservedStatistics = stats || datasetData?.statistics || null;

        const comprehensiveDatasetPayload = {
          ...datasetData,
          metadata: {
            ...(datasetData?.metadata || {}),
            filename: selectedFile,
            dataset_name: targetDataset,
            file_path: previewData?.file_path || targetFilePath,
            rows: Number(previewData?.rows ?? previewRows.length ?? datasetData?.metadata?.rows ?? 0) || 0,
            columns: Number(previewData?.columns ?? datasetData?.metadata?.columns ?? 0) || 0,
            null_counts: previewData?.missing_counts || datasetData?.metadata?.null_counts || {},
          },
          preview: previewRows,
          rows: previewRows,
          columns: newColumns.length > 0 ? newColumns : datasetData?.columns || [],
          schema: preservedSchema,
          statistics: preservedStatistics,
          total_rows: Number(previewData?.rows ?? previewRows.length ?? datasetData?.metadata?.rows ?? 0) || 0,
        };

        setOutput(normalizeOutput(previewData, 'Preview loaded successfully.'));

        const stage = selectedFile.replace(/\.[^.]+$/, '');
        setActiveVersion(stage);
        setDatasetData(comprehensiveDatasetPayload);
        setAnalyticsViewData(null);
        setActiveTab('overview');

        if (mode === 'preview') {
          navigate('/data/preview');
        } else {
          navigate('/data/whole-dataset');
        }
        return;
      }

      if (mode === 'analytics') {
        const filePathForAnalytics =
          selectedFilePath ||
          datasetFiles.find((file) => file.file_name === selectedFile)?.file_path ||
          '';

        const [previewData, analyticsData, stats] = await Promise.all([
          previewFile(targetDataset, selectedFile),
          analyticsFile(targetDataset, selectedFile),
          fetchProfile(filePathForAnalytics),
        ]);

        const analyticsDataset = {
          metadata: {
            filename: selectedFile,
            dataset_name: targetDataset,
            file_path: previewData?.file_path || filePathForAnalytics,
            rows: analyticsData?.analytics?.rows ?? previewData?.rows ?? 0,
            columns: analyticsData?.analytics?.columns ?? previewData?.columns ?? 0,
            null_counts: analyticsData?.analytics?.missing_counts || {},
          },
          preview: previewData?.preview || [],
          statistics: stats || null,
        };

        setSelectedFilePath(analyticsDataset.metadata.file_path);
        setOutput({
          status: 'success',
          dataset_name: targetDataset,
          file_name: selectedFile,
          analytics: analyticsData?.analytics,
        });

        const stage = selectedFile.replace(/\.[^.]+$/, '');
        setActiveVersion(stage);
        setAnalyticsViewData(analyticsDataset);
        setActiveTab('analytics');
        navigate('/analytics');
        return;
      }
    } catch (error) {
      setOutput({
        success: false,
        status: 'error',
        detail: error.message,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompressFolder = async () => {
    const targetDataset = activeSelectedDataset;
    if (!targetDataset) return;
    setLoading(true);
    try {
      const response = await compressFolder(targetDataset);
      setOutput(normalizeOutput(response, 'Dataset repository compressed successfully.'));
    } catch (error) {
      setOutput({
        success: false,
        status: 'error',
        detail: error.message,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreV2 = async () => {
    const targetDataset = activeSelectedDataset || currentDatasetName;
    if (!targetDataset) return;
    const latestOutlierVersion = [...datasetFiles]
      .map((file) => file.file_name.replace(/\.[^.]+$/, ''))
      .reverse()
      .find((fileName) => /_outliers$/.test(fileName));

    if (!latestOutlierVersion) {
      setOutput({
        status: 'error',
        detail: 'No outlier version is available to restore.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await rollback(targetDataset, latestOutlierVersion);
      setOutput(normalizeOutput(response, 'Rollback completed successfully.'));
      await loadFiles(targetDataset);
    } catch (error) {
      setOutput({
        success: false,
        status: 'error',
        detail: error.message,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelectedFile = (fileName) => {
    if (!activeSelectedDataset || !fileName) return;
    setFileToDelete(fileName);
    setShowDeleteModal(true);
  };

  const handlePerformDeleteFile = async () => {
    const fileName = fileToDelete;
    const targetDataset = activeSelectedDataset;
    if (!targetDataset || !fileName) return;
    setShowDeleteModal(false);
    setLoading(true);
    try {
      const response = await deleteFile(targetDataset, fileName);
      await loadFiles(targetDataset);
      setOutput(normalizeOutput(response, 'Checkpoint purged successfully.'));
    } catch (error) {
      setOutput({ success: false, status: 'error', detail: error.message, message: error.message });
    } finally {
      setLoading(false);
      setFileToDelete('');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setFileToDelete('');
  };

  // Standby Empty State when no datasets exist and none is active
  if (!loading && datasets.length === 0 && !currentDatasetName) {
    return (
      <section
        className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs font-sans text-slate-800 dark:text-slate-100 transition-all ${className}`}
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Lineage Registry Standby
              </span>
              <StatusBadge variant="slate" size="xs">
                No Staged Repositories
              </StatusBadge>
            </div>
            <h3 className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
              Checkpoint Version Lineage & Storage Control
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Track multi-stage transformation checkpoints, inspect intermediate schema states, and rollback pipelines.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-xs mb-4">
            <GitBranch size={26} />
          </div>
          <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
            No Checkpoint Repositories Found
          </h4>
          <p className="mt-2 max-w-md text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            To generate checkpoint version trees, ingest a survey dataset and execute cleaning, imputation, or outlier mitigation passes.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/data/preview')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] px-4 py-2.5 text-xs font-bold font-mono text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <span>Ingest Survey Dataset</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/data/whole-dataset')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 shadow-2xs transition-all cursor-pointer"
            >
              <Database size={14} className="text-indigo-500" />
              <span>Datasheet View</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <VersioningPanel
      data={datasetData}
      datasets={datasets}
      selectedDataset={activeSelectedDataset}
      setSelectedDataset={setSelectedDataset}
      selectedFile={selectedFile}
      setSelectedFile={setSelectedFile}
      selectedFilePath={selectedFilePath}
      setSelectedFilePath={setSelectedFilePath}
      datasetFiles={datasetFiles}
      output={output}
      loading={loading}
      showDeleteModal={showDeleteModal}
      fileToDelete={fileToDelete}
      onRefresh={loadDatasets}
      onCompress={handleCompressFolder}
      onPreview={handlePreviewFile}
      onRestoreV2={handleRestoreV2}
      onDeleteClick={handleDeleteSelectedFile}
      onDeleteConfirm={handlePerformDeleteFile}
      onDeleteCancel={handleCancelDelete}
      className={className}
    />
  );
}
