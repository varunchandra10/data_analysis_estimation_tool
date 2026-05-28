import { useMemo, useState } from 'react';
import { Activity, Clock3, Layers3, Search, ChevronRight, FileClock, ShieldCheck } from 'lucide-react';

function formatTimestamp(value) {
  if (!value) return 'Unknown time';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function operationTone(operation = '') {
  const normalized = operation.toLowerCase();
  if (normalized.includes('missing')) return 'blue';
  if (normalized.includes('outlier')) return 'rose';
  if (normalized.includes('validation')) return 'amber';
  if (normalized.includes('duplicate')) return 'violet';
  if (normalized.includes('weight')) return 'cyan';
  return 'emerald';
}

function TonePill({ tone, children }) {
  const palette = {
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    violet: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${palette[tone]}`}>
      {children}
    </span>
  );
}

function TimelineEvent({ event, index, isLast }) {
  const tone = operationTone(event.operation);

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-950 shadow-lg ${tone === 'rose' ? 'text-rose-300' : tone === 'blue' ? 'text-blue-300' : tone === 'amber' ? 'text-amber-300' : tone === 'violet' ? 'text-violet-300' : tone === 'cyan' ? 'text-cyan-300' : 'text-emerald-300'}`}>
          <FileClock size={16} />
        </div>
        {!isLast && <div className="mt-2 h-full w-px bg-gradient-to-b from-slate-700 to-transparent" />}
      </div>

      <div className="min-w-0 flex-1 pb-6">
        <div className="rounded-2xl border border-slate-800 bg-[#0b1329] p-4 shadow-xl shadow-slate-950/20 transition hover:border-slate-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate text-sm font-semibold text-slate-100">{event.operation || 'Operation'}</h4>
                <TonePill tone={tone}>{tone}</TonePill>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5"><Clock3 size={12} /> {formatTimestamp(event.timestamp)}</span>
                <span className="inline-flex items-center gap-1.5"><Layers3 size={12} /> {Number(event.rows_affected || 0).toLocaleString()} affected rows</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                {event.details?.note || event.details?.description || 'Recorded pipeline step from the audit ledger.'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 uppercase tracking-wider text-slate-500">
                <ShieldCheck size={12} /> Event {String(index + 1).padStart(2, '0')}
              </div>
              <div className="mt-1 font-mono text-slate-200">{event.rows_affected || 0}</div>
            </div>
          </div>

          {event.details && Object.keys(event.details).length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <Activity size={12} /> Detail Payload
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] leading-relaxed text-cyan-200">
                {JSON.stringify(event.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TimelinePanel({
  datasetName,
  logs = [],
  loading,
  error
}) {
  const [searchTerm, setSearchTerm] = useState('');


  const filteredLogs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return logs;
    return logs.filter((event) => {
      const blob = [event.operation, event.timestamp, event.rows_affected, JSON.stringify(event.details || {})].join(' ').toLowerCase();
      return blob.includes(term);
    });
  }, [logs, searchTerm]);

  const summary = useMemo(() => ({
    total: logs.length,
    first: logs[logs.length - 1]?.timestamp,
    last: logs[0]?.timestamp,
  }), [logs]);

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-[#08101f] p-5 shadow-2xl shadow-slate-950/40">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
            <ChevronRight size={12} className="text-cyan-400" /> Audit Timeline
          </div>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">Full Dataset History</h3>
          <p className="mt-1 text-sm text-slate-500">Chronological operational record for {datasetName || 'selected dataset'}.</p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Events</div>
            <div className="mt-1 font-mono text-slate-100">{summary.total}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">First</div>
            <div className="mt-1 font-mono text-slate-100">{formatTimestamp(summary.first)}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Latest</div>
            <div className="mt-1 font-mono text-slate-100">{formatTimestamp(summary.last)}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-400">Search the history by operation, timestamp, or payload content.</div>
        <div className="relative w-full sm:max-w-sm">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit history"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-sm text-slate-400">
          Loading audit timeline...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {!loading && !error && filteredLogs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 p-10 text-center text-sm text-slate-500">
          No audit events found for this dataset.
        </div>
      )}

      {!loading && !error && filteredLogs.length > 0 && (
        <div className="space-y-0">
          {filteredLogs.map((event, index) => (
            <TimelineEvent
              key={`${event.timestamp}-${index}`}
              event={event}
              index={index}
              isLast={index === filteredLogs.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}
