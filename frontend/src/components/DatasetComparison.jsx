import { useMemo } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Database,
  Layers3,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
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

const METRIC_META = {
  missing_reduction: { label: 'Missing reduction', color: '#22c55e', icon: Database },
  duplicate_reduction: { label: 'Duplicate reduction', color: '#38bdf8', icon: Layers3 },
  outlier_reduction: { label: 'Outlier reduction', color: '#f97316', icon: AlertTriangle },
  validation_improvement: { label: 'Validation improvement', color: '#a78bfa', icon: ShieldCheck },
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

function MetricCard({ meta, comparison }) {
  const Icon = meta.icon;
  const delta = comparison?.delta ?? 0;
  const improved = Boolean(comparison?.improved);

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0b1329] p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            <Icon size={12} className="text-slate-400" />
            {meta.label}
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-100">{formatDelta(delta)}</div>
          <div className="mt-1 text-[11px] text-slate-500">
            {comparison?.before ?? 0} → {comparison?.after ?? 0}
          </div>
        </div>
        <div className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${improved ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
          {improved ? 'Improved' : 'Flat'}
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-900">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(Math.abs(comparison?.reduction_percent ?? 0), 100)}%`, backgroundColor: meta.color }}
        />
      </div>
      <div className="mt-2 text-[11px] text-slate-500">
        {comparison?.reduction_percent ?? 0}% reduction
      </div>
    </div>
  );
}

function ComparisonPanel({ title, result, loading, error }) {
  const chartRows = useMemo(() => buildChartRows(result), [result]);

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#08101f] p-5 shadow-2xl shadow-slate-950/40">
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
            <BarChart3 size={12} className="text-cyan-400" />
            Comparison Snapshot
          </div>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {result?.summary?.compare || 'Awaiting comparison data'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs font-mono text-slate-400">
          {result?.dataset_name || 'No dataset selected'}
        </div>
      </div>

      {loading && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
          Loading comparison...
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {!loading && !error && result && (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(METRIC_META).map(([key, meta]) => (
              <MetricCard key={key} meta={meta} comparison={result.comparison?.[key]} />
            ))}
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-xl border border-slate-800 bg-[#0b1329] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Before / After</div>
                  <div className="text-sm text-slate-200">Measured data quality impact</div>
                </div>
                <TrendingDown size={16} className="text-emerald-400" />
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartRows} margin={{ top: 10, right: 20, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#e2e8f0' }}
                    />
                    <Legend />
                    <Bar dataKey="before" fill="#64748b" radius={[6, 6, 0, 0]} name="Before">
                      <LabelList dataKey="before" position="top" fill="#cbd5e1" fontSize={11} />
                    </Bar>
                    <Bar dataKey="after" fill="#22c55e" radius={[6, 6, 0, 0]} name="After">
                      {chartRows.map((entry) => (
                        <Cell key={entry.metric} fill={entry.color} />
                      ))}
                      <LabelList dataKey="after" position="top" fill="#cbd5e1" fontSize={11} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0b1329] p-4">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                <TrendingUp size={12} className="text-cyan-400" />
                Summary
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Overall improvement</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-100">
                    {formatDelta(result?.summary?.overall_improvement ?? 0)}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Left version</div>
                  <div className="font-mono text-slate-100">{result?.left_version?.version}</div>
                  <div className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">Right version</div>
                  <div className="font-mono text-slate-100">{result?.right_version?.version}</div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Validation status</div>
                  <div className="mt-1 text-slate-100">
                    {result?.comparison?.validation_improvement?.improved ? 'Improved validation quality' : 'No validation gain detected'}
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
  defaultPairs = []
}) {
  return (
    <div className="space-y-5 px-4 sm:px-6 pb-12 max-w-[1600px] mx-auto">
      <div className="rounded-2xl border border-slate-800 bg-[#08101f] p-5 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              <BarChart3 size={12} className="text-cyan-400" />
              Dataset Comparison Engine
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-slate-100">Measured preprocessing impact</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Compare versions to quantify what changed, not just that a chart exists.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs font-mono text-slate-400">
            {versions.length} versions indexed for {datasetName}
          </div>
        </div>
      </div>

      {loading && !Object.keys(results).length ? (
        <div className="rounded-2xl border border-slate-800 bg-[#08101f] p-5 text-sm text-slate-400">
          <RefreshCw size={14} className="mr-2 inline animate-spin" /> Loading comparisons...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5">
        {defaultPairs.map((pair) => (
          <ComparisonPanel
            key={pair.label}
            title={pair.label}
            result={results[pair.label]}
            loading={loading && !results[pair.label]}
            error={error && !results[pair.label] ? error : ''}
          />
        ))}
      </div>
    </div>
  );
}

