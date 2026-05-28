import { useMemo } from 'react';
import {
  FolderKey,
  FileSpreadsheet,
  Layers3,
  Trash2,
  RefreshCw,
  Archive,
  Eye,
  BarChart3,
  AlertTriangle,
  Binary,
  ChevronRight,
  Database,
  RotateCcw,
  CheckCircle2,
  XCircle
} from "lucide-react";
import VersionLineageGraph from './VersionLineageGraph';
import VersionDetailPanel from './VersionDetailPanel';
import InfoTooltip from './UI/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';

const STAGE_LABELS = {
  raw: 'Raw',
  clean: 'Clean',
  cleaned: 'Clean',
  outlier: 'Outlier',
  outlier_detected: 'Outlier',
  validation: 'Validation',
  validated: 'Validation',
  estimation: 'Estimation',
  estimated: 'Estimation',
};

function VersioningPanel({
  data,
  datasets = [],
  selectedDataset,
  setSelectedDataset,
  selectedFile,
  setSelectedFile,
  selectedFilePath,
  setSelectedFilePath,
  datasetFiles = [],
  output,
  loading,
  showDeleteModal,
  fileToDelete,
  onRefresh,
  onCompress,
  onPreview,
  onRestoreV2,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel
}) {
  const currentDatasetName = useMemo(() => {
    return data?.metadata?.dataset_name || data?.metadata?.filename?.replace(/\.[^.]+$/, '') || '';
  }, [data]);

  const selectedFolder = useMemo(() => {
    return datasets.find((item) => item.dataset_name === selectedDataset) || null;
  }, [datasets, selectedDataset]);

  const stageChain = useMemo(() => {
    return datasetFiles.map((file) => file.stage || file.file_name.split('_', 1)[0]);
  }, [datasetFiles]);


  return (
    <div className="space-y-6 antialiased text-slate-200 font-sans max-w-[1600px] mx-auto pb-12 px-4 sm:px-6 selection:bg-slate-800">

      {/* ===================================================== */}
      {/* 1. MAIN SYSTEM VERSIONING CONTROLLER HEADER */}
      {/* ===================================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between rounded-xl border-2 border-slate-800/80 bg-[#0f172a] p-5 shadow-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md shrink-0">
            <Layers3 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Workspace v4.2</p>
            </div>
            <h3 className="text-sm font-bold tracking-tight text-slate-200 uppercase font-mono mt-0.5">
              Active Project Checkpoint: <span className="text-indigo-400 font-sans normal-case tracking-normal pl-0.5">{currentDatasetName || 'No dataset loaded yet'}</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Reload-safe snapshot states array mapping repository</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            className="flex items-center gap-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/60 px-3 py-1.5 text-xs font-bold uppercase text-slate-200 tracking-wide transition-colors font-mono disabled:opacity-40"
            disabled={loading}
            onClick={onRefresh}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh Folders
          </button>
          <InfoTooltip {...getTooltipContent('refreshFolders')} iconSize={12} className="h-5 w-5 self-center" />
          <button
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-bold uppercase text-white tracking-wide transition-colors shadow-md font-mono disabled:opacity-40"
            disabled={loading || !selectedDataset}
            onClick={onCompress}
          >
            <Archive size={13} /> Compress Folder
          </button>
          <InfoTooltip {...getTooltipContent('compressFolder')} iconSize={12} className="h-5 w-5 self-center" />
        </div>
      </div>

      {/* Visual Pipeline Stage Flow & Inspect details */}
      {selectedDataset && datasetFiles.length > 0 && (() => {
        const selectedFileObj = datasetFiles.find(f => f.file_name === selectedFile);
        const selectedVersionName = selectedFileObj ? (selectedFileObj.version || selectedFileObj.stage) : '';
        return (
          <div className="grid min-w-0 gap-6">
            <VersionLineageGraph
              datasetFiles={datasetFiles}
              selectedFile={selectedFile}
              onSelectFile={(file) => {
                setSelectedFile(file.file_name);
                setSelectedFilePath(file.file_path);
              }}
              activeVersionName={data?.metadata?.filename?.replace(/\.[^.]+$/, '') || ''}
              datasetName={selectedDataset}
              onRollbackComplete={() => {
                onRefresh();
              }}
            />
            <VersionDetailPanel
              selectedFile={selectedFile}
              versionName={selectedVersionName}
              datasetName={selectedDataset}
            />
          </div>
        );
      })()}

      {/* ===================================================== */}
      {/* 2. DUAL COLUMN CONTROL GRID WORKBENCH */}
      {/* ===================================================== */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">

        {/* LEFT COLUMN PANEL: FOLDERS TRACK TREE */}
        <div className="lg:col-span-4 rounded-xl border-2 border-slate-800/80 bg-[#0f172a] p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-900">
            <FolderKey size={14} className="text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Dataset Repositories</h3>
            <InfoTooltip {...getTooltipContent('repositories')} iconSize={12} className="h-4 w-4" />
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
            {datasets.map((item) => (
              <button
                key={item.dataset_name}
                className={`w-full rounded-lg border-2 p-3.5 text-left text-xs transition-all duration-150 relative ${selectedDataset === item.dataset_name
                  ? 'border-indigo-500 bg-[#0b1329] text-slate-200 ring-1 ring-indigo-500/20 shadow-md'
                  : 'border-slate-900 bg-[#0b1329]/20 text-slate-400 hover:border-slate-800 hover:bg-slate-950/20'
                  }`}
                onClick={() => setSelectedDataset(item.dataset_name)}
              >
                <div className="flex items-center gap-1 font-bold text-slate-200 truncate font-sans text-sm tracking-tight">
                  <span className="truncate">{item.dataset_name}</span>
                  <InfoTooltip title="Repository" description="Container folder for all staged outputs of this dataset." recommendation="Select one to inspect lineage, compare versions, or restore prior states." iconSize={12} className="h-4 w-4 shrink-0" />
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wide bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-slate-500">
                  <Binary size={10} className="text-indigo-400/60" />
                  {(item.files || []).length} Stage Vector{(item.files || []).length === 1 ? '' : 's'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN PANEL: CHRONOLOGICAL STAGE FILE SEGMENTS */}
        <div className="lg:col-span-8 rounded-xl border-2 border-slate-800/80 bg-[#0f172a] p-5 shadow-xl">

          {/* TRACK LAB HEADER */}
          <div className="mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={14} className="text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">Processing Checkpoint Buffer</h3>
                <InfoTooltip {...getTooltipContent('checkpointBuffer')} iconSize={12} className="h-4 w-4" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Sequential serialization frames from target workspace context paths</p>
            </div>
            <div className="max-w-xs self-start">
              <span className="inline-block rounded bg-slate-950 border border-slate-900/60 px-2.5 py-1 font-mono text-[10px] text-slate-500 break-all shadow-inner">
                {selectedFolder?.folder_path || 'NO_BUFFER_PATH_SELECTED'}
              </span>
            </div>
          </div>

          {/* PIPELINE STAGE PIPELINE PIPES */}
          {stageChain.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-1.5 bg-slate-950/30 p-3 rounded-lg border border-slate-900/60 shadow-inner">
              {stageChain.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="rounded border border-indigo-500/20 bg-[#0b1329] px-2 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wider text-indigo-400">
                    {STAGE_LABELS[stage] || stage}
                  </span>
                  {idx < stageChain.length - 1 && (
                    <ChevronRight size={12} className="text-slate-700 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* IMMUTABLE DATA CHECKPOINT LIST FILE GRID */}
          <div className="grid gap-3 sm:grid-cols-2">
            {datasetFiles.map((file) => (
              <div
                key={file.file_name}
                onClick={() => { setSelectedFile(file.file_name); setSelectedFilePath(file.file_path); }}
                className={`group flex items-center justify-between rounded-lg border-2 p-3 text-xs cursor-pointer transition-all min-w-0 ${selectedFile === file.file_name
                  ? 'border-emerald-500 bg-[#0b1329] shadow-inner'
                  : 'border-slate-900 bg-[#0b1329]/10 hover:border-slate-800'
                  }`}
              >
                <div className="text-left pr-2 overflow-hidden min-w-0 flex-1">
                  <div className="font-mono text-[11px] font-semibold text-slate-300 break-all truncate leading-relaxed">{file.file_name}</div>
                  <div className="mt-1.5 inline-block text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-sm">
                    Stage: {STAGE_LABELS[file.stage] || file.stage}
                  </div>
                </div>
                <div className="pl-2 shrink-0">
                  <button
                    aria-label="Delete dataset step from disk ledger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(file.file_name);
                    }}
                    className="p-1.5 rounded text-slate-600 hover:text-rose-400 border border-transparent hover:border-slate-800 hover:bg-slate-950 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                  <InfoTooltip {...getTooltipContent('deleteStage')} iconSize={12} className="mt-2 h-4 w-4" />
                </div>
              </div>
            ))}
          </div>

          {/* WORKBENCH BOTTOM OPERATION DEEP ACTION PANEL */}
          <div className="mt-6 flex flex-wrap gap-2.5 border-t border-slate-900 pt-4">
            <button
              className="flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/60 px-4 py-2 text-xs font-bold uppercase text-slate-200 tracking-wide transition-colors font-mono disabled:opacity-40"
              disabled={loading || !selectedDataset || !selectedFile}
              onClick={() => onPreview('preview')}
            >
              <Eye size={13} /> Preview
            </button>
            <InfoTooltip {...getTooltipContent('preview')} iconSize={12} className="h-5 w-5 self-center" />
            <button
              className="flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/60 px-4 py-2 text-xs font-bold uppercase text-slate-200 tracking-wide transition-colors font-mono disabled:opacity-40"
              disabled={loading || !selectedDataset || !selectedFile}
              onClick={() => onPreview('dataset_viewer')}
            >
              <Database size={13} /> Dataset
            </button>
            <InfoTooltip {...getTooltipContent('datasetView')} iconSize={12} className="h-5 w-5 self-center" />
            <button
              className="flex items-center gap-1.5 rounded bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold uppercase text-white tracking-wide transition-colors shadow-md font-mono disabled:opacity-40 ml-auto"
              disabled={loading || !selectedDataset || !selectedFile}
              onClick={() => onPreview('analytics')}
            >
              <BarChart3 size={13} /> Analytics
            </button>
            <InfoTooltip {...getTooltipContent('analyticsView')} iconSize={12} className="h-5 w-5 self-center" />
            <button
              className="flex items-center gap-1.5 rounded bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-bold uppercase text-white tracking-wide transition-colors shadow-md font-mono disabled:opacity-40"
              disabled={loading || !(selectedDataset || currentDatasetName)}
              onClick={onRestoreV2}
              data-testid="rollback-btn"
            >
              <RotateCcw size={13} /> Restore V2
            </button>
            <InfoTooltip {...getTooltipContent('rollback')} iconSize={12} className="h-5 w-5 self-center" />
          </div>

        </div>
      </div>

      {/* ===================================================== */}
      {/* 3. CONFIRMATION DELETION MODAL LAYER */}
      {/* ===================================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onDeleteCancel} />
          <div className="relative w-full max-w-md rounded-xl bg-[#0f172a] border-2 border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
              <AlertTriangle size={18} />
            </div>
            <h4 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-tight">Confirm Deletion</h4>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed font-sans">
              Are you sure you want to purge <span className="font-mono text-rose-400 font-bold bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded break-all">{fileToDelete}</span> from repository ledger <span className="font-semibold text-slate-300 font-mono bg-slate-950 border border-slate-900/60 px-1 py-0.5 rounded">{selectedDataset}</span>? This structural state file will be purged from the disk permanently.
            </p>
            <div className="mt-6 flex justify-end gap-2.5 font-mono text-[11px]">
              <button onClick={onDeleteCancel} className="rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-3.5 py-2 font-bold uppercase transition-colors">Cancel</button>
              <button onClick={onDeleteConfirm} className="rounded bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 font-bold uppercase transition-colors shadow-md">Delete File</button>
            </div>
          </div>
        </div>
      )}
      {/* ===================================================== */}
      {/* 4. OPERATION OUTPUT STATUS CALLOUT */}
      {/* ===================================================== */}
      {output && (
        <div
          data-testid="versioning-output-banner"
          className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${output.success
            ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
            : 'border-rose-500/30 bg-rose-500/5 text-rose-300'
            }`}
        >
          {output.success
            ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
            : <XCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
          }
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider font-mono">
              {output.success ? 'Operation Successful' : 'Operation Failed'}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed opacity-80">
              {output.message || (output.success ? 'Checkpoint restored successfully.' : 'An error occurred.')}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default VersioningPanel;
