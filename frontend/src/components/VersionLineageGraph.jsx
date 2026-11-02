import React, { useEffect, useState, useMemo } from 'react';
import {
  Database,
  ShieldCheck,
  Scale,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Activity,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useVersioning } from '../hooks/useVersioning';
import InfoTooltip from './UI/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';
import { StatusBadge } from './common';

const STAGE_CONFIGS = {
  raw: {
    label: 'Intake',
    icon: Database,
    variant: 'slate',
    title: 'Raw Data Ingestion',
    colorClass: 'border-slate-300 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-700',
  },
  cleaned: {
    label: 'Imputation',
    icon: Sparkles,
    variant: 'blue',
    title: 'Missing Value Imputation',
    colorClass: 'border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-700',
  },
  outliers: {
    label: 'Outliers',
    icon: AlertTriangle,
    variant: 'amber',
    title: 'Anomaly & Outlier Removal',
    colorClass: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30 hover:border-amber-400 dark:hover:border-amber-700',
  },
  validated: {
    label: 'Validation',
    icon: ShieldCheck,
    variant: 'emerald',
    title: 'Logic Constraint Validation',
    colorClass: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/30 hover:border-emerald-400 dark:hover:border-emerald-700',
  },
  estimated: {
    label: 'Weighting',
    icon: Scale,
    variant: 'indigo',
    title: 'Survey Weight Estimation (IPF)',
    colorClass: 'border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 hover:border-indigo-400 dark:hover:border-indigo-700',
  },
};

const STAGES_LIST = ['raw', 'cleaned', 'outliers', 'validated', 'estimated'];

/**
 * Enterprise VersionLineageGraph Component
 * Visualizes the immutable DAG pipeline progression from raw ingestion to calibrated weights,
 * allowing checkpoint inspection, quality score monitoring, and one-click rollbacks.
 */
