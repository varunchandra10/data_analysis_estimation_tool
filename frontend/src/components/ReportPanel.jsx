import { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Layers,
  History,
  FileCheck,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import InfoTooltip from './UI/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';
import { StatusBadge } from './common';

/**
 * Enterprise ReportPanel Component
 * Executive PDF Dossier generator interface embedding pipeline audit trails,
 * Matplotlib differential figures, and cryptographic data lineage.
 */
export default function ReportPanel({
  versionName = 'raw',
  datasetName = 'dataset',
  availableVersions = [],
  onVersionChange,
  loading = false,
  progressStage = '',
  error = '',
  reportPath = '',
  onGenerate,
  generatedAt = '',
  history = [],
  className = '',
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!reportPath) return;
    const fullUrl = reportPath.startsWith('http')
      ? reportPath
      : `${window.location.origin}${reportPath.startsWith('/') ? '' : '/'}${reportPath}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs font-sans text-slate-800 dark:text-slate-100 transition-all ${className}`}
    >
      {/* 1. Header Bar */}
      <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Executive Dossier
            </span>
            <StatusBadge variant={reportPath ? 'emerald' : 'indigo'} size="xs">
              {reportPath ? 'Dossier Compiled' : 'PDF Engine Ready'}
            </StatusBadge>
            <InfoTooltip {...getTooltipContent('report')} iconSize={12} className="h-4 w-4" />
          </div>

          <h3 className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
            Comprehensive Pipeline PDF Report
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Generate publication-ready PDF audit reports compiling statistical data hygiene, demographic weighting
            convergence, outlier diagnostics, and schema consistency.
          </p>
        </div>

        {/* Milestone Version Selector Strip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs shrink-0 shadow-2xs">
          <Layers size={14} className="text-indigo-500" />
          <div className="text-left">
            <div className="text-[9px] uppercase font-bold text-slate-400">Target Snapshot</div>
            {availableVersions.length > 1 ? (
              <select
                value={versionName}
                onChange={(e) => onVersionChange && onVersionChange(e.target.value)}
                disabled={loading}
                className="font-bold text-slate-800 dark:text-slate-200 bg-transparent outline-none cursor-pointer"
              >
                {availableVersions.map((v) => (
                  <option key={v.version} value={v.version} className="bg-white dark:bg-slate-900">
                    {v.version} {v.stage ? `(${v.stage})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {datasetName} <span className="text-indigo-600 dark:text-indigo-400">({versionName})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Notification Error Banner */}
      {error && (
        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-xs font-mono text-rose-800 dark:text-rose-300">
          <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Main Dossier Layout */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        
        {/* Left Column: Dossier Contents Summary */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <FileText size={14} className="text-indigo-500" />
              <span>Embedded Document Sections</span>
            </h4>
            
            <div className="grid gap-2.5 sm:grid-cols-2 text-xs font-mono">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Data Lineage Manifest</strong>
                  <p className="text-[10px] text-slate-400 font-sans">Full DAG trace from raw ingestion to active milestone</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Statistical Imputation</strong>
                  <p className="text-[10px] text-slate-400 font-sans">Missing values before/after comparison curves</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">IPF Weight Convergence</strong>
                  <p className="text-[10px] text-slate-400 font-sans">Kish effective sample size & weighting efficiencies</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Quality Index Matrix</strong>
                  <p className="text-[10px] text-slate-400 font-sans">Normalized 100-point survey reliability grade</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger Row */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onGenerate}
              data-testid="report-generate-btn"
              disabled={loading || !versionName}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/20"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>{progressStage || 'Compiling Dossier...'}</span>
                </>
              ) : (
                <>
                  <Printer size={15} />
                  <span>Generate PDF Dossier</span>
                </>
              )}
            </button>

            <span className="text-xs font-mono text-slate-400">
              Standard: ReportLab Vector Typography + Matplotlib 300DPI
            </span>
          </div>
        </div>

        {/* Right Column: Download Card & History */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
                  <FileCheck size={14} />
                </div>
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
                  Dossier Deliverable
                </h4>
              </div>
              <InfoTooltip {...getTooltipContent('reportDownload')} iconSize={12} className="h-4 w-4" />
            </div>

            {reportPath ? (
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Dossier Compiled Successfully</span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400 font-sans">
                    {generatedAt ? `Compiled at ${generatedAt}` : 'Available for immediate download'}
                  </p>
                </div>

                <div className="space-y-2">
                  <a
                    href={reportPath}
                    data-testid="report-download-link"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download PDF Dossier</span>
                    <ExternalLink size={12} className="opacity-70" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-emerald-500" />
                        <span>Download URL Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Download URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center justify-center text-center p-6 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
                <FileText size={24} className="text-slate-400 mb-2" />
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                  No Active PDF Dossier
                </span>
                <p className="text-[11px] text-slate-400 font-sans mt-1 max-w-[200px]">
                  Click "Generate PDF Dossier" to compile pipeline figures and metrics.
                </p>
              </div>
            )}
          </div>

          {/* Session History Footer */}
          {history.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-[11px] font-mono text-slate-500">
              <div className="flex items-center gap-1.5 mb-2 font-bold text-slate-600 dark:text-slate-400">
                <History size={12} />
                <span>Session Dossiers ({history.length})</span>
              </div>
              <ul className="space-y-1.5 max-h-24 overflow-y-auto">
                {history.map((h, i) => (
                  <li key={i} className="flex items-center justify-between text-[10px] bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                    <span className="truncate max-w-[120px] font-bold text-slate-700 dark:text-slate-300">
                      {h.version}
                    </span>
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Get PDF</span>
                      <ExternalLink size={10} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
