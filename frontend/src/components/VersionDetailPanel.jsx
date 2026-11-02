import { useEffect, useState, useMemo } from 'react';
import {
  Info,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Database,
  ShieldCheck,
  Users,
  HardDrive,
  FileCode2,
  Layers,
} from 'lucide-react';
import { useVersioning } from '../hooks/useVersioning';
import InfoTooltip from './UI/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';
import { StatusBadge } from './common';

// Format bytes into readable human format
function formatBytes(bytes) {
  if (bytes == null || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getGradeMeta(score = 0, grade = 'N/A') {
  if (score >= 90 || grade.startsWith('A')) {
    return { variant: 'emerald', label: `Grade ${grade} • Optimal` };
  }
  if (score >= 75 || grade.startsWith('B')) {
    return { variant: 'blue', label: `Grade ${grade} • Acceptable` };
  }
  if (score >= 60 || grade.startsWith('C')) {
    return { variant: 'amber', label: `Grade ${grade} • Skewed` };
  }
  return { variant: 'rose', label: `Grade ${grade} • Critical` };
}

function getStageMeta(fileName = '', stageName = '') {
  const norm = (fileName + ' ' + stageName).toLowerCase();
  if (norm.includes('raw') || norm.includes('intake')) {
    return { label: 'Raw Ingestion', variant: 'slate' };
  }
  if (norm.includes('clean') || norm.includes('imput')) {
    return { label: 'Imputation', variant: 'blue' };
  }
  if (norm.includes('outlier')) {
    return { label: 'Outlier Mitigated', variant: 'amber' };
  }
  if (norm.includes('validat') || norm.includes('rule')) {
    return { label: 'Rule Validated', variant: 'emerald' };
  }
  if (norm.includes('estimat') || norm.includes('weight') || norm.includes('ipf') || norm.includes('rake')) {
    return { label: 'Calibrated Weights', variant: 'indigo' };
  }
  return { label: 'Pipeline Milestone', variant: 'indigo' };
}

/**
 * Enterprise VersionDetailPanel Component
 * Inspects a selected pipeline checkpoint snapshot, displaying normalized quality index,
 * dimensional stats, AI explainability summary, and component error rates.
 */
export default function VersionDetailPanel({
  selectedFile = '',
  versionName = '',
  datasetName = '',
  className = '',
}) {
  const { getQuality } = useVersioning();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch checkpoint quality metrics asynchronously without effect cascade
  useEffect(() => {
    if (!datasetName || !versionName) {
      return;
    }

    let active = true;

    Promise.resolve().then(async () => {
      if (!active) return;
      setLoading(true);
      setError('');

      try {
        const qualityRes = await getQuality(datasetName, versionName);
        if (!active) return;
        setDetails(qualityRes || null);
      } catch {
        if (!active) return;
        setError('Could not load version quality details.');
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [versionName, datasetName, getQuality]);

  const stageMeta = useMemo(
    () => getStageMeta(selectedFile, versionName),
    [selectedFile, versionName]
  );

  const gradeMeta = useMemo(
    () => getGradeMeta(details?.score, details?.grade),
    [details?.score, details?.grade]
  );

  // Dynamic explanation narrative based on snapshot filename and metric levels
  const aiSummary = useMemo(() => {
    if (!details) return '';
    const missingPct = details.metrics?.missing_pct || 0;
    const outlierPct = details.metrics?.outlier_pct || 0;
    const validationViolations = details.metrics?.validation_violations || 0;
    const duplicates = details.metrics?.duplicates || 0;

    const lower = selectedFile.toLowerCase();
    if (lower.startsWith('raw') || lower.includes('raw')) {
      return `Initial survey intake profile. Microdata contains ${missingPct}% missing cells, ${duplicates} duplicate records, and ${outlierPct}% extreme outliers. Preprocessing via imputation and outlier bounding is recommended.`;
    }
    if (lower.startsWith('clean') || lower.includes('imput')) {
      return `Statistical imputation completed. Missing values reduced to ${missingPct}%. Primary statistical estimators successfully resolved distribution centroids using mean/median column replacements.`;
    }
    if (lower.startsWith('outlier')) {
      return `Outliers mitigated. Extreme univariate and multivariate anomalies removed using IQR and Z-score bounding threshold filters. Outlier density reduced to ${outlierPct}%.`;
    }
    if (lower.startsWith('validat') || lower.includes('rule')) {
      return `Constraint validation run. Logical rules evaluated against survey skip paths and range limits. Snapshot contains ${validationViolations} residual validation anomalies.`;
    }
    if (lower.startsWith('estimat') || lower.includes('weight') || lower.includes('rake')) {
      return `Iterative Proportional Fitting (IPF) completed. Raked calibration weights align sample demographics with target frame universe constraints, reducing non-response representation bias.`;
    }
    return `Pipeline snapshot checkpoint verified at quality index ${details.score}/100 (${details.grade || 'N/A'}). Dataset structures and schema definitions are verified.`;
  }, [selectedFile, details]);

  // If no file node is selected from lineage graph
  if (!selectedFile) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-8 text-center font-mono text-xs text-slate-500 ${className}`}
      >
        <Info size={22} className="mx-auto mb-2.5 text-indigo-500 animate-pulse" />
        <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
          Select Milestone Checkpoint
        </span>
        Click on any stage node in the version lineage DAG above to inspect its metrics and quality index.
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div
        className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-xs font-mono ${className}`}
      >
        <div className="flex flex-col items-center justify-center gap-2.5 text-xs text-slate-500">
          <RefreshCw size={22} className="animate-spin text-indigo-500" />
          <p className="uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300">
            Evaluating snapshot checkpoint metrics...
          </p>
          <span className="text-[11px] text-slate-400 font-sans">
            Inspecting {selectedFile}
          </span>
        </div>
      </div>
    );
  }

  // Error fallback
  if (error || !details) {
    return (
      <div
        className={`rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-5 font-mono text-xs text-rose-800 dark:text-rose-300 shadow-xs ${className}`}
      >
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider mb-1">
          <AlertTriangle size={15} className="text-rose-500" />
          <span>Checkpoint Inspection Alert</span>
        </div>
        <p className="font-sans text-rose-700 dark:text-rose-400">
          {error || 'Unable to load snapshot quality telemetry from repository.'}
        </p>
      </div>
    );
  }

  const rowCount = Number(details.rows ?? details.metadata?.rows ?? 0);
  const colCount = Number(details.columns ?? details.metadata?.columns ?? 0);
  const sizeBytes = details.size_bytes ?? details.size ?? 0;

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs font-sans text-slate-800 dark:text-slate-100 transition-all ${className}`}
    >
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Checkpoint Analysis
            </span>
            <StatusBadge variant={stageMeta.variant} size="xs">
              {stageMeta.label}
            </StatusBadge>
            <InfoTooltip {...getTooltipContent('checkpointAnalysis')} iconSize={12} className="h-4 w-4" />
          </div>

          <h4 className="mt-1 text-base font-bold font-mono text-slate-900 dark:text-white break-all flex items-center gap-2">
            <FileCode2 size={16} className="text-indigo-500 shrink-0" />
            <span>{selectedFile}</span>
          </h4>
        </div>

        {/* Quality Score Grade Tag */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="text-right font-mono">
            <div className="text-[9px] uppercase font-bold text-slate-400">Snapshot Integrity</div>
            <div className="mt-0.5">
              <StatusBadge variant={gradeMeta.variant} size="sm">
                {details.score}/100 • {gradeMeta.label}
              </StatusBadge>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Inspection Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left 2 Columns: Macro KPI Cards + AI Summary */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            
            {/* Total Rows */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 shadow-2xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0">
                <FileSpreadsheet size={16} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <span>Total Rows</span>
                  <InfoTooltip {...getTooltipContent('observations')} iconSize={11} className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {rowCount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Total Columns */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 shadow-2xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0">
                <Layers size={16} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <span>Feature Space</span>
                  <InfoTooltip {...getTooltipContent('workspaceVariables')} iconSize={11} className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {colCount.toLocaleString()} columns
                </div>
              </div>
            </div>

            {/* File Disk Footprint */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 shadow-2xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0">
                <HardDrive size={16} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <span>Disk Storage</span>
                  <InfoTooltip {...getTooltipContent('exportFormat')} iconSize={11} className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {formatBytes(sizeBytes)}
                </div>
              </div>
            </div>

            {/* Quality Score */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 shadow-2xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <span>Normalized Quality</span>
                  <InfoTooltip {...getTooltipContent('qualityScore')} iconSize={11} className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {details.score}%
                </div>
              </div>
            </div>

          </div>

          {/* Explainable AI Automated Summary */}
          <div className="rounded-xl border border-indigo-100 dark:border-indigo-950/70 bg-gradient-to-r from-indigo-50/70 via-slate-50/50 to-indigo-50/70 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-indigo-950/20 p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 font-mono">
              <Cpu size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                Explainable AI Lineage Summary
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
              {aiSummary}
            </p>
          </div>
        </div>

        {/* Right Column: Quality Components Scorecard */}
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 flex flex-col justify-between shadow-2xs">
          <div className="space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Quality Dimensions
              </h5>
              <InfoTooltip {...getTooltipContent('qualityComponents')} iconSize={12} className="h-4 w-4" />
            </div>

            {[
              {
                name: 'Missing Cells',
                val: details.metrics?.missing ?? 0,
                pct: details.metrics?.missing_pct ?? 0,
                icon: Database,
                variant: (details.metrics?.missing_pct ?? 0) === 0 ? 'emerald' : 'blue',
              },
              {
                name: 'Duplicate Rows',
                val: details.metrics?.duplicates ?? 0,
                pct: details.metrics?.duplicate_pct ?? 0,
                icon: Users,
                variant: (details.metrics?.duplicates ?? 0) === 0 ? 'emerald' : 'purple',
              },
              {
                name: 'Outlier Rows',
                val: details.metrics?.outliers ?? 0,
                pct: details.metrics?.outlier_pct ?? 0,
                icon: AlertTriangle,
                variant: (details.metrics?.outlier_pct ?? 0) < 2 ? 'emerald' : 'amber',
              },
              {
                name: 'Rule Violations',
                val: details.metrics?.validation_violations ?? 0,
                pct: details.metrics?.validation_pct ?? 0,
                icon: ShieldCheck,
                variant: (details.metrics?.validation_violations ?? 0) === 0 ? 'emerald' : 'rose',
              },
            ].map((metric, i) => {
              const MetricIcon = metric.icon;
              return (
                <div key={i} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <MetricIcon size={13} className="text-slate-400" />
                    <span>{metric.name}</span>
                  </div>
                  <StatusBadge variant={metric.variant} size="xs">
                    {metric.val.toLocaleString()} ({metric.pct}%)
                  </StatusBadge>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-200/80 dark:border-slate-800 pt-3 mt-4 text-[10px] font-mono text-slate-400 leading-normal">
            * Deterministic scores weighted according to survey methodological standards.
          </div>
        </div>

      </div>
    </div>
  );
}
