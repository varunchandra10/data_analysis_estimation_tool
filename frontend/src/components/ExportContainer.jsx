import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Database,
  ArrowRight,
  Sparkles,
  HardDrive,
  FileCheck2,
  Clock,
  Layers,
} from 'lucide-react';
import { useExport } from '../hooks/useExport';
import { useDataset } from '../hooks/useDataset';
import ExportPanel from './ExportPanel';
import { StatusBadge } from './common';

function filenameFromPath(path, fallback = 'dataset') {
  if (!path) return fallback;
  const name = path.split(/[\\/]/).pop() || fallback;
  return name.replace(/\.[^.]+$/, '');
}

/**
 * Enterprise ExportContainer Component
 * Orchestrator managing data serialization, format streaming,
 * download triggers, and historical snapshot archival with empty state handling.
 */
export default function ExportContainer({ className = '' }) {
  const navigate = useNavigate();
  const { datasetData } = useDataset();
  const { exportData, archiveOldVersions } = useExport();

  const [loading, setLoading] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [lastExport, setLastExport] = useState(null);

  const sourcePath =
    datasetData?.metadata?.file_path ||
    datasetData?.metadata?.filePath ||
    datasetData?.file_path ||
    '';

  const datasetName =
    datasetData?.metadata?.dataset_name ||
    datasetData?.metadata?.filename?.replace(/\.[^.]+$/, '') ||
    datasetData?.dataset_name ||
    'dataset';

  const handleExport = async (format) => {
    if (!sourcePath) {
      setError('No active dataset file path available. Please re-select or load a dataset.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await exportData(sourcePath, datasetName, format);

      // Resolve content type fallback based on requested format
      const mimeTypes = {
        csv: 'text/csv;charset=utf-8;',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        zip: 'application/zip',
        encrypted_zip: 'application/octet-stream',
      };

      const resolvedType = response?.headers?.['content-type'] || mimeTypes[format] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: resolvedType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      const baseName = filenameFromPath(sourcePath, datasetName);
      const ext = format === 'encrypted_zip' ? 'zip.enc' : format;
      link.download = `${baseName}.${ext}`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastExport({ format: format.toUpperCase(), time: timestamp });
      setMessage(`Successfully streamed and downloaded ${baseName}.${ext} (${format.toUpperCase()}).`);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.details?.detail ||
        err?.message ||
        'Failed to export dataset. Please check backend service status.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (keepLatest) => {
    setArchiveLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await archiveOldVersions(keepLatest);
      const archivedCount =
        response?.data?.archived_paths?.length ??
        response?.archived_paths?.length ??
        0;

      setMessage(
        archivedCount > 0
          ? `Successfully archived ${archivedCount} older version snapshot${archivedCount === 1 ? '' : 's'}. Live milestone registry updated.`
          : `Storage optimization check completed: no versions exceeded the retention threshold of ${keepLatest}.`
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.details?.detail ||
        err?.message ||
        'Failed to archive older versions.'
      );
    } finally {
      setArchiveLoading(false);
    }
  };

  // If no dataset is loaded, render enterprise empty state instead of null
  if (!datasetData || !sourcePath) {
    return (
      <section
        className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs font-sans text-slate-800 dark:text-slate-100 transition-all ${className}`}
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Data Lineage & Storage
              </span>
              <StatusBadge variant="slate" size="xs">
                Awaiting Dataset
              </StatusBadge>
            </div>
            <h3 className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
              Enterprise Export & Snapshot Archival
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Multi-format streaming export (CSV, XLSX, ZIP, Encrypted Vault) and milestone storage retention management.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-xs mb-4">
            <Download size={26} />
          </div>
          <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
            No Active Dataset in Pipeline Buffer
          </h4>
          <p className="mt-2 max-w-md text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            To export microdata or archive version snapshots, select or ingest a survey dataset via the Dataset Explorer.
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

  return (
    <div className={`space-y-4 ${className}`}>
      <ExportPanel
        datasetData={datasetData}
        loading={loading}
        archiveLoading={archiveLoading}
        error={error}
        message={message}
        onExport={handleExport}
        onArchive={handleArchive}
      />

      {/* Telemetry Footer Status */}
      {lastExport && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <FileCheck2 size={13} className="text-emerald-500" />
            <span>Recent Session Export:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{lastExport.format}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock size={12} />
            <span>{lastExport.time}</span>
          </div>
        </div>
      )}
    </div>
  );
}
