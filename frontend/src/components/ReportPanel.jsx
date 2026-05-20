import React, { useState } from 'react';
import axios from 'axios';
import { Circle, CheckCircle } from 'lucide-react';
import { DEFAULT_PROJECT_ID, apiUrl } from '../api/config';

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

export default function ReportPanel({ versionName, datasetName }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportPath, setReportPath] = useState('');

  const generate = async () => {
    if (!versionName) return setError('No version selected');
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(apiUrl('/api/report/generate'), {
        version_name: versionName,
        dataset_name: datasetName,
        ...(DEFAULT_PROJECT_ID ? { project_id: DEFAULT_PROJECT_ID } : {}),
      });
      setReportPath(res.data.report_path);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#08101f] p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase text-slate-500">Report</div>
          <h3 className="text-lg font-semibold text-slate-100">Generate PDF Report</h3>
          <div className="text-sm text-slate-400">Version: <span className="font-mono">{versionName}</span></div>
        </div>
        <div>
          <button className="rounded bg-cyan-600 px-3 py-2 text-white" onClick={generate} disabled={loading || !versionName}>
            {loading ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      </div>

      {error && <div className="mt-4 text-rose-300">{error}</div>}

      {reportPath && (
        <div className="mt-4">
          <a className="text-cyan-300" href={`/${reportPath}`} target="_blank" rel="noreferrer">Download report</a>
          <div className="text-xs text-slate-500">Saved path: {reportPath}</div>
        </div>
      )}
    </section>
  );
}
