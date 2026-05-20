import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../api/config';
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
  HelpCircle,
  Binary,
  ChevronRight,
  Database,
  ArrowRight,
  RotateCcw
} from "lucide-react";

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

const STAGE_ORDER = {
  raw: 0,
  clean: 1,
  cleaned: 1,
  outlier: 2,
  outlier_detected: 2,
  validation: 3,
  validated: 3,
  estimation: 4,
  estimated: 4,
};

function getStageRank(stageName) {
  return STAGE_ORDER[stageName] ?? 99;
}

function VersioningPanel({ data, onViewAnalytics, onRedirectToViewer }) {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [datasetFiles, setDatasetFiles] = useState([]);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState('');

  const currentDatasetName = useMemo(() => {
    return data?.metadata?.dataset_name || data?.metadata?.filename?.replace(/\.[^.]+$/, '') || '';
  }, [data]);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(apiUrl('/api/versioning/datasets'));
      const items = response.data?.datasets || [];
      setDatasets(items);
      setOutput(response.data);

      if (currentDatasetName && items.some((item) => item.dataset_name === currentDatasetName)) {
        setSelectedDataset(currentDatasetName);
      } else if (!selectedDataset && items.length > 0) {
        setSelectedDataset(items[0].dataset_name);
      }
    } catch (error) {
      setOutput({
        status: 'error',
        detail: error.response?.data?.detail || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async (datasetName) => {
    if (!datasetName) return;
    setLoading(true);
    try {
      const response = await axios.get(apiUrl(`/api/versioning/datasets/${encodeURIComponent(datasetName)}`));
      const files = response.data?.files || [];
      const orderedFiles = [...files].sort((left, right) => {
        const leftStage = left.stage || left.file_name.split('_', 1)[0];
        const rightStage = right.stage || right.file_name.split('_', 1)[0];
        const rankDifference = getStageRank(leftStage) - getStageRank(rightStage);
        return rankDifference !== 0 ? rankDifference : left.file_name.localeCompare(right.file_name);
      });
      setDatasetFiles(orderedFiles);
      setOutput(response.data);

      if (orderedFiles.length > 0) {
        setSelectedFile(orderedFiles[0].file_name);
        setSelectedFilePath(orderedFiles[0].file_path);
      } else {
        setSelectedFile('');
        setSelectedFilePath('');
      }
    } catch (error) {
      setOutput({
        status: 'error',
        detail: error.response?.data?.detail || error.message,
      });
      setDatasetFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteSelectedFile = async (fileName) => {
    if (!selectedDataset || !fileName) return;
    setFileToDelete(fileName);
    setShowDeleteModal(true);
  };

  const performDeleteFile = async () => {
    const fileName = fileToDelete;
    if (!selectedDataset || !fileName) return;
    setShowDeleteModal(false);
    setLoading(true);
    try {
      const response = await axios.post(apiUrl(`/api/versioning/datasets/${encodeURIComponent(selectedDataset)}/files/${encodeURIComponent(fileName)}/delete`), {});
      await fetchFiles(selectedDataset);
      setOutput(response.data);
    } catch (error) {
      setOutput({ status: 'error', detail: error.response?.data?.detail || error.message });
    } finally {
      setLoading(false);
      setFileToDelete('');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setFileToDelete('');
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    if (!selectedDataset && currentDatasetName && datasets.some((item) => item.dataset_name === currentDatasetName)) {
      setSelectedDataset(currentDatasetName);
      return;
    }

    if (selectedDataset) {
      fetchFiles(selectedDataset);
    }
  }, [selectedDataset, currentDatasetName, datasets]);

  const previewSelectedFile = async (mode = 'preview') => {
    if (!selectedDataset || !selectedFile) return;
    setLoading(true);
    try {
      // INSTALLED: Custom redirection trigger initializing full dataset explorer models
      if (mode === 'dataset_viewer') {
        const targetFilePath = selectedFilePath || datasetFiles.find((file) => file.file_name === selectedFile)?.file_path || '';
        const previewResponse = await axios.get(
          apiUrl(`/api/versioning/datasets/${encodeURIComponent(selectedDataset)}/files/${encodeURIComponent(selectedFile)}/preview`)
        );

        const comprehensiveDatasetPayload = {
          metadata: {
            filename: selectedFile,
            dataset_name: selectedDataset,
            file_path: previewResponse.data?.file_path || targetFilePath,
            rows: previewResponse.data?.rows ?? 0,
            columns: previewResponse.data?.columns ?? 0,
            null_counts: previewResponse.data?.missing_counts || {},
          },
          preview: previewResponse.data?.preview || [],
        };

        setOutput(previewResponse.data);
        onRedirectToViewer?.(comprehensiveDatasetPayload);
        return;
      }

      if (mode === 'analytics') {
        const filePathForAnalytics = selectedFilePath || datasetFiles.find((file) => file.file_name === selectedFile)?.file_path || '';
        const [previewResponse, analyticsResponse, statsResponse] = await Promise.all([
          axios.get(
            apiUrl(`/api/versioning/datasets/${encodeURIComponent(selectedDataset)}/files/${encodeURIComponent(selectedFile)}/preview`)
          ),
          axios.get(
            apiUrl(`/api/versioning/datasets/${encodeURIComponent(selectedDataset)}/files/${encodeURIComponent(selectedFile)}/analytics`)
          ),
          axios.post(apiUrl('/api/statistics/profile'), {
            file_path: filePathForAnalytics,
          }),
        ]);

        const analyticsDataset = {
          metadata: {
            filename: selectedFile,
            dataset_name: selectedDataset,
            file_path: previewResponse.data?.file_path || filePathForAnalytics,
            rows: analyticsResponse.data?.analytics?.rows ?? previewResponse.data?.rows ?? 0,
            columns: analyticsResponse.data?.analytics?.columns ?? previewResponse.data?.columns ?? 0,
            null_counts: analyticsResponse.data?.analytics?.missing_counts || {},
          },
          preview: previewResponse.data?.preview || [],
          statistics: statsResponse.data?.stats || null,
        };

        setSelectedFilePath(analyticsDataset.metadata.file_path);
        setOutput({
          status: 'success',
          dataset_name: selectedDataset,
          file_name: selectedFile,
          analytics: analyticsResponse.data?.analytics,
        });
        onViewAnalytics?.(analyticsDataset);
        return;
      }

      const response = await axios.get(
        apiUrl(`/api/versioning/datasets/${encodeURIComponent(selectedDataset)}/files/${encodeURIComponent(selectedFile)}/${mode}`)
      );
      setOutput(response.data);
      if (response.data?.file_path) {
        setSelectedFilePath(response.data.file_path);
      }
    } catch (error) {
      setOutput({
        status: 'error',
        detail: error.response?.data?.detail || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const compressSelectedFolder = async () => {
    if (!selectedDataset) return;
    setLoading(true);
    try {
      const response = await axios.post(apiUrl(`/api/versioning/datasets/${encodeURIComponent(selectedDataset)}/compress`), {});
      setOutput(response.data);
    } catch (error) {
      setOutput({
        status: 'error',
        detail: error.response?.data?.detail || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreV2Snapshot = async () => {
    const datasetName = selectedDataset || currentDatasetName;
    if (!datasetName) return;

    setLoading(true);
    try {
      const response = await axios.post(apiUrl('/api/versioning/rollback'), {
        dataset_name: datasetName,
        version_name: 'v2_outliers',
      });
      setOutput(response.data);
    } catch (error) {
      setOutput({
        status: 'error',
        detail: error.response?.data?.detail || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedFolder = datasets.find((item) => item.dataset_name === selectedDataset) || null;
  const stageChain = datasetFiles.map((file) => file.stage || file.file_name.split('_', 1)[0]);

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
            onClick={fetchDatasets}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh Folders
          </button>
          <button 
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-bold uppercase text-white tracking-wide transition-colors shadow-md font-mono disabled:opacity-40" 
            disabled={loading || !selectedDataset} 
            onClick={compressSelectedFolder}
          >
            <Archive size={13} /> Compress Folder
          </button>
        </div>
      </div>

      {/* ===================================================== */}
      {/* 2. DUAL COLUMN CONTROL GRID WORKBENCH */}
      {/* ===================================================== */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* LEFT COLUMN PANEL: FOLDERS TRACK TREE */}
        <div className="lg:col-span-4 rounded-xl border-2 border-slate-800/80 bg-[#0f172a] p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-900">
            <FolderKey size={14} className="text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Dataset Repositories</h3>
          </div>
          
          <div className="space-y-2 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
            {datasets.map((item) => (
              <button
                key={item.dataset_name}
                className={`w-full rounded-lg border-2 p-3.5 text-left text-xs transition-all duration-150 relative ${
                  selectedDataset === item.dataset_name 
                    ? 'border-indigo-500 bg-[#0b1329] text-slate-200 ring-1 ring-indigo-500/20 shadow-md' 
                    : 'border-slate-900 bg-[#0b1329]/20 text-slate-400 hover:border-slate-800 hover:bg-slate-950/20'
                }`}
                onClick={() => setSelectedDataset(item.dataset_name)}
              >
                <div className="font-bold text-slate-200 truncate font-sans text-sm tracking-tight">{item.dataset_name}</div>
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
                className={`group flex items-center justify-between rounded-lg border-2 p-3 text-xs cursor-pointer transition-all min-w-0 ${
                  selectedFile === file.file_name 
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
                    title="Delete dataset step from disk ledger" 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      deleteSelectedFile(file.file_name);
                    }} 
                    className="p-1.5 rounded text-slate-600 hover:text-rose-400 border border-transparent hover:border-slate-800 hover:bg-slate-950 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* WORKBENCH BOTTOM OPERATION DEEP ACTION PANEL */}
          <div className="mt-6 flex flex-wrap gap-2.5 border-t border-slate-900 pt-4">
            <button 
              className="flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/60 px-4 py-2 text-xs font-bold uppercase text-slate-200 tracking-wide transition-colors font-mono disabled:opacity-40" 
              disabled={loading || !selectedDataset || !selectedFile} 
              onClick={() => previewSelectedFile('preview')}
            >
              <Eye size={13} /> Preview
            </button>
            <button 
              className="flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/60 px-4 py-2 text-xs font-bold uppercase text-slate-200 tracking-wide transition-colors font-mono disabled:opacity-40" 
              disabled={loading || !selectedDataset || !selectedFile} 
              onClick={() => previewSelectedFile('dataset_viewer')}
            >
              <Database size={13} /> Dataset
            </button>
            <button 
              className="flex items-center gap-1.5 rounded bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold uppercase text-white tracking-wide transition-colors shadow-md font-mono disabled:opacity-40 ml-auto" 
              disabled={loading || !selectedDataset || !selectedFile} 
              onClick={() => previewSelectedFile('analytics')}
            >
              <BarChart3 size={13} /> Analytics
            </button>
            <button 
              className="flex items-center gap-1.5 rounded bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-bold uppercase text-white tracking-wide transition-colors shadow-md font-mono disabled:opacity-40" 
              disabled={loading || !(selectedDataset || currentDatasetName)} 
              onClick={restoreV2Snapshot}
            >
              <RotateCcw size={13} /> Restore V2
            </button>
          </div>
          
        </div>
      </div>

      {/* ===================================================== */}
      {/* 3. CONFIRMATION DELETION MODAL LAYER */}
      {/* ===================================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={cancelDelete} />
          <div className="relative w-full max-w-md rounded-xl bg-[#0f172a] border-2 border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
              <AlertTriangle size={18} />
            </div>
            <h4 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-tight">Confirm Deletion</h4>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed font-sans">
              Are you sure you want to purge <span className="font-mono text-rose-400 font-bold bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded break-all">{fileToDelete}</span> from repository ledger <span className="font-semibold text-slate-300 font-mono bg-slate-950 border border-slate-900/60 px-1 py-0.5 rounded">{selectedDataset}</span>? This structural state file will be purged from the disk permanently.
            </p>
            <div className="mt-6 flex justify-end gap-2.5 font-mono text-[11px]">
              <button onClick={cancelDelete} className="rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-3.5 py-2 font-bold uppercase transition-colors">Cancel</button>
              <button onClick={performDeleteFile} className="rounded bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 font-bold uppercase transition-colors shadow-md">Delete File</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default VersioningPanel;