export default function VersionLineageGraph({
  datasetFiles = [],
  selectedFile = '',
  onSelectFile,
  activeVersionName = '',
  datasetName = '',
  onRollbackComplete,
  className = '',
}) {
  const { getQuality, rollback } = useVersioning();
  const [qualities, setQualities] = useState({});
  const [rollbackLoading, setRollbackLoading] = useState(null);
  const [rollbackTarget, setRollbackTarget] = useState(null);

  // Batch-fetch quality scores atomically without cascading renders
  useEffect(() => {
    if (!datasetName || datasetFiles.length === 0) return;
    let active = true;

    Promise.resolve().then(async () => {
      const results = {};
      await Promise.all(
        datasetFiles.map(async (file) => {
          const vName = file.version || file.stage;
          try {
            const res = await getQuality(datasetName, vName);
            if (res && res.score != null) {
              results[file.file_name] = res.score;
            }
          } catch {
            // Ignore individual fetch failure
          }
        })
      );

      if (active) {
        setQualities(results);
      }
    });

    return () => {
      active = false;
    };
  }, [datasetFiles, datasetName, getQuality]);

  const handleTriggerRollback = async () => {
    if (!rollbackTarget) return;
    const vName = rollbackTarget.version || rollbackTarget.stage;
    setRollbackLoading(rollbackTarget.file_name);
    try {
      await rollback(datasetName, vName);
      if (onRollbackComplete) {
        onRollbackComplete(vName);
      }
      setRollbackTarget(null);
    } catch (err) {
      alert(err.message || 'Rollback failed.');
    } finally {
      setRollbackLoading(null);
    }
  };

  // Calculate completed stages count
  const completedStagesCount = useMemo(() => {
    return STAGES_LIST.filter((stageName) =>
      datasetFiles.some(
        (f) =>
          (f.stage || f.file_name.split('_', 1)[0]) === stageName ||
          (stageName === 'cleaned' && f.stage === 'clean') ||
          (stageName === 'estimated' && f.stage === 'estimation') ||
          (stageName === 'validated' && f.stage === 'validation') ||
          (stageName === 'outliers' && f.stage === 'outlier')
      )
    ).length;
  }, [datasetFiles]);

  return (
    <div
      className={`w-full min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs font-sans text-slate-800 dark:text-slate-100 transition-all ${className}`}
    >
      {/* 1. Header Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Pipeline Lineage DAG
            </span>
            <StatusBadge variant="indigo" size="xs">
              {completedStagesCount} / {STAGES_LIST.length} Stages Completed
            </StatusBadge>
            <InfoTooltip {...getTooltipContent('versionLineage')} iconSize={12} className="h-4 w-4" />
          </div>

          <h3 className="mt-1 text-base font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
            Sequential Transformation Flow
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-sans">
            Visual progression of data states from Raw Intake to final calibrated weights. Click any stage to inspect.
          </p>
        </div>

        {/* Active Workspace State Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs shrink-0 shadow-2xs">
          <Activity size={13} className="text-emerald-500" />
          <div className="text-left">
            <div className="text-[9px] uppercase font-bold text-slate-400">Active Buffer Node</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400">
              {activeVersionName || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive DAG Node Sequence */}
      <div className="relative flex min-w-0 flex-wrap items-center justify-center gap-4 py-4 px-2 lg:flex-nowrap lg:justify-start lg:gap-3 xl:gap-4 lg:overflow-x-auto custom-scrollbar">
        {STAGES_LIST.map((stageName, idx) => {
          const matchingFile = datasetFiles.find(
            (f) =>
              (f.stage || f.file_name.split('_', 1)[0]) === stageName ||
              (stageName === 'cleaned' && f.stage === 'clean') ||
              (stageName === 'estimated' && f.stage === 'estimation') ||
              (stageName === 'validated' && f.stage === 'validation') ||
              (stageName === 'outliers' && f.stage === 'outlier')
          );

          const stepConfig = STAGE_CONFIGS[stageName] || STAGE_CONFIGS.raw;
          const Icon = stepConfig.icon;
          const isSelected = matchingFile && selectedFile === matchingFile.file_name;
          const isActive =
            matchingFile &&
            activeVersionName === matchingFile.file_name.replace(/\.[^.]+$/, '');
          const score = matchingFile ? qualities[matchingFile.file_name] : null;

          return (
            <React.Fragment key={stageName}>
              {/* Node Card */}
              <div
                onClick={() => matchingFile && onSelectFile && onSelectFile(matchingFile)}
                className={`
                  relative flex w-[min(100%,13rem)] flex-col items-center justify-between border rounded-2xl p-4 transition-all duration-200 select-none font-sans lg:w-44 lg:shrink-0
                  ${
                    matchingFile
                      ? isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 scale-[1.02] shadow-md shadow-indigo-600/10 ring-2 ring-indigo-500/20 cursor-pointer'
                        : `${stepConfig.colorClass} shadow-2xs cursor-pointer`
                      : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                {/* Active Workspace Pulse Badge */}
                {isActive && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-600 text-white items-center justify-center shadow-xs">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  </span>
                )}

                {/* Stage Header Info */}
                <div className="flex flex-col items-center gap-1.5 text-center w-full">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      matchingFile
                        ? isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mt-1">
                    {stepConfig.label}
                  </div>

                  <div className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate w-36 max-w-full">
                    {matchingFile ? matchingFile.file_name : 'Pending Phase'}
                  </div>
                </div>

                {/* Card Sub-Strip */}
                {matchingFile ? (
                  <div className="mt-3.5 w-full border-t border-slate-200/80 dark:border-slate-800/80 pt-2.5 flex items-center justify-between font-mono">
                    <div className="flex flex-col items-start">
                      <span className="text-[8px] uppercase tracking-wide text-slate-400">
                        Score
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          score != null && score >= 90
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : score != null && score >= 75
                            ? 'text-blue-600 dark:text-blue-400'
                            : score != null && score >= 60
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {score != null ? `${score}/100` : '--/100'}
                      </span>
                    </div>

                    {/* Rollback Trigger Button */}
                    {!isActive && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRollbackTarget(matchingFile);
                        }}
                        disabled={rollbackLoading != null}
                        title={`Rollback pipeline state to ${matchingFile.file_name}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 text-slate-500 text-[10px] font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        <RotateCcw
                          size={10}
                          className={rollbackLoading === matchingFile.file_name ? 'animate-spin' : ''}
                        />
                        <span>Rollback</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-3.5 w-full border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 text-center text-[10px] font-mono text-slate-400">
                    Not Ingested
                  </div>
                )}
              </div>

              {/* Connecting DAG Vector Line */}
              {idx < STAGES_LIST.length - 1 && (
                <div className="relative hidden h-0.5 w-8 shrink-0 bg-slate-200 dark:bg-slate-800 lg:block self-center">
                  {matchingFile && (
                    <div className="absolute inset-0 bg-indigo-500/40 dark:bg-indigo-500/50" />
                  )}
                  <ChevronRight
                    size={12}
                    className="absolute -top-1.5 -right-1 text-slate-400 dark:text-slate-600"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 3. Rollback Confirmation Modal */}
      {rollbackTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setRollbackTarget(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 mb-4 shadow-xs">
              <RotateCcw size={20} />
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
              Confirm Pipeline Rollback
            </h4>

            <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Are you sure you want to rollback active memory buffer to{' '}
              <strong className="font-mono text-amber-600 dark:text-amber-400 break-all">
                {rollbackTarget.file_name}
              </strong>
              ? Downstream stages will remain archived in disk storage.
            </p>

            <div className="mt-6 flex justify-end gap-2.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setRollbackTarget(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 font-bold uppercase transition-colors cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerRollback}
                disabled={rollbackLoading != null}
                className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 font-bold uppercase transition-colors shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50"
              >
                {rollbackLoading ? 'Rolling back...' : 'Confirm Rollback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
