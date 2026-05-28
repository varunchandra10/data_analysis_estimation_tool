import React, { useEffect, useState, useMemo } from 'react';
import { useDataset } from '../hooks/useDataset';
import { useVersioning } from '../hooks/useVersioning';
import QualityScore from './QualityScore';

export default function QualityScoreContainer() {
  const { datasetData } = useDataset();
  const { getQuality, loading: hookLoading, error: hookError } = useVersioning();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const datasetName = useMemo(() => {
    return datasetData?.metadata?.dataset_name || 
           datasetData?.metadata?.filename || 
           datasetData?.metadata?.file_path?.split(/[\\/]/).pop() || 
           '';
  }, [datasetData]);

  const versionName = useMemo(() => {
    return datasetData?.metadata?.current_version || datasetData?.version || datasetData?.metadata?.version || 'raw';
  }, [datasetData]);

  useEffect(() => {
    if (!versionName || !datasetName) {
      setLoading(false);
      return;
    }

    let active = true;

    const loadQuality = async () => {
      setLoading(true);
      setError('');
      try {
        const qualityData = await getQuality(datasetName, versionName);
        if (!active) return;
        setData(qualityData || null);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load quality score.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadQuality();

    return () => {
      active = false;
    };
  }, [datasetName, versionName, getQuality]);

  return (
    <QualityScore
      versionName={versionName}
      loading={loading || hookLoading}
      error={error || hookError}
      data={data}
    />
  );
}
