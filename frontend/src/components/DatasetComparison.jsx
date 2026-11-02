import React, { useMemo } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Database,
  Layers3,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StatusBadge, MetricStatCard } from './common';

const METRIC_META = {
  missing_reduction: {
    label: 'Missing Reduction',
    color: '#10b981', // emerald-500
    variant: 'emerald',
    icon: Database,
    description: 'Empty or null values resolved via imputation or removal',
  },
  duplicate_reduction: {
    label: 'Duplicate Reduction',
    color: '#0ea5e9', // sky-500
    variant: 'blue',
    icon: Layers3,
    description: 'Redundant rows eliminated to prevent sampling bias',
  },
  outlier_reduction: {
    label: 'Outlier Reduction',
    color: '#f59e0b', // amber-500
    variant: 'amber',
    icon: AlertTriangle,
    description: 'Anomalous records adjusted or trimmed to baseline fences',
  },
  validation_improvement: {
    label: 'Validation Improvement',
    color: '#8b5cf6', // purple-500
    variant: 'purple',
    icon: ShieldCheck,
    description: 'Logic constraints and business rule violations cleared',
  },
};

function formatDelta(value) {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
}

function buildChartRows(result) {
  if (!result?.comparison) return [];

  return Object.entries(METRIC_META).map(([key, meta]) => {
    const item = result.comparison[key];
    return {
      metric: meta.label,
      before: item?.before ?? 0,
      after: item?.after ?? 0,
      delta: item?.delta ?? 0,
      percent: item?.reduction_percent ?? 0,
      color: meta.color,
    };
  });
}

function EnhancedMetricCard({ meta, comparison }) {
  const Icon = meta.icon;
  const delta = comparison?.delta ?? 0;
  const before = comparison?.before ?? 0;
  const after = comparison?.after ?? 0;
  const percent = comparison?.reduction_percent ?? 0;
  const improved = Boolean(comparison?.improved);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all font-sans">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
            <Icon size={14} />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {meta.label}
          </span>
        </div>

        <StatusBadge variant={improved ? 'emerald' : 'slate'} size="xs" dot={improved}>
          {improved ? 'Improved' : 'Stable'}
        </StatusBadge>
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-1">
        <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
          {formatDelta(delta)}
        </div>
        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
          {percent}% reduction
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1">
        <span>Before: <strong className="text-slate-700 dark:text-slate-300">{before}</strong></span>
        <span>→</span>
        <span>After: <strong className="text-slate-700 dark:text-slate-300">{after}</strong></span>
      </div>

      {/* Reduction Progress Bar */}
      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(Math.abs(percent), 100)}%`,
            backgroundColor: meta.color,
          }}
        />
      </div>
    </div>
  );
}

function ComparisonPanel({ title, result, loading, error }) {
  const chartRows = useMemo(() => buildChartRows(result), [result]);

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all font-sans">
      {/* Panel Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <BarChart3 size={13} />
            <span>Differential Snapshot</span>
          </div>
          <h3 className="mt-0.5 text-base font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {result?.summary?.compare || 'Comparing preprocessing vector deltas across state snapshots.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {result?.left_version && result?.right_version && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
              <span className="text-slate-400">{result.left_version.version}</span>
              <ArrowRight size={12} className="text-indigo-500" />
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {result.right_version.version}
              </span>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-500 font-mono">
          <RefreshCw size={14} className="mr-2 animate-spin text-indigo-500" />
          <span>Computing version delta comparison...</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-xs font-mono text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && result && (
        <>
          {/* 4 Metric KPI Cards */}
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(METRIC_META).map(([key, meta]) => (
              <EnhancedMetricCard key={key} meta={meta} comparison={result.comparison?.[key]} />
            ))}
          </div>

          {/* Chart & Summary Row */}
          <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
            {/* Before vs After Dual Bar Chart */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Before vs After
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                    Measured Data Quality Impact
                  </div>
                </div>
                <TrendingDown size={16} className="text-emerald-500" />
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartRows} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} vertical={false} />
                    <XAxis
                      dataKey="metric"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#f8fafc',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="before" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Before">
                      <LabelList dataKey="before" position="top" fill="#64748b" fontSize={10} />
                    </Bar>
                    <Bar dataKey="after" fill="#10b981" radius={[4, 4, 0, 0]} name="After">
                      {chartRows.map((entry) => (
                        <Cell key={entry.metric} fill={entry.color} />
                      ))}
                      <LabelList dataKey="after" position="top" fill="#64748b" fontSize={10} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Differential Summary Scorecard */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 p-4 flex flex-col justify-between">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    <TrendingUp size={12} className="text-indigo-500" />
                    <span>Quality Synthesis</span>
                  </div>
                  <StatusBadge variant="indigo" size="xs">
                    Automated
                  </StatusBadge>
                </div>

                <div className="space-y-3 font-mono">
                  {/* Overall Improvement */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Overall Net Delta
                    </div>
                    <div className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {formatDelta(result?.summary?.overall_improvement ?? 0)}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-sans">
                      Composite reduction index across all anomaly vectors
                    </p>
                  </div>

                  {/* Version Lineage Card */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs shadow-2xs">
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Base Version:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {result?.left_version?.version || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 pt-1.5">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Target Version:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {result?.right_version?.version || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Validation Status */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Validation Integrity
                      </div>
                      <div className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
                        {result?.comparison?.validation_improvement?.improved
                          ? 'Optimal Rule Conformity'
                          : 'No Violation Shifts'}
                      </div>
                    </div>
                    <CheckCircle2
                      size={18}
                      className={
                        result?.comparison?.validation_improvement?.improved
                          ? 'text-emerald-500'
                          : 'text-slate-400'
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default function DatasetComparison({
  datasetName,
  versions = [],
  results = {},
  loading,
  error,
  defaultPairs = [],
}) {
  return (
    <div className="space-y-5 px-4 sm:px-6 pb-12 max-w-[1650px] mx-auto font-sans text-slate-800 dark:text-slate-100">
      
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              <span>Versioning</span>
              <span>/</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Comparison Engine</span>
            </div>
            <h2 className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
              Pre-Processing Impact Differential
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Quantify measured data quality transformation deltas, missing value reductions, and outlier trimming.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge variant="indigo" size="sm">
              {versions.length} Versions Indexed
            </StatusBadge>
            <StatusBadge variant="slate" size="sm">
              {datasetName || 'Active Buffer'}
            </StatusBadge>
          </div>
        </div>
      </div>

      {loading && !Object.keys(results).length ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw size={14} className="animate-spin text-indigo-500" />
          <span>Indexing versions and computing differential statistics...</span>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-mono text-rose-700 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {/* Comparison Snapshot Panels */}
      <div className="grid gap-5">
        {defaultPairs.length > 0 ? (
          defaultPairs.map((pair) => (
            <ComparisonPanel
              key={pair.label}
              title={pair.label}
              result={results[pair.label]}
              loading={loading && !results[pair.label]}
              error={error && !results[pair.label] ? error : ''}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-xs text-slate-500 font-mono">
            No comparable version pairs available yet. Execute pipeline steps (cleaning, imputation, outlier detection) to generate comparative milestones.
          </div>
        )}
      </div>

    </div>
  );
}
