import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BookOpen, Download, FileText, ShieldCheck, Sparkles, Zap, CheckCircle, Circle, Clock3 } from 'lucide-react';
import { collectReportData, formatReportForDisplay } from '../utils/reportGenerator';

const STORAGE_KEY = 'daet_report_history';

const statusLabel = (completed) => (
  completed ? (
    <span className="inline-flex items-center gap-1 text-emerald-300">
      <CheckCircle size={14} /> Completed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-slate-500">
      <Circle size={14} /> Pending
    </span>
  )
);

const formatDate = (value) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  return date.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function ReportPanel({
  datasetData,
  aiResults,
  validationResult,
  estimationResult,
  outlierResult,
  duplicateResult,
  analyticsViewData,
}) {
  const [reportData, setReportData] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const datasetVersion = datasetData?.metadata?.version || datasetData?.metadata?.version_info?.active_version || '1';
  const datasetName = datasetData?.metadata?.filename || datasetData?.metadata?.dataset_name || reportData?.metadata?.datasetName || 'Dataset';

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to read report history', error);
    }
  }, []);

  const selectedReport = useMemo(
    () => history.find((item) => item.id === selectedId) || null,
    [history, selectedId]
  );

  const summarySteps = [
    { label: 'Dataset', key: 'dataset', completed: !!datasetData },
    { label: 'Cleaning', key: 'cleaning', completed: !!datasetData?.metadata?.null_counts },
    { label: 'Outliers', key: 'outliers', completed: !!outlierResult },
    { label: 'Validation', key: 'validation', completed: !!validationResult },
    { label: 'Weighting', key: 'weighting', completed: !!estimationResult },
    { label: 'AI Insights', key: 'ai', completed: !!aiResults },
  ];

  const handleGenerateReport = () => {
    if (!datasetData) return;
    setIsGenerating(true);
    setErrorMessage('');

    try {
      const payload = collectReportData({
        datasetData,
        aiResults,
        validationResult,
        estimationResult,
        outlierResult,
        duplicateResult,
        analyticsViewData,
      });
      const formatted = formatReportForDisplay(payload);
      const reportEntry = {
        id: `${datasetName}-${Date.now()}`,
        reportName: `Report ${formatDate(new Date())}`,
        generatedAt: new Date().toISOString(),
        datasetVersion,
        datasetName,
        payload: formatted,
      };
      const nextHistory = [reportEntry, ...history].slice(0, 10);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
      setHistory(nextHistory);
      setReportData(formatted);
      setSelectedId(reportEntry.id);
    } catch (error) {
      console.error(error);
      setErrorMessage('Could not generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async (entry) => {
    const payload = entry?.payload || reportData;
    if (!payload) return;
    setIsDownloading(true);
    setErrorMessage('');

    try {
      const response = await axios.post('/api/report/pdf', payload, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${payload.metadata.datasetName || 'DAET_Report'}_${payload.metadata.generatedAt?.slice(0, 10) || 'report'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to download PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSelectHistory = (id) => {
    setSelectedId(id);
    const entry = history.find((item) => item.id === id);
    setReportData(entry?.payload || null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Report Center</p>
            <h1 className="mt-2 text-2xl font-bold text-white">Generate and manage dataset reports</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Preview a full DAET report, download PDF output, and revisit old versions when you need a clean summary of dataset health.
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={!datasetData || isGenerating}
            className="inline-flex items-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileText size={16} />
            {isGenerating ? 'Generating...' : 'Generate Full Report'}
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Dataset</p>
            <p className="mt-2 text-sm text-slate-300">{datasetName}</p>
            <p className="mt-1 text-xs text-slate-500">Version: {datasetVersion}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Generated</p>
            <p className="mt-2 text-sm text-slate-300">{reportData ? formatDate(reportData.formattedAt) : 'Not generated yet'}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Pipeline</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {summarySteps.map((step) => (
                <span key={step.key} className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-[11px] text-slate-300">
                  {step.completed ? <CheckCircle size={12} className="text-emerald-400" /> : <Circle size={12} className="text-slate-500" />}
                  {step.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-700 bg-red-950/60 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Report Preview</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Latest generated report</h2>
            </div>
            <button
              onClick={() => downloadPDF({ payload: reportData })}
              disabled={!reportData || isDownloading}
              className="inline-flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {reportData ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Report Name</p>
                    <p className="mt-2 text-sm text-slate-200">{selectedReport?.reportName || reportData.metadata.datasetName}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Dataset Version</p>
                    <p className="mt-2 text-sm text-slate-200">{selectedReport?.datasetVersion || datasetVersion}</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Dataset Overview</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                      <li>Rows: {reportData.dataset.metadata.rows?.toLocaleString() || 'N/A'}</li>
                      <li>Columns: {reportData.dataset.metadata.columns || 'N/A'}</li>
                      <li>Missing %: {_safePercent(reportData.dataset.nullPercentages)}</li>
                    </ul>
                  </section>

                  <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AI Insights</p>
                    <p className="mt-3 text-sm text-slate-300">
                      {reportData.ai.totalRecommendations} recommendations generated
                    </p>
                  </section>
                </div>

                <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Summary</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-950/80 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Key Concerns</p>
                      <p className="mt-2 text-sm text-slate-300">{reportData.summary.keyConcerns.length} issues</p>
                    </div>
                    <div className="rounded-xl bg-slate-950/80 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Recommended Actions</p>
                      <p className="mt-2 text-sm text-slate-300">{reportData.summary.recommendedActions.length} actions</p>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-8 text-center text-sm text-slate-500">
                Generate a report to preview its contents here.
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-blue-400" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Saved Versions</p>
              <h2 className="text-lg font-semibold text-white">Report History</h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {history.length > 0 ? (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectHistory(item.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${item.id === selectedId ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900/90'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.reportName}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(item.generatedAt)}</p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">V{item.datasetVersion}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-500">
                No saved report versions yet. Generate one and it will appear here.
              </div>
            )}
          </div>

          {selectedReport && (
            <div className="mt-6 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Selected Version</p>
              <p className="text-sm font-semibold text-white">{selectedReport.reportName}</p>
              <p className="text-xs text-slate-500">{formatDate(selectedReport.generatedAt)}</p>
              <button
                onClick={() => downloadPDF(selectedReport)}
                disabled={isDownloading}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={14} />
                Download Selected PDF
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function _safePercent(nullPercentages) {
  if (!nullPercentages || typeof nullPercentages !== 'object') return 'N/A';
  const values = Object.values(nullPercentages).map((entry) => Number(entry?.percentage || 0));
  if (!values.length) return '0.00%';
  return `${(values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)}%`;
}
