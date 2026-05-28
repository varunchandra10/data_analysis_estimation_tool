import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVersioning } from '../hooks/useVersioning';
import { useDataset } from '../hooks/useDataset';
import { useStatistics } from '../hooks/useStatistics';
import VersioningPanel from './VersioningPanel';

export default function VersioningContainer() {
  const navigate = useNavigate();
  const { 
    datasetData, 
    setDatasetData, 
    setActiveTab, 
    setAnalyticsViewData 
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
    setActiveVersion
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
    const success = payload?.success ?? payload?.status === 'success' ?? response?.success ?? response?.status === 'success';
    const message = payload?.message || response?.message || fallbackMessage;

    return {
      ...payload,
      success,
      message,
    };
  };

  const currentDatasetName = useMemo(() => {
    return datasetData?.metadata?.dataset_name || datasetData?.metadata?.filename?.replace(/\.[^.]+$/, '') || '';
  }, [datasetData]);

  const pipelineRefreshToken = datasetData?.metadata?.pipeline_run_id || datasetData?.metadata?.file_path || '';

  const loadDatasets = async () => {
    setLoading(true);
    try {
      const data = await fetchDatasetsList();
      const items = data?.datasets || [];
      setDatasets(items);
      setOutput({
        success: true,
        message: 'Datasets loaded successfully.',
        datasets: items,
        ...(data?.data || data),
      });

      if (currentDatasetName && items.some((item) => item.dataset_name === currentDatasetName)) {
        setSelectedDataset(currentDatasetName);
      } else if (!selectedDataset && items.length > 0) {
        setSelectedDataset(items[0].dataset_name);
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

  const loadFiles = async (datasetName) => {
    if (!datasetName) return;
    setLoading(true);
    try {
      const files = await fetchFiles(datasetName);
      // Sort logic
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
      const orderedFiles = [...files].sort((left, right) => {
        const leftStage = left.stage || left.file_name.split('_', 1)[0];
        const rightStage = right.stage || right.file_name.split('_', 1)[0];
        const rankDifference = (STAGE_ORDER[leftStage] ?? 99) - (STAGE_ORDER[rightStage] ?? 99);
        return rankDifference !== 0 ? rankDifference : left.file_name.localeCompare(right.file_name);
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
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  useEffect(() => {
    if (!selectedDataset && currentDatasetName && datasets.some((item) => item.dataset_name === currentDatasetName)) {
      setSelectedDataset(currentDatasetName);
      return;
    }

    if (selectedDataset) {
      loadFiles(selectedDataset);
    }
  }, [selectedDataset, currentDatasetName, datasets, pipelineRefreshToken]);

  const handlePreviewFile = async (mode = 'preview') => {
    if (!selectedDataset || !selectedFile) return;
    setLoading(true);
    try {
      if (mode === 'preview' || mode === 'dataset_viewer') {
        const targetFilePath = selectedFilePath || datasetFiles.find((file) => file.file_name === selectedFile)?.file_path || '';
        const [previewData, stats] = await Promise.all([
          previewFile(selectedDataset, selectedFile),
          fetchProfile(targetFilePath)
        ]);

        const previewRows = Array.isArray(previewData?.preview) ? previewData.preview : [];
        
        // Dynamically adjust/re-align schema columns to match versioned file
        const newColumns = previewData?.columns_list || [];
        const preservedSchema = newColumns.map(colName => {
          const existingCol = (datasetData?.schema || []).find(c => c.column === colName);
          return existingCol || {
            column: colName,
            type: 'Unknown',
            pandas_dtype: 'unknown'
          };
        });

        const preservedStatistics = stats || datasetData?.statistics || null;

        const comprehensiveDatasetPayload = {
          ...datasetData,
          metadata: {
            ...(datasetData?.metadata || {}),
            filename: selectedFile,
            dataset_name: selectedDataset,
            file_path: previewData?.file_path || targetFilePath,
            rows: Number(previewData?.rows ?? previewRows.length ?? datasetData?.metadata?.rows ?? 0) || 0,
            columns: Number(previewData?.columns ?? datasetData?.metadata?.columns ?? 0) || 0,
            null_counts: previewData?.missing_counts || datasetData?.metadata?.null_counts || {},
          },
          preview: previewRows,
          rows: previewRows,
          columns: newColumns.length > 0 ? newColumns : (datasetData?.columns || []),
          schema: preservedSchema,
          statistics: preservedStatistics,
          total_rows: Number(previewData?.rows ?? previewRows.length ?? datasetData?.metadata?.rows ?? 0) || 0,
        };

        setOutput(normalizeOutput(previewData, 'Preview loaded successfully.'));
        
        // Update active version in context
        const stage = selectedFile.replace(/\.[^.]+$/, '');
        setActiveVersion(stage);
        
        // Update datasetData context
        setDatasetData(comprehensiveDatasetPayload);
        setAnalyticsViewData(null);
        setActiveTab('overview');
        
        if (mode === 'preview') {
          navigate('/dataset-explorer');
        } else {
          navigate('/whole-dataset');
        }
        return;
      }

      if (mode === 'analytics') {
        const filePathForAnalytics = selectedFilePath || datasetFiles.find((file) => file.file_name === selectedFile)?.file_path || '';
        
        const [previewData, analyticsData, stats] = await Promise.all([
          previewFile(selectedDataset, selectedFile),
          analyticsFile(selectedDataset, selectedFile),
          fetchProfile(filePathForAnalytics)
        ]);

        const analyticsDataset = {
          metadata: {
            filename: selectedFile,
            dataset_name: selectedDataset,
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
          dataset_name: selectedDataset,
          file_name: selectedFile,
          analytics: analyticsData?.analytics,
        });

        // Set active version
        const stage = selectedFile.replace(/\.[^.]+$/, '');
        setActiveVersion(stage);

        setAnalyticsViewData(analyticsDataset);
        setActiveTab('analytics');
        navigate('/statistical-engine');
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
    if (!selectedDataset) return;
    setLoading(true);
    try {
      const response = await compressFolder(selectedDataset);
      setOutput(normalizeOutput(response, 'Dataset compressed successfully.'));
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
    const datasetName = selectedDataset || currentDatasetName;
    if (!datasetName) return;
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
      const response = await rollback(datasetName, latestOutlierVersion);
      setOutput(normalizeOutput(response, 'Rollback completed successfully.'));
      // reload files
      await loadFiles(datasetName);
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
    if (!selectedDataset || !fileName) return;
    setFileToDelete(fileName);
    setShowDeleteModal(true);
  };

  const handlePerformDeleteFile = async () => {
    const fileName = fileToDelete;
    if (!selectedDataset || !fileName) return;
    setShowDeleteModal(false);
    setLoading(true);
    try {
      const response = await deleteFile(selectedDataset, fileName);
      await loadFiles(selectedDataset);
      setOutput(normalizeOutput(response, 'File deleted successfully.'));
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

  return (
    <VersioningPanel
      data={datasetData}
      datasets={datasets}
      selectedDataset={selectedDataset}
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
    />
  );
}
