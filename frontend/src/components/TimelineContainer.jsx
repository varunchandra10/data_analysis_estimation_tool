import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileClock,
  RefreshCw,
  Database,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useDataset } from '../hooks/useDataset';
import { useVersioning } from '../hooks/useVersioning';
import TimelinePanel from './TimelinePanel';
import { StatusBadge } from './common';

/**
 * Enterprise TimelineContainer Component
 * Orchestrates audit trail ledger retrieval, live refresh polling,
 * pipeline synchronization, and standby state handling.
 */
export default function TimelineContainer({ className = '' }) {
  const navigate = useNavigate();
  const { datasetData } = useDataset();
  const { getTimeline, loading: hookLoading, error: hookError } = useVersioning();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSynchronized, setLastSynchronized] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const datasetName = useMemo(() => {
    return (
      datasetData?.dataset_name ||
      datasetData?.metadata?.dataset_name ||
      datasetData?.metadata?.filename?.replace(/\.[^.]+$/, '') ||
      datasetData?.metadata?.file_path?.split(/[\\/]/).pop()?.replace(/\.[^.]+$/, '') ||
      ''
    );
  }, [datasetData]);

  const pipelineRefreshToken =
    datasetData?.metadata?.pipeline_run_id ||
    datasetData?.metadata?.file_path ||
    '';

  // Fetch audit trail logs
  useEffect(() => {
    if (!datasetName) return;

    let active = true;

    Promise.resolve().then(async () => {
      if (!active) return;
      setLoading(true);
      setError('');

      try {
        const fetchedLogs = await getTimeline(datasetName);
        if (!active) return;
        const ordered = Array.isArray(fetchedLogs) ? [...fetchedLogs].reverse() : [];
        setLogs(ordered);
        setLastSynchronized(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      } catch (err) {
        if (!active) return;
        setError(
          err?.response?.data?.detail ||
          err?.details?.detail ||
          err?.message ||
          'Failed to load audit timeline ledger.'
        );
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [datasetName, pipelineRefreshToken, getTimeline, refreshKey]);

  // Standby Empty State when no dataset is loaded
  if (!datasetData || !datasetName) {
    return (
      <section
        className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs font-sans text-slate-800 dark:text-slate-100 transition-all ${className}`}
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Audit Ledger
              </span>
              <StatusBadge variant="slate" size="xs">
                Awaiting Dataset
              </StatusBadge>
            </div>
            <h3 className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
              Pipeline Audit & Transformation Timeline
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Cryptographic ledger tracking all transformations, imputations, demographic raking passes, and validation enforcements.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-xs mb-4">
            <FileClock size={26} />
          </div>
          <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
            No Active Dataset in Pipeline Buffer
          </h4>
          <p className="mt-2 max-w-md text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            Please ingest a survey dataset or select an active record in Dataset Explorer to view the chronological transformation timeline.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/data/preview')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] px-4 py-2.5 text-xs font-bold font-mono text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <span>Explore Active Datasets</span>
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
    <div className={`space-y-4 ${className}`}>
      
      {/* Live Refresh Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 font-sans shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
            <ShieldCheck size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                Audit Trail Telemetry:
              </span>
              <StatusBadge variant="indigo" size="xs">
                {logs.length > 0 ? `${logs.length} Recorded Steps` : 'Empty Ledger'}
              </StatusBadge>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Dataset: <strong className="text-slate-700 dark:text-slate-300">{datasetName}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setRefreshKey((prev) => prev + 1)}
          disabled={isBusy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <RefreshCw size={12} className={isBusy ? 'animate-spin text-indigo-500' : ''} />
          <span>{isBusy ? 'Syncing...' : 'Sync Ledger'}</span>
        </button>
      </div>

      <TimelinePanel
        datasetName={datasetName}
        logs={logs}
        loading={isBusy}
        error={error || hookError}
        lastSynchronized={lastSynchronized}
      />
    </div>
  );
}
