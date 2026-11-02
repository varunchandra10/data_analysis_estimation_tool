import { useMemo, useState } from 'react';
import {
  Activity,
  Clock3,
  Layers3,
  FileClock,
  ShieldCheck,
  Database,
  AlertTriangle,
  Users,
  Scale,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react';
import { StatusBadge, SearchInput, FilterButtonGroup } from './common';

function formatTimestamp(value) {
  if (!value) return 'Unknown time';
  const clean = typeof value === 'string' ? value.replace(' ', 'T') : value;
  const date = new Date(clean);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getOperationMeta(operation = '') {
  const norm = operation.toLowerCase();
  if (norm.includes('missing') || norm.includes('imput')) {
    return {
      variant: 'blue',
      icon: Database,
      label: 'Imputation',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800/60',
    };
  }
  if (norm.includes('outlier')) {
    return {
      variant: 'amber',
      icon: AlertTriangle,
      label: 'Outlier Trimming',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800/60',
    };
  }
  if (norm.includes('duplicate') || norm.includes('dedup')) {
    return {
      variant: 'purple',
      icon: Users,
      label: 'Deduplication',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-200 dark:border-purple-800/60',
    };
  }
  if (norm.includes('validat') || norm.includes('rule')) {
    return {
      variant: 'emerald',
      icon: ShieldCheck,
      label: 'Validation',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/60',
    };
  }
  if (norm.includes('weight') || norm.includes('rake') || norm.includes('ipf')) {
    return {
      variant: 'indigo',
      icon: Scale,
      label: 'Calibration',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-200 dark:border-indigo-800/60',
    };
  }
  return {
    variant: 'slate',
    icon: FileClock,
    label: 'Pipeline Step',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800',
    border: 'border-slate-200 dark:border-slate-700',
  };
}

function TimelineEvent({ event, index, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const meta = getOperationMeta(event.operation);
  const Icon = meta.icon;
  const rowsAffected = Number(event.rows_affected || event.details?.rows_affected || 0);

  const handleCopyPayload = () => {
    if (!event.details) return;
    navigator.clipboard.writeText(JSON.stringify(event.details, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex gap-4">
      {/* Step Icon Column & Connecting Line */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${meta.border} ${meta.bg} ${meta.color} shadow-xs transition-transform hover:scale-105`}
        >
          <Icon size={18} />
        </div>
        {!isLast && (
          <div className="mt-2 h-full w-0.5 bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-900" />
        )}
      </div>

      {/* Step Content Card */}
      <div className="min-w-0 flex-1 pb-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-white truncate">
                  {event.operation || 'Pipeline Operation'}
                </h4>
                <StatusBadge variant={meta.variant} size="xs">
                  {meta.label}
                </StatusBadge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={12} className="text-slate-400" />
                  {formatTimestamp(event.timestamp || event.created_at)}
                </span>
                {rowsAffected > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Layers3 size={12} />
                    <strong>{rowsAffected.toLocaleString()}</strong> rows transformed
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans pt-1">
                {event.details?.note ||
                  event.details?.description ||
                  event.message ||
                  'Immutable pipeline transaction recorded in the survey ledger.'}
              </p>
            </div>

            {/* Event Sequence Counter Pill */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-mono text-slate-400 shrink-0 self-start">
              <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Event #{String(index + 1).padStart(2, '0')}
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {rowsAffected.toLocaleString()} rows
              </div>
            </div>
          </div>

          {/* Collapsible Details Payload */}
          {event.details && Object.keys(event.details).length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <Activity size={12} />
                  <span>{expanded ? 'Hide Payload Parameters' : 'View Payload Parameters'}</span>
                  {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {expanded && (
                  <button
                    type="button"
                    onClick={handleCopyPayload}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                )}
              </div>

              {expanded && (
                <div className="mt-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 overflow-x-auto max-h-60 custom-scrollbar">
                  <pre>{JSON.stringify(event.details, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Enterprise TimelinePanel Component
 * Audit trail visualizer presenting immutable chronological pipeline ledger records,
 * transformation metrics, payload parameter inspectors, and category filters.
 */
export default function TimelinePanel({
  datasetName = 'dataset',
  logs = [],
  loading = false,
  error = '',
  lastSynchronized = '',
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    let result = logs;

    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter((event) => {
        const norm = (event.operation || '').toLowerCase();
        if (categoryFilter === 'imputation') return norm.includes('missing') || norm.includes('imput');
        if (categoryFilter === 'outliers') return norm.includes('outlier');
        if (categoryFilter === 'duplicates') return norm.includes('duplicate') || norm.includes('dedup');
        if (categoryFilter === 'validation') return norm.includes('validat') || norm.includes('rule');
        if (categoryFilter === 'weighting') return norm.includes('weight') || norm.includes('rake') || norm.includes('ipf');
        return true;
      });
    }

    // Filter by search query
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((event) => {
        const blob = [
          event.operation,
          event.timestamp,
          event.created_at,
          event.rows_affected,
          JSON.stringify(event.details || {}),
        ]
          .join(' ')
          .toLowerCase();
        return blob.includes(term);
      });
    }

    return result;
  }, [logs, categoryFilter, searchTerm]);

  const summary = useMemo(() => {
    const totalRows = logs.reduce(
      (acc, curr) => acc + Number(curr.rows_affected || curr.details?.rows_affected || 0),
      0
    );
    return {
      total: logs.length,
      totalRows,
      first: logs[logs.length - 1]?.timestamp || logs[logs.length - 1]?.created_at,
      last: logs[0]?.timestamp || logs[0]?.created_at,
    };
  }, [logs]);

  return (
    <section
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs font-sans text-slate-800 dark:text-slate-100 transition-all ${className}`}
    >
      {/* 1. Panel Header Bar */}
      <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Audit Ledger
            </span>
            <StatusBadge variant="indigo" size="xs">
              Immutable Trace
            </StatusBadge>
          </div>

          <h3 className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
            Pipeline Audit & Transformation Timeline
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Cryptographic ledger tracking all transformations, imputations, demographic raking passes, and validation
            enforcements for <strong>{datasetName}</strong>.
          </p>
        </div>

        {/* Summary Metric Strip */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-center shadow-2xs">
            <div className="text-[9px] uppercase font-bold text-slate-400">Total Steps</div>
            <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">{summary.total}</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-center shadow-2xs">
            <div className="text-[9px] uppercase font-bold text-slate-400">Rows Affected</div>
            <div className="mt-0.5 text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {summary.totalRows.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-center shadow-2xs">
            <div className="text-[9px] uppercase font-bold text-slate-400">Latest Event</div>
            <div className="mt-0.5 text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
              {summary.last ? formatTimestamp(summary.last) : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <FilterButtonGroup
          options={[
            { id: 'all', label: 'All Events', badge: logs.length },
            { id: 'imputation', label: 'Imputation' },
            { id: 'duplicates', label: 'Deduplication' },
            { id: 'outliers', label: 'Outliers' },
            { id: 'validation', label: 'Validation' },
            { id: 'weighting', label: 'Weighting' },
          ]}
          activeId={categoryFilter}
          onChange={setCategoryFilter}
          size="sm"
        />

        <div className="w-full lg:w-72">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search audit ledger..."
          />
        </div>
      </div>

      {/* 3. Loading, Error & Empty States */}
      {loading && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-10 text-center font-mono text-xs text-slate-500">
          Loading audit trail ledger records...
        </div>
      )}

      {error && !loading && (
        <div className="mt-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-mono text-rose-800 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && filteredLogs.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-10 text-center font-mono text-xs text-slate-500">
          No audit ledger records match the selected filter criteria.
        </div>
      )}

      {/* 4. Chronological Step Sequence */}
      {!loading && !error && filteredLogs.length > 0 && (
        <div className="mt-8 space-y-0">
          {filteredLogs.map((event, index) => (
            <TimelineEvent
              key={`${event.timestamp || event.created_at || index}-${index}`}
              event={event}
              index={index}
              isLast={index === filteredLogs.length - 1}
            />
          ))}
        </div>
      )}

      {/* 5. Footer Sync Information */}
      {lastSynchronized && (
        <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Ledger state: Synchronized</span>
          <span>Last polled: {lastSynchronized}</span>
        </div>
      )}
    </section>
  );
}
