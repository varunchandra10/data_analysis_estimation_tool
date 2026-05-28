import { useState } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { exportDataset as apiExportDataset, archiveOldVersions as apiArchiveOldVersions } from '../services/api/versioning.api';

export function useExport() {
  const { projectId } = useProjectContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const exportData = async (filePath, datasetName, format) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiExportDataset(filePath, datasetName, format, projectId);
      return response;
    } catch (err) {
      setError(err.message || 'Export failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const archiveOldVersions = async (keepLatest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiArchiveOldVersions(keepLatest, projectId);
      return response;
    } catch (err) {
      setError(err.message || 'Archiving failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    exportData,
    archiveOldVersions
  };
}
