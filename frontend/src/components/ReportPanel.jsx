import React from 'react';
import { Circle, CheckCircle } from 'lucide-react';
import InfoTooltip from './UI/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';

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
  versionName,
  datasetName,
  loading,
  error,
  reportPath,
  onGenerate
}) {
  const generate = () => {
    onGenerate();
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#08101f] p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs uppercase text-slate-500">
            <span>Report</span>
            <InfoTooltip {...getTooltipContent('report')} iconSize={12} className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">Generate PDF Report</h3>
          <div className="text-sm text-slate-400">Version: <span className="font-mono">{versionName}</span></div>
        </div>
        <div>
          <button 
            className="rounded bg-cyan-600 px-3 py-2 text-white" 
            onClick={generate} 
            data-testid="report-generate-btn"
            disabled={loading || !versionName}
          >
            {loading ? 'Generating...' : 'Generate PDF'}
          </button>
          <div className="mt-2">
            <InfoTooltip {...getTooltipContent('report')} iconSize={12} className="h-5 w-5" />
          </div>
        </div>
      </div>

      {error && <div className="mt-4 text-rose-300">{error}</div>}

      {reportPath && (
        <div className="mt-4">
          <a 
            className="text-cyan-300" 
            href={reportPath} 
            data-testid="report-download-link"
            target="_blank" 
            rel="noreferrer"
          >
            Download report
          </a>
          <span className="ml-2 inline-block align-middle">
            <InfoTooltip {...getTooltipContent('reportDownload')} iconSize={12} className="h-4 w-4" />
          </span>
          <div className="text-xs text-slate-500">Saved path: {reportPath}</div>
        </div>
      )}
    </section>
  );
}
