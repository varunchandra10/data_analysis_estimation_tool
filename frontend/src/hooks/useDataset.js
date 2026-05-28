import { useState } from 'react';
import { useDatasetContext } from '../context/DatasetContext';
import { uploadDataset as apiUploadDataset } from '../services/api/upload.api';
import { cleanMissingValues as apiCleanMissingValues, processDuplicates as apiProcessDuplicates } from '../services/api/cleaning.api';
import { detectOutliers as apiDetectOutliers, applyOutliers as apiApplyOutliers } from '../services/api/outlier.api';
import { getDatasetProfile } from '../services/api/statistics.api';

export function useDataset() {
  const {
    datasetData,
    setDatasetData,
    activeTab,
    setActiveTab,
    analyticsViewData,
    setAnalyticsViewData,
    validationResult,
    setValidationResult,
    estimationResult,
    setEstimationResult,
    outlierResult,
    setOutlierResult,
    duplicateResult,
    setDuplicateResult,
    resetSession
  } = useDatasetContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const uploadRes = await apiUploadDataset(file);
      const uploadData = uploadRes?.data || uploadRes || {};
      const metadata = uploadData.metadata || uploadRes?.metadata || {};
      const file_path = metadata.file_path || uploadData.file_path || uploadData.filePath;
      
      // Fetch profile statistics as part of ingestion pipeline
      let stats = null;
      if (file_path) {
        const profileRes = await getDatasetProfile(file_path);
        stats = profileRes?.data?.stats || profileRes?.stats || null;
      }

      const completedData = {
        metadata: {
          ...metadata,
          filename: metadata.filename || file.name,
          dataset_name: metadata.dataset_name || file.name.replace(/\.[^.]+$/, ''),
          file_path,
          rows: metadata.rows || uploadData.rows || 0,
          columns: metadata.columns || uploadData.columns || 0,
          null_counts: metadata.null_counts || uploadData.missing_counts || {},
          uploaded_at: new Date().toISOString(),
        },
        preview: uploadData.preview || uploadRes?.preview || [],
        schema: uploadData.schema || uploadRes?.schema || [],
        statistics: stats,
      };

      setDatasetData(completedData);
      setAnalyticsViewData(null);
      setActiveTab('overview');
      return completedData;
    } catch (err) {
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cleanMissing = async (strategies) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCleanMissingValues(datasetData.metadata.file_path, strategies);
      setDatasetData((prev) => ({
        ...prev,
        preview: response.preview || prev.preview,
        metadata: {
          ...prev.metadata,
          file_path: response.file_path || prev.metadata.file_path,
          null_counts: response.null_counts || prev.metadata.null_counts,
        },
      }));
      setAnalyticsViewData(null);
      return response;
    } catch (err) {
      setError(err.message || 'Cleaning missing values failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deduplicate = async (strategy) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiProcessDuplicates(datasetData.metadata.file_path, strategy);
      setDuplicateResult(response);
      setDatasetData((prev) => ({
        ...prev,
        preview: response.preview || prev.preview,
        metadata: {
          ...prev.metadata,
          file_path: response.file_path || prev.metadata.file_path,
          rows: response.final_rows ?? prev.metadata.rows,
        },
      }));
      setAnalyticsViewData(null);
      return response;
    } catch (err) {
      setError(err.message || 'Deduplication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const runOutliersDetection = async (column, method) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiDetectOutliers(datasetData.metadata.file_path, column, method);
      setOutlierResult(response);
      return response;
    } catch (err) {
      setError(err.message || 'Outlier detection failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const commitOutliersFilter = async (column, method) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiApplyOutliers(datasetData.metadata.file_path, column, method);
      setOutlierResult(response);
      if (response?.file_path) {
        setAnalyticsViewData(null);
        setDatasetData((prev) => ({
          ...prev,
          preview: response.preview || prev.preview,
          metadata: { ...prev.metadata, file_path: response.file_path },
        }));
      }
      return response;
    } catch (err) {
      setError(err.message || 'Applying outlier filter failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    datasetData,
    setDatasetData,
    activeTab,
    setActiveTab,
    analyticsViewData,
    setAnalyticsViewData,
    validationResult,
    setValidationResult,
    estimationResult,
    setEstimationResult,
    outlierResult,
    setOutlierResult,
    duplicateResult,
    setDuplicateResult,
    loading,
    error,
    upload,
    cleanMissing,
    deduplicate,
    runOutliersDetection,
    commitOutliersFilter,
    resetSession
  };
}
