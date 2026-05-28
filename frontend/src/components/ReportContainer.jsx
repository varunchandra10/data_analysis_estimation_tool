import React, { useState } from 'react';
import { useReports } from '../hooks/useReports';
import { useVersionContext } from '../context/VersionContext';
import { useDataset } from '../hooks/useDataset';
import ReportPanel from './ReportPanel';

export default function ReportContainer() {
  const { datasetData } = useDataset();
  const { activeVersion } = useVersionContext();
  const { generate, loading, error: hookError } = useReports();
  const [reportPath, setReportPath] = useState(datasetData?.metadata?.pipeline_report_download_url || '');
  const [error, setError] = useState('');

  const resolvedVersion = activeVersion || datasetData?.metadata?.current_version || datasetData?.version || datasetData?.metadata?.version || 'raw';
  const resolvedDatasetName = datasetData?.dataset_name || datasetData?.metadata?.dataset_name || datasetData?.metadata?.filename?.replace(/\.[^.]+$/, '') || 'dataset';

  React.useEffect(() => {
    setReportPath(datasetData?.metadata?.pipeline_report_download_url || '');
  }, [datasetData?.metadata?.pipeline_report_download_url]);

  const handleGenerate = async () => {
    if (!resolvedVersion) {
      setError('No version selected');
      return;
    }
    setReportPath('');
    setError('');
    try {
      const res = await generate(resolvedVersion, resolvedDatasetName);
      const data = res?.data || res;
      setReportPath(data.download_url || '');
    } catch (err) {
      setError(err.message || 'Failed to generate report');
    }
  };

  return (
    <ReportPanel
      versionName={resolvedVersion}
      datasetName={resolvedDatasetName}
      loading={loading}
      error={error || hookError}
      reportPath={reportPath}
      onGenerate={handleGenerate}
    />
  );
}
