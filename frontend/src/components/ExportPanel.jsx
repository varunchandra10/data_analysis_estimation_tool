import { useMemo, useState } from 'react';
import { Download, Archive, Lock, FileSpreadsheet, FileArchive, FileJson2 } from 'lucide-react';
import InfoTooltip from './UI/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';

const FORMATS = [
  { value: 'csv', label: 'CSV', icon: FileJson2, description: 'Portable comma-separated export' },
  { value: 'xlsx', label: 'XLSX', icon: FileSpreadsheet, description: 'Spreadsheet-ready workbook' },
  { value: 'zip', label: 'ZIP', icon: FileArchive, description: 'Compressed archive bundle' },
  { value: 'encrypted_zip', label: 'Encrypted', icon: Lock, description: 'Encrypted zipped archive' },
];

export default function ExportPanel({
  datasetData,
  loading,
  archiveLoading,
  error,
  message,
  onExport,
  onArchive
}) {
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [archiveKeepLatest, setArchiveKeepLatest] = useState(2);

  const datasetName = datasetData?.metadata?.dataset_name || datasetData?.metadata?.filename?.replace(/\.[^.]+$/, '') || 'dataset';
  const exportLabel = useMemo(() => FORMATS.find((item) => item.value === selectedFormat)?.label || 'CSV', [selectedFormat]);

  const downloadExport = () => {
    onExport(selectedFormat);
  };

  const archiveOldVersions = () => {
    onArchive(archiveKeepLatest);
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#08101f] p-5 shadow-2xl shadow-slate-950/40">
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
            <Download size={12} className="text-cyan-400" /> Export & Archival
            <InfoTooltip {...getTooltipContent('exportFormat')} iconSize={12} className="h-4 w-4" />
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
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span>{format.description}</span>
                        {format.value === 'encrypted_zip' && <InfoTooltip {...getTooltipContent('encryptedExport')} iconSize={12} className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={downloadExport}
            data-testid="export-btn"
            disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/20 transition hover:scale-[1.01] disabled:opacity-50"
        >
          <Download size={16} /> {loading ? 'Exporting...' : `Download ${exportLabel}`}
        </button>
        <div className="mt-2">
          <InfoTooltip {...getTooltipContent('exportAction')} iconSize={12} className="h-5 w-5" />
        </div>
      </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            <Archive size={12} className="text-violet-400" /> Version Archival
            <InfoTooltip {...getTooltipContent('archiveVersions')} iconSize={12} className="h-4 w-4" />
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
            data-testid="archive-btn"
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
