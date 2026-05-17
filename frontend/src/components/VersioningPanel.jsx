import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

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

function VersioningPanel({ data, onViewAnalytics }) {
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
      const response = await axios.get(`${API_BASE}/api/versioning/datasets`);
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
      const response = await axios.get(`${API_BASE}/api/versioning/datasets/${encodeURIComponent(datasetName)}`);
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
      const response = await axios.post(`${API_BASE}/api/versioning/datasets/${encodeURIComponent(selectedDataset)}/files/${encodeURIComponent(fileName)}/delete`, {});
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
      if (mode === 'analytics') {
        const filePathForAnalytics = selectedFilePath || datasetFiles.find((file) => file.file_name === selectedFile)?.file_path || '';
        const [previewResponse, analyticsResponse, statsResponse] = await Promise.all([
          axios.get(
            `${API_BASE}/api/versioning/datasets/${encodeURIComponent(selectedDataset)}/files/${encodeURIComponent(selectedFile)}/preview`
          ),
          axios.get(
            `${API_BASE}/api/versioning/datasets/${encodeURIComponent(selectedDataset)}/files/${encodeURIComponent(selectedFile)}/analytics`
          ),
          axios.post(`${API_BASE}/api/statistics/profile`, {
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
        `${API_BASE}/api/versioning/datasets/${encodeURIComponent(selectedDataset)}/files/${encodeURIComponent(selectedFile)}/${mode}`
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
      const response = await axios.post(`${API_BASE}/api/versioning/datasets/${encodeURIComponent(selectedDataset)}/compress`, {});
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
    <div className="space-y-6 p-1">
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Dataset</p>
          <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{currentDatasetName || 'No dataset loaded yet'}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Reload-safe folder view for the dataset being processed right now.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            className="rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors disabled:opacity-50" 
            disabled={loading} 
            onClick={fetchDatasets}
          >
            Refresh Folders
          </button>
          <button 
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50" 
            disabled={loading || !selectedDataset} 
            onClick={compressSelectedFolder}
          >
            Compress Folder
          </button>
        </div>
      </div>

      {/* Main Panel Sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Folders */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Dataset Folders</h3>
          <div className="space-y-2.5 max-h-[440px] overflow-auto pr-1">
            {datasets.map((item) => (
              <button
                key={item.dataset_name}
                className={`w-full rounded-xl border p-3.5 text-left text-sm transition-all duration-150 ${
                  selectedDataset === item.dataset_name 
                    ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900 shadow-sm' 
                    : 'border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-slate-100/80'
                }`}
                onClick={() => setSelectedDataset(item.dataset_name)}
              >
                <div className="font-bold text-slate-900">{item.dataset_name}</div>
                <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  {(item.files || []).length} stage file{(item.files || []).length === 1 ? '' : 's'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Files & Pipeline Tracking */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Stage Files</h3>
              <p className="text-xs text-slate-500 mt-0.5">Base dataset plus each preprocessing step saved in order.</p>
            </div>
            <div className="max-w-xs text-left md:text-right">
              <span className="inline-block rounded bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-600 break-all">
                {selectedFolder?.folder_path || 'No folder selected'}
              </span>
            </div>
          </div>

          {/* Pipeline Badge Flow */}
          {stageChain.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-1.5 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
              {stageChain.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="rounded-md border border-indigo-100 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 shadow-xs">
                    {STAGE_LABELS[stage] || stage}
                  </span>
                  {idx < stageChain.length - 1 && (
                    <svg className="h-3 w-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* File Grid */}
          <div className="grid gap-3 md:grid-cols-2">
            {datasetFiles.map((file) => (
              <div 
                key={file.file_name} 
                onClick={() => { setSelectedFile(file.file_name); setSelectedFilePath(file.file_path); }}
                className={`group flex items-center justify-between rounded-xl border p-3.5 text-sm cursor-pointer transition-all ${
                  selectedFile === file.file_name 
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-xs' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40'
                }`}
              >
                <div className="text-left pr-2 overflow-hidden">
                  <div className="font-mono text-xs font-semibold text-slate-700 break-all">{file.file_name}</div>
                  <div className="mt-1 inline-block text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {STAGE_LABELS[file.stage] || file.stage}
                  </div>
                </div>
                <div className="pl-1">
                  <button 
                    title="Delete file" 
                    onClick={(e) => {
                      e.stopPropagation(); // Stops selecting the row when pressing delete
                      deleteSelectedFile(file.file_name);
                    }} 
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    {/* Trash Icon SVG */}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Triggers */}
          <div className="mt-5 flex flex-wrap gap-2.5 border-t border-slate-100 pt-4">
            <button 
              className="rounded-lg bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50" 
              disabled={loading || !selectedDataset || !selectedFile} 
              onClick={() => previewSelectedFile('preview')}
            >
              Preview Selected
            </button>
            <button 
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50" 
              disabled={loading || !selectedDataset || !selectedFile} 
              onClick={() => previewSelectedFile('analytics')}
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs" onClick={cancelDelete} />
          <div className="relative w-full max-w-md rounded-xl bg-white border border-slate-200 p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-4">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-slate-900">Confirm Deletion</h4>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1 py-0.5 rounded break-all">{fileToDelete}</span> from dataset <span className="font-semibold text-slate-800">{selectedDataset}</span>? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={cancelDelete} className="rounded-lg px-4 py-2 bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-700 transition-colors">Cancel</button>
              <button onClick={performDeleteFile} className="rounded-lg px-4 py-2 bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white shadow-sm transition-colors">Delete File</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VersioningPanel;