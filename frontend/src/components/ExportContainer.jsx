import React, { useState } from 'react';
import { useExport } from '../hooks/useExport';
import { useDataset } from '../hooks/useDataset';
import ExportPanel from './ExportPanel';

function filenameFromPath(path, fallback = 'dataset') {
  if (!path) return fallback;
  const name = path.split(/[\\/]/).pop() || fallback;
  return name.replace(/\.[^.]+$/, '');
}

export default function ExportContainer() {
  const { datasetData } = useDataset();
  const { exportData, archiveOldVersions } = useExport();

  const [loading, setLoading] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const sourcePath = datasetData?.metadata?.file_path || datasetData?.metadata?.filePath || '';
  const datasetName = datasetData?.metadata?.dataset_name || datasetData?.metadata?.filename?.replace(/\.[^.]+$/, '') || 'dataset';

  const handleExport = async (format) => {
    if (!sourcePath) {
      setError('No dataset file path is available for export.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await exportData(sourcePath, datasetName, format);
      
      const blob = new Blob([response.data], { type: response.headers?.['content-type'] || 'application/octet-stream' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const baseName = filenameFromPath(sourcePath, datasetName);
      link.download = format === 'encrypted_zip' ? `${baseName}.zip.enc` : `${baseName}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      const label = format.toUpperCase();
      setMessage(`${label} export generated successfully.`);
    } catch (err) {
      setError(err?.details?.detail || err.message || 'Failed to export dataset.');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (keepLatest) => {
    setArchiveLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await archiveOldVersions(keepLatest);
      const archivedCount = response?.data?.archived_paths?.length || response?.archived_paths?.length || 0;
      setMessage(`Archived ${archivedCount} older version${archivedCount === 1 ? '' : 's'}.`);
    } catch (err) {
      setError(err?.details?.detail || err.message || 'Failed to archive old versions.');
    } finally {
      setArchiveLoading(false);
    }
  };

  if (!datasetData) return null;

  return (
    <ExportPanel
      datasetData={datasetData}
      loading={loading}
      archiveLoading={archiveLoading}
      error={error}
      message={message}
      onExport={handleExport}
      onArchive={handleArchive}
    />
  );
}
