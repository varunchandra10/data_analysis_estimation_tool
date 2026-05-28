import React, { useEffect, useState, useMemo } from 'react';
import { useDataset } from '../hooks/useDataset';
import { useVersioning } from '../hooks/useVersioning';
import { useProjectContext } from '../context/ProjectContext';
import DatasetComparison from './DatasetComparison';

const DEFAULT_PAIR_BUILDERS = [
  {
    label: 'RAW vs PREPROCESSED',
    resolve: (items) => {
      const raw = items.find((item) => /_raw$/.test(item.version)) || null;
      const preprocessed = [...items].reverse().find((item) => /_preprocessed$/.test(item.version)) || null;
      if (!raw || !preprocessed) return null;
      return { left: raw.version, right: preprocessed.version };
    },
  },
  {
    label: 'OUTLIERS vs VALIDATION',
    resolve: (items) => {
      const outliers = [...items].reverse().find((item) => /_outliers$/.test(item.version)) || null;
      const validation = [...items].reverse().find((item) => /_validation$/.test(item.version)) || null;
      if (!outliers || !validation) return null;
      return { left: outliers.version, right: validation.version };
    },
  },
];

export default function DatasetComparisonContainer() {
  const { datasetData } = useDataset();
  const { fetchVersions, compare, loading: hookLoading, error: hookError } = useVersioning();
  const { projectId } = useProjectContext();

  const [versions, setVersions] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const datasetName = useMemo(() => {
    return datasetData?.metadata?.dataset_name || 
           datasetData?.metadata?.filename?.replace(/\.[^.]+$/, '') || 
           '';
  }, [datasetData]);

  const resolvedPairs = useMemo(() => (
    DEFAULT_PAIR_BUILDERS.map((pair) => ({
      label: pair.label,
      versions: pair.resolve(versions),
    }))
  ), [versions]);

  useEffect(() => {
    if (!datasetName || !projectId) {
      setLoading(false);
      return;
    }

    let active = true;

    const loadComparisons = async () => {
      setLoading(true);
      setError('');
      try {
        const versionsList = await fetchVersions(projectId);
        const datasetVersions = (versionsList || []).filter((item) => item.dataset_name === datasetName);
        const nextResults = {};
        const comparisonPairs = DEFAULT_PAIR_BUILDERS.map((pair) => ({
          label: pair.label,
          versions: pair.resolve(datasetVersions),
        }));

        await Promise.all(
          comparisonPairs.map(async (pair) => {
            if (!pair.versions?.left || !pair.versions?.right) {
              nextResults[pair.label] = null;
              return;
            }

            try {
              const compRes = await compare(datasetName, pair.versions.left, pair.versions.right);
              const compData = compRes?.comparison || compRes?.data?.comparison || compRes || null;
              nextResults[pair.label] = compData;
            } catch (pairError) {
              if (pairError.status === 404 || pairError.response?.status === 404) {
                nextResults[pair.label] = null;
                return;
              }
              throw pairError;
            }
          })
        );

        if (!active) return;
        setVersions(datasetVersions);
        setResults(nextResults);
      } catch (requestError) {
        if (!active) return;
        setError(requestError.message || 'Failed to load dataset comparison.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadComparisons();

    return () => {
      active = false;
    };
  }, [datasetName, projectId, fetchVersions, compare]);

  if (!datasetName) {
    return null;
  }

  return (
    <DatasetComparison
      datasetName={datasetName}
      versions={versions}
      results={results}
      loading={loading || hookLoading}
      error={error || hookError}
      defaultPairs={resolvedPairs.filter((pair) => pair.versions).map((pair) => ({
        label: pair.label,
        ...pair.versions,
      }))}
    />
  );
}
