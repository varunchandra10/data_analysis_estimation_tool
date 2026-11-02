import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitCompare,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
  Database,
  Upload,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

import { useDataset } from '../hooks/useDataset';
import { useVersioning } from '../hooks/useVersioning';
import { useProjectContext } from '../context/ProjectContext';
import DatasetComparison from './DatasetComparison';
import { StatusBadge, FilterButtonGroup } from './common';

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

/**
 * DatasetComparisonContainer
 * State orchestrator for pre-processing differential analysis.
 * Features automated milestone comparisons and an on-demand custom pair selector.
 */
export default function DatasetComparisonContainer() {
  const navigate = useNavigate();
  const { datasetData } = useDataset();
  const { fetchVersions, compare, loading: hookLoading, error: hookError } = useVersioning();
  const { projectId } = useProjectContext();

  const [versions, setVersions] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Custom Comparison States
  const [customLeft, setCustomLeft] = useState('');
  const [customRight, setCustomRight] = useState('');
  const [customResult, setCustomResult] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState('');

  const datasetName = useMemo(() => {
    return (
      datasetData?.metadata?.dataset_name ||
      datasetData?.metadata?.filename?.replace(/\.[^.]+$/, '') ||
      datasetData?.dataset_name ||
      ''
    );
  }, [datasetData]);

  const resolvedPairs = useMemo(() => {
    return DEFAULT_PAIR_BUILDERS.map((pair) => ({
      label: pair.label,
      versions: pair.resolve(versions),
    }));
  }, [versions]);

  const loadComparisons = useCallback(async () => {
    if (!datasetName || !projectId) return;

    setLoading(true);
    setError('');
    try {
      const versionsList = await fetchVersions(projectId);
      const datasetVersions = (versionsList || []).filter(
        (item) => item.dataset_name === datasetName
      );
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

      setVersions(datasetVersions);
      setResults(nextResults);

      // Pre-set custom version selects if available
      if (datasetVersions.length >= 2) {
        if (!customLeft) setCustomLeft(datasetVersions[0]?.version);
        if (!customRight) setCustomRight(datasetVersions[datasetVersions.length - 1]?.version);
      }
    } catch (requestError) {
      setError(requestError.message || 'Failed to load dataset comparison.');
    } finally {
      setLoading(false);
    }
  }, [datasetName, projectId, fetchVersions, compare, customLeft, customRight]);

  useEffect(() => {
    loadComparisons();
  }, [datasetName, projectId]);

  // Execute on-demand custom version comparison
  const handleRunCustomCompare = async () => {
    if (!customLeft || !customRight) {
      setCustomError('Please select both a base version and a target version.');
      return;
    }
    if (customLeft === customRight) {
      setCustomError('Base and Target versions must be different.');
      return;
    }

    setCustomLoading(true);
    setCustomError('');
    try {
      const compRes = await compare(datasetName, customLeft, customRight);
      const compData = compRes?.comparison || compRes?.data?.comparison || compRes || null;
      setCustomResult(compData);
    } catch (err) {
      setCustomError(err.message || 'Failed to compare custom version pair.');
    } finally {
      setCustomLoading(false);
    }
  };

  // 1. Fallback when no dataset is loaded
  if (!datasetName) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/60 mb-4 shadow-2xs">
            <GitCompare size={24} />
          </div>
          <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
            Comparison Engine Idle
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Dataset differential comparisons activate once a dataset is loaded into the project buffer.
          </p>
          <div className="mt-5">
            <button
              onClick={() => navigate('/ingestion')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-mono transition-all cursor-pointer shadow-xs"
            >
              <Upload size={13} />
              <span>Load Dataset</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Combine default pairs with custom pair if calculated
  const activePairs = resolvedPairs
    .filter((pair) => pair.versions)
    .map((pair) => ({
      label: pair.label,
      ...pair.versions,
    }));

  if (customResult && customLeft && customRight) {
    activePairs.unshift({
      label: `CUSTOM: ${customLeft} vs ${customRight}`,
      left: customLeft,
      right: customRight,
    });
    results[`CUSTOM: ${customLeft} vs ${customRight}`] = customResult;
  }

  return (
    <div className="space-y-5">
      {/* Interactive Custom Comparator Toolbar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs font-sans max-w-[1650px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shrink-0">
              <SlidersHorizontal size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Version Pair Selector
                </span>
                <StatusBadge variant="slate" size="xs">
                  On-Demand Diff
                </StatusBadge>
              </div>
              <h4 className="text-xs font-bold font-mono text-slate-900 dark:text-white uppercase mt-0.5">
                Arbitrary Version Comparator
              </h4>
            </div>
          </div>

          {/* Version Dropdowns & Action Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-400 text-[11px]">Base:</span>
              <select
                value={customLeft}
                onChange={(e) => setCustomLeft(e.target.value)}
                disabled={versions.length === 0}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:border-indigo-500"
              >
                {versions.map((v) => (
                  <option key={v.version} value={v.version}>
                    {v.version} ({v.stage || 'stage'})
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight size={14} className="text-slate-400 hidden sm:inline" />

            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-400 text-[11px]">Target:</span>
              <select
                value={customRight}
                onChange={(e) => setCustomRight(e.target.value)}
                disabled={versions.length === 0}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:border-indigo-500"
              >
                {versions.map((v) => (
                  <option key={v.version} value={v.version}>
                    {v.version} ({v.stage || 'stage'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunCustomCompare}
              disabled={customLoading || versions.length < 2}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold font-mono transition-all cursor-pointer shadow-2xs"
            >
              <GitCompare size={13} className={customLoading ? 'animate-spin' : ''} />
              <span>{customLoading ? 'Comparing...' : 'Compare Versions'}</span>
            </button>

            <button
              onClick={loadComparisons}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Refresh version index"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {customError && (
          <div className="mt-3 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-xs font-mono text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle size={14} className="text-rose-500 shrink-0" />
            <span>{customError}</span>
          </div>
        )}
      </div>

      {/* Main DatasetComparison Presentation View */}
      <DatasetComparison
        datasetName={datasetName}
        versions={versions}
        results={results}
        loading={loading || hookLoading}
        error={error || hookError}
        defaultPairs={activePairs}
      />
    </div>
  );
}
