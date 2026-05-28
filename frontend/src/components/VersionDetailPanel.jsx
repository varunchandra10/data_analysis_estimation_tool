import React, { useEffect, useState } from 'react';
import {
  Info,
  Calendar,
  TrendingUp,
  ChevronRight,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle,
  Cpu,
  RefreshCw,
  Scale
} from 'lucide-react';
import { useVersioning } from '../hooks/useVersioning';
import InfoTooltip from './UI/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';

export default function VersionDetailPanel({
  selectedFile,
  versionName,
  datasetName
}) {
  const { getQuality, loading: hookLoading } = useVersioning();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!datasetName || !versionName) {
      setDetails(null);
      return;
    }

    let active = true;
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const qualityRes = await getQuality(datasetName, versionName);
        if (!active) return;
        setDetails(qualityRes || null);
      } catch (err) {
        if (!active) return;
        setError('Could not load version quality details.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      active = false;
    };
  }, [versionName, datasetName, getQuality]);

  if (!selectedFile) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/30 p-8 text-center text-slate-500 font-mono text-xs">
        <Info size={20} className="mx-auto mb-2 text-slate-600 animate-pulse" />
        Select a stage node from the pipeline lineage flow above to view inspection metrics.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-8">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-indigo-400" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Loading checkpoint indicators...
          </p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs font-mono text-rose-300">
        {error || 'Failed to inspect selected snapshot.'}
      </div>
    );
  }

  // Format file size
  const formatBytes = (bytes) => {
    if (bytes == null || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const scoreColor = details.score >= 90 ? 'text-emerald-400' : details.score >= 75 ? 'text-blue-400' : details.score >= 60 ? 'text-amber-400' : 'text-rose-400';
  const gradeLabel = details.grade || 'Unknown';

  // Dynamic explanations based on metrics
  const getAISummary = () => {
    const missingPct = details.metrics?.missing_pct || 0;
    const outlierPct = details.metrics?.outlier_pct || 0;
    const validationPct = details.metrics?.validation_pct || 0;
    const duplicatePct = details.metrics?.duplicate_pct || 0;

    if (selectedFile.startsWith('raw')) {
      return `Initial survey intake profile. Data is uncleaned and contains ${missingPct}% missing values, ${outlierPct}% outliers, and ${validationPct}% logic compliance anomalies. Preprocessing is highly recommended.`;
    }
    if (selectedFile.startsWith('cleaned') || selectedFile.startsWith('clean')) {
      return `Imputation stage completed. Missing cells reduced to ${missingPct}%. Primary statistical estimators successfully resolved sample distributions using mean/median column replacement.`;
    }
    if (selectedFile.startsWith('outlier')) {
      return `Outliers mitigated. Extreme univariate and multivariate anomalies removed using IQR and Z-score bounding threshold filters. Outlier density reduced to ${outlierPct}%.`;
    }
    if (selectedFile.startsWith('validated') || selectedFile.startsWith('validation')) {
      return `Constraint validation run. Logical rules evaluated against survey skip paths. Integrity index validated with ${details.metrics?.validation_violations || 0} residual rule violations.`;
    }
    if (selectedFile.startsWith('estimated') || selectedFile.startsWith('weight')) {
      return `Iterative Proportional Fitting (IPF) completed. Weights calculated to align sample demographics with target frame universe constraints. Demographics bias balanced.`;
    }
    return `Analysis pipeline stage check. Integrity score verified at ${details.score}/100. Dataset is clean and ready for analytical queries.`;
  };

  return (
    <div className="w-full min-w-0 rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-xl transition-all duration-200">
      <div className="flex min-w-0 flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-900 pb-4 mb-4">
        <div>
          <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
            Checkpoint Analysis
          </span>
          <span className="ml-2 inline-flex align-middle">
            <InfoTooltip {...getTooltipContent('checkpointAnalysis')} iconSize={12} className="h-4 w-4" />
          </span>
          <h4 className="text-sm font-bold text-slate-100 font-mono mt-2 break-all">
            {selectedFile}
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wide text-slate-500 block font-mono">Snapshot Grade</span>
            <span className={`text-sm font-black uppercase tracking-wider ${scoreColor}`}>
              {details.score}/100 - {gradeLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-6 md:grid-cols-3">
        {/* Metric Cards */}
        <div className="md:col-span-2 min-w-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Total Rows', value: details.rows?.toLocaleString() || '0', icon: FileSpreadsheet, sub: 'Sample Count', tooltipKey: 'observations' },
              { label: 'Total Columns', value: details.columns?.toLocaleString() || '0', icon: Info, sub: 'Feature Space', tooltipKey: 'workspaceVariables' },
              { label: 'File Size', value: formatBytes(details.size_bytes), icon: TrendingUp, sub: 'Disk Space', tooltipKey: 'exportFormat' },
              { label: 'Quality Score', value: `${details.score}%`, icon: CheckCircle, sub: 'Normalized Index', tooltipKey: 'qualityScore' }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-850 bg-slate-900/30 p-3">
                <div className="rounded bg-slate-950 p-2 text-indigo-400 border border-slate-850 shrink-0">
                  <stat.icon size={14} />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium font-mono uppercase tracking-wider">
                    <span>{stat.label}</span>
                    <InfoTooltip {...getTooltipContent(stat.tooltipKey)} iconSize={12} className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Automated Summary */}
          <div className="rounded-lg border border-indigo-500/10 bg-indigo-950/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={14} className="text-indigo-400" />
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-indigo-300">
                Explainable AI Summary
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 font-sans">
              {getAISummary()}
            </p>
          </div>
        </div>

        {/* Quality Components Scorecard */}
        <div className="min-w-0 rounded-lg border border-slate-850 bg-slate-900/30 p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-2">
              Quality Components
            </h5>
            <InfoTooltip {...getTooltipContent('qualityComponents')} iconSize={12} className="h-4 w-4" />

            {[
              { name: 'Missing Cells', val: details.metrics?.missing, pct: details.metrics?.missing_pct, color: 'bg-blue-500/20 text-blue-300 border-blue-500/10' },
              { name: 'Duplicate Rows', val: details.metrics?.duplicates, pct: details.metrics?.duplicate_pct, color: 'bg-teal-500/20 text-teal-300 border-teal-500/10' },
              { name: 'Outlier Rows', val: details.metrics?.outliers, pct: details.metrics?.outlier_pct, color: 'bg-amber-500/20 text-amber-300 border-amber-500/10' },
              { name: 'Rule Violations', val: details.metrics?.validation_violations, pct: details.metrics?.validation_pct, color: 'bg-rose-500/20 text-rose-300 border-rose-500/10' }
            ].map((metric, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">{metric.name}</span>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${metric.color}`}>
                  {metric.val} ({metric.pct}%)
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-900 pt-3 mt-4 text-[9px] font-mono text-slate-500 leading-normal">
            * Higher indices indicate fewer statistical violations.
          </div>
        </div>
      </div>
    </div>
  );
}
