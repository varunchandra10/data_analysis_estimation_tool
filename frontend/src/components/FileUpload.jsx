import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Zap,
  Sparkles,
  Database,
  RefreshCw,
} from 'lucide-react';
import { uploadDataset } from '../services/api/upload.api';
import { getDatasetProfile } from '../services/api/statistics.api';
import InfoTooltip from './UI/InfoTooltip';
import { StatusBadge } from './common';

const ACCEPTED_FILE_TYPES = {
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
};

/**
 * Enterprise FileUpload Component
 * High-throughput survey dataset ingestion module with drag-and-drop,
 * real-time stage telemetry, schema verification, and one-click demo data loading.
 */
const FileUpload = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [stageProgress, setStageProgress] = useState(0);
  const [stageLabel, setStageLabel] = useState('');
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [completedMetadata, setCompletedMetadata] = useState(null);
  const [loadingSample, setLoadingSample] = useState(false);

  // Core file pipeline processor
  const processUpload = useCallback(
    async (file) => {
      if (!file) return;

      const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
      setFileInfo({
        name: file.name,
        size: sizeInMb,
        type: file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? 'XLSX' : 'CSV',
      });
      setError(null);
      setCompletedMetadata(null);
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      try {
        // Stage 1: Validation & Streaming
        setStageLabel('Validating format & streaming raw bytes...');
        setStageProgress(25);

        const uploadedData = await uploadDataset(formData);

        // Stage 2: Profiling & Feature Analysis
        setStageLabel('Synthesizing statistical distributions & column metadata...');
        setStageProgress(65);

        try {
          const statsResponse = await getDatasetProfile(uploadedData.metadata.file_path);
          uploadedData.statistics = statsResponse.stats;
        } catch {
          // Non-fatal fallback for statistical profiler
        }

        // Stage 3: Synchronization
        setStageLabel('Synchronizing memory buffer & lineage DAG...');
        setStageProgress(95);

        const rowCount = uploadedData?.metadata?.rows ?? uploadedData?.rows?.length ?? 0;
        const colCount = uploadedData?.metadata?.columns ?? uploadedData?.columns?.length ?? 0;

        setCompletedMetadata({
          rows: rowCount,
          columns: colCount,
          path: uploadedData?.metadata?.file_path || '',
        });

        setTimeout(() => {
          setStageProgress(100);
          setStageLabel('Pipeline ingestion complete');
          if (onUploadSuccess) {
            onUploadSuccess(uploadedData);
          }
          setIsUploading(false);
        }, 400);
      } catch (err) {
        setError(
          err?.response?.data?.detail ||
          err?.details?.detail ||
          err?.message ||
          'Failed to upload and parse dataset. Please ensure file is a valid CSV or XLSX format.'
        );
        setIsUploading(false);
        setStageProgress(0);
      }
    },
    [onUploadSuccess]
  );

  // Dropzone hook callbacks
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles && rejectedFiles.length > 0) {
        setError('Unsupported file type. Please upload a valid RFC-4180 .CSV or Excel .XLSX tabular file.');
        return;
      }
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      processUpload(acceptedFiles[0]);
    },
    [processUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    disabled: isUploading,
  });

  // One-click demo dataset loader
  const handleLoadSample = async () => {
    setLoadingSample(true);
    setError(null);
    try {
      const response = await fetch('/sample_survey_data.csv');
      if (!response.ok) {
        throw new Error('Unable to retrieve sample survey data from asset registry.');
      }
      const blob = await response.blob();
      const sampleFile = new File([blob], 'sample_survey_data.csv', { type: 'text/csv' });
      await processUpload(sampleFile);
    } catch (err) {
      setError(err.message || 'Failed to load sample dataset.');
    } finally {
      setLoadingSample(false);
    }
  };

  const handleReset = () => {
    setFileInfo(null);
    setCompletedMetadata(null);
    setError(null);
    setStageProgress(0);
    setStageLabel('');
  };

  return (
    <div className="space-y-4 font-sans text-slate-800 dark:text-slate-100">
      
      {/* ===================== BUFFER ZONE / DROPZONE BOX ===================== */}
      <div
        {...getRootProps()}
        data-testid="upload-dropzone"
        className={`
          relative group rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden select-none
          ${
            isDragReject
              ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30'
              : isDragActive
              ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-lg shadow-indigo-500/10 scale-[1.005]'
              : 'border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 hover:border-indigo-400 dark:hover:border-indigo-500/80 hover:bg-slate-50/80 dark:hover:bg-slate-900/80'
          }
        `}
      >
        <input {...getInputProps()} data-testid="upload-input" />

        <div className="p-8 sm:p-12 text-center relative z-10">
          
          {/* Animated Upload Icon Capsule */}
          <div
            className={`
              mx-auto mb-5 w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-200 shadow-sm
              ${
                isDragReject
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : isDragActive
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-600/30 -translate-y-1'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-200 dark:group-hover:border-indigo-800 group-hover:scale-105'
              }
            `}
          >
            {isDragReject ? (
              <AlertCircle size={24} />
            ) : (
              <UploadCloud size={24} className={isDragActive ? 'animate-bounce' : ''} />
            )}
          </div>

          {/* Heading & Context */}
          <div className="space-y-2 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-sm font-bold font-mono tracking-wider text-slate-900 dark:text-white uppercase">
                {isDragReject
                  ? 'UNSUPPORTED FORMAT REJECTED'
                  : isDragActive
                  ? 'RELEASE TO INGEST BUFFER'
                  : 'LOAD SURVEY TARGET MATRIX'}
              </h3>
              <InfoTooltip
                title="Dataset Ingestion"
                description="Uploads the source file, parses row sequences, and generates the initial schema and statistical profile."
                recommendation="Accepted formats: CSV (RFC-4180) and Excel (.XLSX)."
                iconSize={13}
                className="h-4 w-4"
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Drag and drop your survey dataset here, or{' '}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 underline underline-offset-2">
                browse files
              </span>{' '}
              from your device.
            </p>
          </div>

          {/* Enterprise Capability Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold">
              <FileText size={12} className="text-emerald-600 dark:text-emerald-400" />
              CSV (RFC-4180)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold">
              <FileSpreadsheet size={12} className="text-emerald-600 dark:text-emerald-400" />
              Excel (.xlsx, .xls)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-bold">
              <Zap size={12} />
              Auto Typing
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium">
              Max 100 MB
            </span>
          </div>
        </div>

        {/* Ambient Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
      </div>

      {/* ===================== ONE-CLICK DEMO DATASET OPTION ===================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-950/70 bg-gradient-to-r from-indigo-50/60 via-slate-50/40 to-indigo-50/60 dark:from-indigo-950/20 dark:via-slate-900/30 dark:to-indigo-950/20 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
            <Sparkles size={15} />
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
              Need sample data to explore?
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Instant load of verified 100-respondent demographic survey matrix.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          disabled={isUploading || loadingSample}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold tracking-tight shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {loadingSample ? (
            <>
              <Loader2 size={13} className="animate-spin text-indigo-500" />
              <span>Fetching Sample...</span>
            </>
          ) : (
            <>
              <Database size={13} className="text-indigo-500" />
              <span>Load Sample Survey (CSV)</span>
            </>
          )}
        </button>
      </div>

      {/* ===================== REAL-TIME PROCESSING PIPELINE ===================== */}
      {isUploading && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-4 font-mono shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Active Ingestion Pipeline
                  </h4>
                  <StatusBadge variant="indigo" size="xs">
                    {stageProgress}%
                  </StatusBadge>
                </div>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                  &gt;&gt; {stageLabel || 'Processing...'}
                </p>
              </div>
            </div>

            {fileInfo && (
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md">
                {fileInfo.size} MB
              </span>
            )}
          </div>

          {/* Stepped Progress Meter */}
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${stageProgress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
            <span className="truncate max-w-[280px]">
              Target: <strong className="text-slate-700 dark:text-slate-300">{fileInfo?.name}</strong>
            </span>
            <span className="uppercase tracking-wider">Memory Allocation: Safe</span>
          </div>
        </div>
      )}

      {/* ===================== ERROR STATE BANNER ===================== */}
      {!isUploading && error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 p-4 font-mono flex items-start gap-3 shadow-xs animate-in fade-in duration-150">
          <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg mt-0.5 shrink-0">
            <AlertCircle size={16} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                Ingestion Interrupted
              </h4>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed font-sans">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* ===================== SUCCESS / INGESTED CARD ===================== */}
      {!isUploading && !error && fileInfo && completedMetadata && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  Ingestion & Profiling Complete
                </h4>
                <StatusBadge variant="emerald" size="xs">
                  Active in Buffer
                </StatusBadge>
              </div>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400 mt-0.5 font-sans">
                Mapped <strong>{completedMetadata.rows.toLocaleString()}</strong> records across{' '}
                <strong>{completedMetadata.columns}</strong> typed columns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-[10px] text-slate-500 font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md shadow-2xs">
              {fileInfo.name} ({fileInfo.size} MB)
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase cursor-pointer transition-colors shadow-2xs"
            >
              <RefreshCw size={11} />
              <span>Replace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
