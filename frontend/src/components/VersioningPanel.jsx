import { useMemo, useState } from 'react';
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
  ChevronRight,
  Database,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FolderOpen,
  Check,
} from 'lucide-react';
import VersionLineageGraph from './VersionLineageGraph';
import VersionDetailPanel from './VersionDetailPanel';
import InfoTooltip from './UI/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';
import { StatusBadge, SearchInput } from './common';

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

function getStageVariant(stage = '') {
  const norm = stage.toLowerCase();
  if (norm.includes('raw')) return 'slate';
  if (norm.includes('clean')) return 'blue';
  if (norm.includes('outlier')) return 'amber';
  if (norm.includes('validat')) return 'emerald';
  if (norm.includes('estimat') || norm.includes('weight')) return 'indigo';
  return 'slate';
}

/**
 * Enterprise VersioningPanel Component
 * Orchestrates multi-stage survey dataset snapshot repositories, lineage DAGs,
 * rollback controls, and checkpoint inspectors.
 */
function VersioningPanel({
  data,
  datasets = [],
  selectedDataset,
  setSelectedDataset,
  selectedFile,
  setSelectedFile,
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
  onDeleteCancel,
  className = '',
}) {
  const [repoSearch, setRepoSearch] = useState('');

  const currentDatasetName = useMemo(() => {
    return data?.metadata?.dataset_name || data?.metadata?.filename?.replace(/\.[^.]+$/, '') || '';
  }, [data]);

  const selectedFolder = useMemo(() => {
    return datasets.find((item) => item.dataset_name === selectedDataset) || null;
  }, [datasets, selectedDataset]);

  const stageChain = useMemo(() => {
    return datasetFiles.map((file) => file.stage || file.file_name.split('_', 1)[0]);
  }, [datasetFiles]);

  const filteredDatasets = useMemo(() => {
    if (!repoSearch.trim()) return datasets;
    return datasets.filter((item) =>
      item.dataset_name.toLowerCase().includes(repoSearch.toLowerCase().trim())
    );
  }, [datasets, repoSearch]);

  return (
    <div className={`space-y-6 antialiased font-sans max-w-[1600px] mx-auto pb-12 text-slate-800 dark:text-slate-100 ${className}`}>
      
      {/* ===================================================== */}
      {/* 1. MAIN SYSTEM VERSIONING CONTROLLER HEADER */}
      {/* ===================================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50 rounded-xl shadow-2xs shrink-0">
            <Layers3 size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Lineage Registry Active
              </p>
              <StatusBadge variant="indigo" size="xs">
                {datasets.length} Repositories
              </StatusBadge>
            </div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase font-mono mt-0.5">
              Active Project Checkpoint:{' '}
              <span className="text-indigo-600 dark:text-indigo-400 font-sans normal-case tracking-normal pl-0.5">
                {currentDatasetName || 'No dataset loaded yet'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Reload-safe snapshot states array mapping repository lineage
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider transition-all font-mono cursor-pointer shadow-2xs disabled:opacity-40"
            disabled={loading}
            onClick={onRefresh}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-indigo-500' : ''} />
            <span>Refresh</span>
          </button>
          <InfoTooltip {...getTooltipContent('refreshFolders')} iconSize={12} className="h-4 w-4" />

          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold uppercase text-white tracking-wider transition-all shadow-md shadow-indigo-600/20 font-mono cursor-pointer disabled:opacity-40"
            disabled={loading || !selectedDataset}
            onClick={onCompress}
          >
            <Archive size={13} />
            <span>Compress Folder</span>
          </button>
          <InfoTooltip {...getTooltipContent('compressFolder')} iconSize={12} className="h-4 w-4" />
        </div>
      </div>

      {/* Visual Pipeline Stage Flow & Inspect details */}
      {selectedDataset && datasetFiles.length > 0 && (() => {
        const selectedFileObj = datasetFiles.find((f) => f.file_name === selectedFile);
        const selectedVersionName = selectedFileObj
          ? selectedFileObj.version || selectedFileObj.stage
          : '';
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
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FolderKey size={15} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
                Dataset Repositories
              </h3>
            </div>
            <InfoTooltip {...getTooltipContent('repositories')} iconSize={12} className="h-4 w-4" />
          </div>

          {datasets.length > 5 && (
            <div className="mb-3">
              <SearchInput
                value={repoSearch}
                onChange={setRepoSearch}
                placeholder="Filter repositories..."
              />
            </div>
          )}

          <div className="space-y-2 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
            {filteredDatasets.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-slate-400">
                No repositories match query.
              </div>
            ) : (
              filteredDatasets.map((item) => {
                const isSelected = selectedDataset === item.dataset_name;
                const fileCount = (item.files || []).length;
                return (
                  <button
                    key={item.dataset_name}
                    type="button"
                    className={`w-full rounded-xl border p-3.5 text-left text-xs transition-all duration-150 cursor-pointer select-none font-sans ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                    onClick={() => setSelectedDataset(item.dataset_name)}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 truncate text-xs">
                        <FolderOpen size={14} className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                        <span className="truncate">{item.dataset_name}</span>
                      </div>
                      {isSelected && (
                        <Check size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      <span>
                        {fileCount} Stage Vector{fileCount === 1 ? '' : 's'}
                      </span>
                      {item.dataset_name === currentDatasetName && (
                        <StatusBadge variant="emerald" size="xs">
                          Active
                        </StatusBadge>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN PANEL: CHRONOLOGICAL STAGE FILE SEGMENTS */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          
          {/* TRACK LAB HEADER */}
          <div className="mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={15} className="text-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                  Processing Checkpoint Buffer
                </h3>
                <InfoTooltip {...getTooltipContent('checkpointBuffer')} iconSize={12} className="h-4 w-4" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
                Sequential serialization frames from target workspace context paths
              </p>
            </div>
            <div className="max-w-xs self-start">
              <span className="inline-block rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 font-mono text-[10px] text-slate-600 dark:text-slate-300 break-all shadow-2xs">
                {selectedFolder?.folder_path || 'NO_BUFFER_PATH_SELECTED'}
              </span>
            </div>
          </div>

          {/* PIPELINE STAGE PIPELINE PIPES */}
          {stageChain.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-1.5 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              {stageChain.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-[10px] font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200 shadow-2xs">
                    {STAGE_LABELS[stage] || stage}
                  </span>
                  {idx < stageChain.length - 1 && (
                    <ChevronRight size={12} className="text-slate-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* IMMUTABLE DATA CHECKPOINT LIST FILE GRID */}
          <div className="grid gap-3 sm:grid-cols-2">
            {datasetFiles.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs font-mono text-slate-400">
                No checkpoint snapshot files found in this repository.
              </div>
            ) : (
              datasetFiles.map((file) => {
                const isSelected = selectedFile === file.file_name;
                const stageName = file.stage || file.file_name.split('_', 1)[0];
                return (
                  <div
                    key={file.file_name}
                    onClick={() => {
                      setSelectedFile(file.file_name);
                      setSelectedFilePath(file.file_path);
                    }}
                    className={`group flex items-center justify-between rounded-xl border p-3.5 text-xs cursor-pointer transition-all min-w-0 select-none ${
                      isSelected
                        ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="text-left pr-2 overflow-hidden min-w-0 flex-1">
                      <div className="font-mono text-xs font-bold text-slate-900 dark:text-white break-all truncate leading-relaxed">
                        {file.file_name}
                      </div>
                      <div className="mt-1.5">
                        <StatusBadge variant={getStageVariant(stageName)} size="xs">
                          Stage: {STAGE_LABELS[stageName] || stageName}
                        </StatusBadge>
                      </div>
                    </div>
                    <div className="pl-2 shrink-0 flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Delete dataset step from disk ledger"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(file.file_name);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* WORKBENCH BOTTOM OPERATION ACTION PANEL */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-5">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider transition-all font-mono cursor-pointer shadow-2xs disabled:opacity-40"
              disabled={loading || !selectedDataset || !selectedFile}
              onClick={() => onPreview('preview')}
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>
            <InfoTooltip {...getTooltipContent('preview')} iconSize={12} className="h-4 w-4" />

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider transition-all font-mono cursor-pointer shadow-2xs disabled:opacity-40"
              disabled={loading || !selectedDataset || !selectedFile}
              onClick={() => onPreview('dataset_viewer')}
            >
              <Database size={13} />
              <span>Datasheet View</span>
            </button>
            <InfoTooltip {...getTooltipContent('datasetView')} iconSize={12} className="h-4 w-4" />

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold uppercase text-white tracking-wider transition-all shadow-md shadow-indigo-600/20 font-mono cursor-pointer disabled:opacity-40 ml-auto"
              disabled={loading || !selectedDataset || !selectedFile}
              onClick={() => onPreview('analytics')}
            >
              <BarChart3 size={13} />
              <span>Launch Analytics</span>
            </button>
            <InfoTooltip {...getTooltipContent('analyticsView')} iconSize={12} className="h-4 w-4" />

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold uppercase text-white tracking-wider transition-all shadow-md shadow-amber-600/20 font-mono cursor-pointer disabled:opacity-40"
              disabled={loading || !(selectedDataset || currentDatasetName)}
              onClick={onRestoreV2}
              data-testid="rollback-btn"
            >
              <RotateCcw size={13} />
              <span>Restore V2</span>
            </button>
            <InfoTooltip {...getTooltipContent('rollback')} iconSize={12} className="h-4 w-4" />
          </div>

        </div>
      </div>

      {/* ===================================================== */}
      {/* 3. CONFIRMATION DELETION MODAL LAYER */}
      {/* ===================================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onDeleteCancel} />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 mb-4 shadow-xs">
              <AlertTriangle size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
              Confirm Checkpoint Purge
            </h4>
            <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Are you sure you want to purge <strong className="font-mono text-rose-600 dark:text-rose-400 break-all">{fileToDelete}</strong> from repository <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedDataset}</strong>? This snapshot checkpoint will be removed from disk storage.
            </p>
            <div className="mt-6 flex justify-end gap-2.5 font-mono text-xs">
              <button
                type="button"
                onClick={onDeleteCancel}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 font-bold uppercase transition-colors cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDeleteConfirm}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 font-bold uppercase transition-colors shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Delete File
              </button>
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
          className={`flex items-start gap-3 rounded-xl border p-4 text-xs font-mono shadow-xs ${
            output.success
              ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
              : 'border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
          }`}
        >
          {output.success ? (
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
          ) : (
            <XCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
          )}
          <div>
            <p className="font-bold uppercase tracking-wider">
              {output.success ? 'Operation Successful' : 'Operation Failed'}
            </p>
            <p className="mt-1 leading-relaxed opacity-90 font-sans">
              {output.message || (output.success ? 'Checkpoint restored successfully.' : 'An error occurred.')}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default VersioningPanel;
