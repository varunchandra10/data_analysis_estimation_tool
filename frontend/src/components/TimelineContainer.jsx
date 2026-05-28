import React, { useEffect, useState, useMemo } from 'react';
import { useDataset } from '../hooks/useDataset';
import { useVersioning } from '../hooks/useVersioning';
import TimelinePanel from './TimelinePanel';

export default function TimelineContainer() {
  const { datasetData } = useDataset();
  const { getTimeline, loading: hookLoading, error: hookError } = useVersioning();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const datasetName = useMemo(() => {
    return datasetData?.metadata?.dataset_name || 
           datasetData?.metadata?.filename || 
           datasetData?.metadata?.file_path?.split(/[\\/]/).pop() || 
           '';
  }, [datasetData]);

  const pipelineRefreshToken = datasetData?.metadata?.pipeline_run_id || datasetData?.metadata?.file_path || '';

  useEffect(() => {
    if (!datasetName) {
      setLoading(false);
      return;
    }

    let active = true;

    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const fetchedLogs = await getTimeline(datasetName);
        if (!active) return;
        const ordered = [...fetchedLogs].reverse();
        setLogs(ordered);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load audit timeline.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchLogs();

    return () => {
      active = false;
    };
  }, [datasetName, pipelineRefreshToken, getTimeline]);

  return (
    <TimelinePanel
      datasetName={datasetName}
      logs={logs}
      loading={loading || hookLoading}
      error={error || hookError}
    />
  );
}
