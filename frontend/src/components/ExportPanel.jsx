import React, { useMemo, useState } from 'react';
import {
  Download,
  Archive,
  Lock,
  FileSpreadsheet,
  FileArchive,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HardDrive,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';
import InfoTooltip from './UI/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';
import { StatusBadge } from './common';

const FORMATS = [
  {
    value: 'csv',
    label: 'CSV Data File',
    ext: '.csv',
    icon: FileText,
    badge: 'Standard',
    badgeVariant: 'slate',
    description: 'Universal RFC 4180 comma-separated values for R, Python, and SQL.',
  },
  {
    value: 'xlsx',
    label: 'Excel Workbook',
    ext: '.xlsx',
    icon: FileSpreadsheet,
    badge: 'Office Ready',
    badgeVariant: 'emerald',
    description: 'Formatted Microsoft Excel spreadsheet with column type headers.',
  },
  {
    value: 'zip',
    label: 'Compressed ZIP',
    ext: '.zip',
    icon: FileArchive,
    badge: 'Lightweight',
    badgeVariant: 'blue',
    description: 'Standard Deflate compression bundle optimized for cloud transfer.',
  },
  {
    value: 'encrypted_zip',
    label: 'Encrypted Vault ZIP',
    ext: '.zip.enc',
    icon: Lock,
    badge: 'AES-256',
    badgeVariant: 'indigo',
    description: 'Encrypted microdata archive for confidential respondent privacy.',
  },
];

/**
 * Enterprise ExportPanel Component
 * Professional dataset exporter supporting multi-format downloads (CSV, XLSX, ZIP, Encrypted ZIP)
 * and version archival retention policies.
 */
export default function ExportPanel({
  datasetData,
  loading = false,
  archiveLoading = false,
  error = '',
  message = '',
  onExport,
  onArchive,
  className = '',
}) {
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [archiveKeepLatest, setArchiveKeepLatest] = useState(2);

  const metadata = datasetData?.metadata || {};
  const datasetName =
    metadata?.dataset_name ||
    metadata?.filename?.replace(/\.[^.]+$/, '') ||
    datasetData?.dataset_name ||
    'dataset';

  const rowCount = Number(metadata?.rows ?? datasetData?.rows ?? datasetData?.preview?.length ?? 0);
  const colCount = Number(metadata?.columns ?? datasetData?.columns ?? datasetData?.schema?.length ?? 0);
  const currentVersion = metadata?.current_version || metadata?.version || datasetData?.version || 'v1';

  const activeFormatObj = useMemo(
    () => FORMATS.find((item) => item.value === selectedFormat) || FORMATS[0],
    [selectedFormat]
  );

  return (
    <section className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs font-sans text-slate-800 dark:text-slate-100 transition-all ${className}`}>
      
      {/* 1. Panel Header Bar */}
      <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Data Lineage & Storage
            </span>
            <StatusBadge variant="indigo" size="xs">
              Live Buffer
            </StatusBadge>
            <InfoTooltip {...getTooltipContent('exportFormat')} iconSize={12} className="h-4 w-4" />
          </div>

          <h3 className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
            Enterprise Export & Snapshot Archival
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Download processed survey microdata in standard analytical formats or compress older pipeline
            snapshots while preserving immutable audit trails.
          </p>
        </div>

        {/* Source Target Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs shrink-0 shadow-2xs">
          <Database size={13} className="text-indigo-500" />
          <div className="text-left">
            <div className="text-[9px] uppercase font-bold text-slate-400">Source Version</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">
              {datasetName} <span className="text-indigo-600 dark:text-indigo-400">({currentVersion})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Notification Feedback Banners */}
      {error && (
        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-xs font-mono text-rose-800 dark:text-rose-300 animate-in fade-in duration-150">
          <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-mono text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-150">
          <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {/* 3. Main Export & Archival Columns */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        
        {/* LEFT COLUMN: MULTI-FORMAT EXPORT */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Output Format:
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {rowCount.toLocaleString()} rows • {colCount} cols
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {FORMATS.map((format) => {
              const Icon = format.icon;
              const isActive = selectedFormat === format.value;

              return (
                <button
                  key={format.value}
                  type="button"
                  onClick={() => setSelectedFormat(format.value)}
                  className={`
                    p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer select-none font-sans
                    ${
                      isActive
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg border ${
                          isActive
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                          {format.label}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          Extension: {format.ext}
                        </span>
                      </div>
                    </div>

                    <StatusBadge variant={format.badgeVariant} size="xs">
                      {format.badge}
                    </StatusBadge>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                    {format.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onExport && onExport(selectedFormat)}
              data-testid="export-btn"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/20"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Synthesizing {activeFormatObj.label}...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download {activeFormatObj.label}</span>
                </>
              )}
            </button>

            <span className="text-xs font-mono text-slate-400">
              Delivered via direct streaming download
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: STORAGE & VERSION ARCHIVAL */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                  <Archive size={14} />
                </div>
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
                  Storage Pruning & Archival
                </h4>
              </div>
              <InfoTooltip {...getTooltipContent('archiveVersions')} iconSize={12} className="h-4 w-4" />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-3">
              Compress historical intermediate versions to save disk storage while retaining active milestones.
              Metadata and lineage DAGs remain fully intact.
            </p>

            {/* Retention Input */}
            <div className="mt-4 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Retain Latest Milestones:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={archiveKeepLatest}
                  onChange={(e) => setArchiveKeepLatest(Math.max(1, Number(e.target.value) || 1))}
                  className="w-20 px-3 py-1.5 text-xs font-mono font-bold rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-slate-500 font-mono">
                  Live versions preserved in active registry
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => onArchive && onArchive(archiveKeepLatest)}
              data-testid="archive-btn"
              disabled={archiveLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-bold font-mono transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {archiveLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin text-amber-500" />
                  <span>Archiving Historical Milestones...</span>
                </>
              ) : (
                <>
                  <HardDrive size={14} className="text-amber-500" />
                  <span>Compress Old Snapshots</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
