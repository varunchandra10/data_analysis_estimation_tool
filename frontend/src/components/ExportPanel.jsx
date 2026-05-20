import { useMemo, useState } from 'react';
import axios from 'axios';
import { Download, Archive, Lock, FileSpreadsheet, FileArchive, FileJson2 } from 'lucide-react';
import { DEFAULT_PROJECT_ID, apiUrl } from '../api/config';

const FORMATS = [
  { value: 'csv', label: 'CSV', icon: FileJson2, description: 'Portable comma-separated export' },
  { value: 'xlsx', label: 'XLSX', icon: FileSpreadsheet, description: 'Spreadsheet-ready workbook' },
  { value: 'zip', label: 'ZIP', icon: FileArchive, description: 'Compressed archive bundle' },
  { value: 'encrypted_zip', label: 'Encrypted', icon: Lock, description: 'Encrypted zipped archive' },
];

function filenameFromPath(path, fallback = 'dataset') {
  if (!path) return fallback;
  const name = path.split(/[\\/]/).pop() || fallback;
  return name.replace(/\.[^.]+$/, '');
}

export default function ExportPanel({ datasetData }) {
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [archiveKeepLatest, setArchiveKeepLatest] = useState(2);
  const [loading, setLoading] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const sourcePath = datasetData?.metadata?.file_path || datasetData?.metadata?.filePath || '';
  const datasetName = datasetData?.metadata?.dataset_name || datasetData?.metadata?.filename?.replace(/\.[^.]+$/, '') || 'dataset';
  const exportLabel = useMemo(() => FORMATS.find((item) => item.value === selectedFormat)?.label || 'CSV', [selectedFormat]);

  const downloadExport = async () => {
    if (!sourcePath) {
      setError('No dataset file path is available for export.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(
        apiUrl('/api/versioning/export'),
        {
          file_path: sourcePath,
          dataset_name: datasetName,
          format: selectedFormat,
          ...(DEFAULT_PROJECT_ID ? { project_id: DEFAULT_PROJECT_ID } : {}),
        },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const baseName = filenameFromPath(sourcePath, datasetName);
      link.download = selectedFormat === 'encrypted_zip' ? `${baseName}.zip.enc` : `${baseName}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setMessage(`${exportLabel} export generated successfully.`);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to export dataset.');
    } finally {
      setLoading(false);
    }
  };

  const archiveOldVersions = async () => {
    setArchiveLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await axios.post(apiUrl('/api/versioning/archive/old'), {
        ...(DEFAULT_PROJECT_ID ? { project_id: DEFAULT_PROJECT_ID } : {}),
        keep_latest: archiveKeepLatest,
        key: undefined,
      });
      const archivedCount = response.data?.archived_paths?.length || 0;
      setMessage(`Archived ${archivedCount} older version${archivedCount === 1 ? '' : 's'}.`);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to archive old versions.');
    } finally {
      setArchiveLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#08101f] p-5 shadow-2xl shadow-slate-950/40">
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
            <Download size={12} className="text-cyan-400" /> Export & Archival
          </div>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">Enterprise Dataset Export</h3>
          <p className="mt-1 text-sm text-slate-500">Download the active dataset or archive older versions while preserving lineage metadata.</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-400">
          <div className="uppercase tracking-wider text-slate-500">Source</div>
          <div className="mt-1 font-mono text-slate-100">{datasetName}</div>
        </div>
      </div>

      {error && <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
      {message && <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div>}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Export Format</div>
          <div className="grid gap-3 md:grid-cols-2">
            {FORMATS.map((format) => {
              const Icon = format.icon;
              const active = selectedFormat === format.value;
              return (
                <button
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value)}
                  className={`rounded-2xl border p-4 text-left transition ${active ? 'border-cyan-500/40 bg-cyan-500/10 shadow-lg shadow-cyan-950/20' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl border p-2 ${active ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' : 'border-slate-800 bg-slate-900 text-slate-400'}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-100">{format.label}</div>
                      <div className="text-xs text-slate-500">{format.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={downloadExport}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/20 transition hover:scale-[1.01] disabled:opacity-50"
          >
            <Download size={16} /> {loading ? 'Exporting...' : `Download ${exportLabel}`}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            <Archive size={12} className="text-violet-400" /> Version Archival
          </div>
          <div className="mt-3 text-sm text-slate-400">Compress and archive older versions while retaining the latest {archiveKeepLatest} live entries.</div>
          <label className="mt-4 block text-xs uppercase tracking-[0.18em] text-slate-500">Keep Latest</label>
          <input
            type="number"
            min="1"
            value={archiveKeepLatest}
            onChange={(e) => setArchiveKeepLatest(Number(e.target.value) || 1)}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-violet-500"
          />

          <button
            onClick={archiveOldVersions}
            disabled={archiveLoading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/15 disabled:opacity-50"
          >
            <Archive size={16} /> {archiveLoading ? 'Archiving...' : 'Archive Old Versions'}
          </button>
        </div>
      </div>
    </section>
  );
}
