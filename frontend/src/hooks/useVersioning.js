import { useState, useCallback } from 'react';
import { useVersionContext } from '../context/VersionContext';
import { useProjectContext } from '../context/ProjectContext';
import {
  fetchDatasets as apiFetchDatasets,
  fetchDatasetFiles as apiFetchDatasetFiles,
  deleteDatasetFile,
  previewDatasetFile,
  analyticsDatasetFile,
  compressDatasetFolder as apiCompressDatasetFolder,
  rollbackVersion,
  fetchVersions as apiFetchVersions,
  compareVersions as apiCompareVersions,
  getTimelineLogs,
  getDatasetQuality,
  exportDataset
} from '../services/api/versioning.api';

export function useVersioning() {
  const {
    activeVersion,
    setActiveVersion,
    versionHistory,
    setVersionHistory,
    comparisonState,
    setComparisonState
  } = useVersionContext();
  const { projectId } = useProjectContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDatasetsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetchDatasets();
      const list = response?.data?.datasets || response?.datasets || [];
      setVersionHistory(list);
      return response?.data || response;
    } catch (err) {
      setError(err.message || 'Failed to fetch datasets list');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setVersionHistory]);

  const fetchFiles = useCallback(async (datasetName) => {
    if (!datasetName) return [];
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetchDatasetFiles(datasetName);
      return response?.data?.files || response?.files || [];
    } catch (err) {
      setError(err.message || `Failed to fetch files for ${datasetName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (datasetName, fileName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteDatasetFile(datasetName, fileName);
      return response?.data || response;
    } catch (err) {
      setError(err.message || 'Failed to delete file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const previewFile = useCallback(async (datasetName, fileName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await previewDatasetFile(datasetName, fileName);
      return response?.data || response;
    } catch (err) {
      setError(err.message || 'Failed to preview file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyticsFile = useCallback(async (datasetName, fileName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsDatasetFile(datasetName, fileName);
      return response?.data || response;
    } catch (err) {
      setError(err.message || 'Failed to analyze file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const compressFolder = useCallback(async (datasetName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCompressDatasetFolder(datasetName);
      return response?.data || response;
    } catch (err) {
      setError(err.message || 'Failed to compress folder');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rollback = useCallback(async (datasetName, snapshotName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await rollbackVersion(datasetName, snapshotName);
      return response?.data || response;
    } catch (err) {
      setError(err.message || 'Rollback failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVersions = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetchVersions(projectId);
      return response?.data?.versions || response?.versions || [];
    } catch (err) {
      setError(err.message || 'Failed to fetch versions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const compare = useCallback(async (datasetName, v1, v2) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCompareVersions(datasetName, v1, v2, projectId);
      setComparisonState(response?.data || response);
      return response?.data || response;
    } catch (err) {
      setError(err.message || 'Failed to compare versions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId, setComparisonState]);

  const getTimeline = useCallback(async (datasetName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTimelineLogs(datasetName);
      return response?.logs || response?.data?.logs || [];
    } catch (err) {
      setError(err.message || 'Failed to fetch timeline logs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getQuality = useCallback(async (datasetName, versionName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDatasetQuality(datasetName, versionName, projectId);
      return response?.quality || response?.data?.quality || response;
    } catch (err) {
      setError(err.message || 'Failed to fetch dataset quality score');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return {
    activeVersion,
    setActiveVersion,
    versionHistory,
    setVersionHistory,
    comparisonState,
    setComparisonState,
    loading,
    error,
    fetchDatasetsList,
    fetchFiles,
    deleteFile,
    previewFile,
    analyticsFile,
    compressFolder,
    rollback,
    fetchVersions,
    compare,
    getTimeline,
    getQuality
  };
}
