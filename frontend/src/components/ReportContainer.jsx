import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Database,
  ArrowRight,
} from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { useVersionContext } from '../context/VersionContext';
import { useVersioning } from '../hooks/useVersioning';
import { useDataset } from '../hooks/useDataset';
import { useProjectContext } from '../context/ProjectContext';
import { getReportStatus } from '../services/api/report.api';
import ReportPanel from './ReportPanel';
import { StatusBadge } from './common';

/**
 * Enterprise ReportContainer Component
 * Orchestrates background report job generation, status polling,
 * snapshot version selection, and session history management.
 */
export default function ReportContainer({ className = '' }) {
  const navigate = useNavigate();
  const { datasetData } = useDataset();
  const { activeVersion } = useVersionContext();
  const { fetchVersions } = useVersioning();
  const { projectId } = useProjectContext();
  const { generate, loading: hookLoading, error: hookError } = useReports();

  const [availableVersions, setAvailableVersions] = useState([]);
  const [userSelectedVersion, setUserSelectedVersion] = useState('');
  const [customReportPath, setCustomReportPath] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');
  const [progressStage, setProgressStage] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const pollIntervalRef = useRef(null);

  const resolvedDatasetName = useMemo(() => {
    return (
      datasetData?.dataset_name ||
      datasetData?.metadata?.dataset_name ||
      datasetData?.metadata?.filename?.replace(/\.[^.]+$/, '') ||
      datasetData?.metadata?.file_path?.split(/[\\/]/).pop()?.replace(/\.[^.]+$/, '') ||
      'dataset'
    );
  }, [datasetData]);

  const defaultVersion = useMemo(() => {
    return (
      activeVersion ||
      datasetData?.metadata?.current_version ||
      datasetData?.version ||
      datasetData?.metadata?.version ||
      'raw'
    );
  }, [activeVersion, datasetData]);

  const resolvedVersion = userSelectedVersion || defaultVersion || 'raw';
  const reportPath = customReportPath || datasetData?.metadata?.pipeline_report_download_url || '';

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Fetch available versions for dropdown selector
  useEffect(() => {
    if (!resolvedDatasetName || !projectId) return;

    let active = true;
    const loadVersions = async () => {
      try {
        const versionsList = await fetchVersions(projectId);
        if (!active) return;
        const matching = (versionsList || []).filter(
          (item) => item.dataset_name === resolvedDatasetName
        );
        setAvailableVersions(matching);
      } catch {
        // Non-fatal, version selector falls back to default
      }
    };

    loadVersions();
    return () => {
      active = false;
    };
  }, [resolvedDatasetName, projectId, fetchVersions]);

  // Poll background task status until completed or failed
  const startStatusPolling = (taskId) => {
    setIsPolling(true);
    setProgressStage('Background task queued...');

    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const statusResponse = await getReportStatus(taskId);
        const task = statusResponse?.data || statusResponse;
        const currentStatus = task?.status;

        if (currentStatus === 'processing') {
          setProgressStage('Compiling statistical charts & ReportLab vector PDF...');
        } else if (currentStatus === 'completed') {
          clearInterval(pollIntervalRef.current);
          setIsPolling(false);
          setProgressStage('');

          const downloadUrl = task?.result?.download_url || task?.download_url || '';
          if (downloadUrl) {
            setCustomReportPath(downloadUrl);
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setGeneratedAt(now);
            setHistory((prev) => [
              { version: resolvedVersion, url: downloadUrl, timestamp: now },
              ...prev,
            ]);
          }
        } else if (currentStatus === 'failed') {
          clearInterval(pollIntervalRef.current);
          setIsPolling(false);
          setProgressStage('');
          setError(task?.error || 'PDF compilation task failed on server.');
        } else if (attempts >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          setIsPolling(false);
          setProgressStage('');
          setError('Report compilation timed out. Please retry.');
        }
      } catch (pollErr) {
        clearInterval(pollIntervalRef.current);
        setIsPolling(false);
        setProgressStage('');
        setError(pollErr.message || 'Error tracking background report compilation.');
      }
    }, 1000);
  };

  const handleGenerate = async () => {
    if (!resolvedVersion) {
      setError('Please select a target dataset version for report compilation.');
      return;
    }

    setCustomReportPath('');
    setError('');
    setProgressStage('Submitting report generation payload...');

    try {
      const res = await generate(resolvedVersion, resolvedDatasetName);
      const data = res?.data || res;

      // Check if backend queued this as a background task
      const taskId = data?.task_id || res?.task_id;
      if (taskId) {
        startStatusPolling(taskId);
        return;
      }

      // Direct synchronous response
      const downloadUrl = data?.download_url || data?.report_url || '';
      if (downloadUrl) {
        setCustomReportPath(downloadUrl);
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setGeneratedAt(now);
        setHistory((prev) => [
          { version: resolvedVersion, url: downloadUrl, timestamp: now },
          ...prev,
        ]);
        setProgressStage('');
      } else {
        setError('No download link was returned by report service.');
        setProgressStage('');
      }
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.details?.detail ||
        err?.message ||
        'Failed to generate PDF report.'
      );
      setProgressStage('');
    }
  };

  // Standby Empty State when no dataset is loaded
  if (!datasetData || !resolvedDatasetName) {
    return (
      <section
        className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs font-sans text-slate-800 dark:text-slate-100 transition-all ${className}`}
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Executive Dossier
              </span>
              <StatusBadge variant="slate" size="xs">
                Awaiting Dataset
              </StatusBadge>
            </div>
            <h3 className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
              Comprehensive Pipeline PDF Report
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Automated PDF generation compiling statistical data hygiene, demographic weighting convergence, and outlier diagnostics.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-xs mb-4">
            <FileText size={26} />
          </div>
          <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
            No Survey Selected for PDF Compilation
          </h4>
          <p className="mt-2 max-w-md text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            To generate an audit-ready executive PDF dossier, ingest or select a survey dataset in the explorer.
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

  const isLoading = hookLoading || isPolling;

  return (
    <ReportPanel
      versionName={resolvedVersion}
      datasetName={resolvedDatasetName}
      availableVersions={availableVersions}
      onVersionChange={setUserSelectedVersion}
      loading={isLoading}
      progressStage={progressStage}
      error={error || hookError}
      reportPath={reportPath}
      onGenerate={handleGenerate}
      generatedAt={generatedAt}
      history={history}
      className={className}
    />
  );
}
