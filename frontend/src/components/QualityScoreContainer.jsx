import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  RefreshCw,
  Database,
  ArrowRight,
  History,
} from 'lucide-react';
import { useDataset } from '../hooks/useDataset';
import { useVersioning } from '../hooks/useVersioning';
import { useProjectContext } from '../context/ProjectContext';
import QualityScore from './QualityScore';
import { StatusBadge } from './common';

/**
 * Enterprise QualityScoreContainer Component
 * Orchestrates dataset version discovery, milestone switching,
 * on-demand quality recalculation, and standby state handling.
 */
export default function QualityScoreContainer({ className = '' }) {
  const navigate = useNavigate();
  const { datasetData } = useDataset();
  const { fetchVersions, getQuality, loading: hookLoading, error: hookError } = useVersioning();
  const { projectId } = useProjectContext();

  const [availableVersions, setAvailableVersions] = useState([]);
  const [userSelectedVersion, setUserSelectedVersion] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const datasetName = useMemo(() => {
    return (
      datasetData?.metadata?.dataset_name ||
      datasetData?.metadata?.filename?.replace(/\.[^.]+$/, '') ||
      datasetData?.metadata?.file_path?.split(/[\\/]/).pop()?.replace(/\.[^.]+$/, '') ||
      datasetData?.dataset_name ||
      ''
    );
  }, [datasetData]);

  const defaultVersion = useMemo(() => {
    return (
      datasetData?.metadata?.current_version ||
      datasetData?.version ||
      datasetData?.metadata?.version ||
      'raw'
    );
  }, [datasetData]);

  const activeVersionToScore = userSelectedVersion || defaultVersion || 'raw';

  // Discover all milestone versions for this dataset
  useEffect(() => {
    if (!datasetName || !projectId) return;

    let active = true;
    const loadVersionsList = async () => {
      try {
        const versionsList = await fetchVersions(projectId);
        if (!active) return;
        const matching = (versionsList || []).filter(
          (item) => item.dataset_name === datasetName
        );
        setAvailableVersions(matching);
      } catch {
        // Non-fatal, version selector falls back to defaultVersion
      }
    };

    loadVersionsList();
    return () => {
      active = false;
    };
  }, [datasetName, projectId, fetchVersions, refreshKey]);

  // Load quality score for the active selected version
  useEffect(() => {
    if (!datasetName || !activeVersionToScore) return;

    let active = true;

    // Execute via microtask to prevent synchronous effect cascade
    Promise.resolve().then(async () => {
      if (!active) return;
      setLoading(true);
      setError('');

      try {
        const qualityData = await getQuality(datasetName, activeVersionToScore);
        if (!active) return;
        setData(qualityData || null);
      } catch (err) {
        if (!active) return;
        setError(
          err?.response?.data?.detail ||
          err?.details?.detail ||
          err?.message ||
          'Failed to load normalized quality score.'
        );
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [datasetName, activeVersionToScore, getQuality, refreshKey]);

  // Standby Empty State if no dataset is active in memory
  if (!datasetData || !datasetName) {
    return (
      <section
        className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs font-sans text-slate-800 dark:text-slate-100 transition-all ${className}`}
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Data Quality Assurance
              </span>
              <StatusBadge variant="slate" size="xs">
                Awaiting Dataset
              </StatusBadge>
            </div>
            <h3 className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
              Survey Reliability & Quality Score
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Deterministic scoring of survey completeness, uniqueness, outlier frequency, and rule consistency.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-xs mb-4">
            <Award size={26} />
          </div>
          <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
            No Active Survey In Pipeline Buffer
          </h4>
          <p className="mt-2 max-w-md text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            Please ingest a survey dataset or select an existing record in the explorer to generate deterministic data quality indices.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/data/preview')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] px-4 py-2.5 text-xs font-bold font-mono text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <span>Ingest Survey Dataset</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/data/whole-dataset')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 shadow-2xs transition-all cursor-pointer"
            >
              <Database size={14} className="text-indigo-500" />
              <span>Datasheet View</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  const isBusy = loading || hookLoading;

  return (
    <div className={`space-y-3 ${className}`}>
      
      {/* Interactive Milestone Version Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 font-sans shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
            <History size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                Milestone Telemetry:
              </span>
              <StatusBadge variant="indigo" size="xs">
                {availableVersions.length > 0 ? `${availableVersions.length} Milestones` : 'Live Buffer'}
              </StatusBadge>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Dataset: <strong className="text-slate-700 dark:text-slate-300">{datasetName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Milestone Dropdown (when multiple versions exist) */}
          {availableVersions.length > 1 ? (
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Version:</span>
              <select
                value={activeVersionToScore}
                onChange={(e) => setUserSelectedVersion(e.target.value)}
                disabled={isBusy}
                className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:border-indigo-500 shadow-2xs"
              >
                {availableVersions.map((v) => (
                  <option key={v.version} value={v.version}>
                    {v.version} {v.stage ? `(${v.stage})` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              {activeVersionToScore}
            </span>
          )}

          {/* Recalculate Button */}
          <button
            type="button"
            onClick={() => setRefreshKey((prev) => prev + 1)}
            disabled={isBusy}
            title="Recalculate Quality Score"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw size={12} className={isBusy ? 'animate-spin text-indigo-500' : ''} />
            <span>{isBusy ? 'Scoring...' : 'Recalculate'}</span>
          </button>
        </div>
      </div>

      {/* Main Visualizer */}
      <QualityScore
        versionName={activeVersionToScore}
        loading={isBusy}
        error={error || hookError}
        data={data}
      />
    </div>
  );
}
