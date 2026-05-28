import { useMemo } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { Database, AlertTriangle, Users, ShieldCheck } from 'lucide-react';
import InfoTooltip from './UI/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';

function MetricBullet({ icon: Icon, label, value, percent, tooltipKey }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
      <div className="rounded-md bg-slate-800 p-2">
        <Icon size={18} className="text-cyan-300" />
      </div>
      <div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span>{label}</span>
          <InfoTooltip {...getTooltipContent(tooltipKey)} iconSize={12} className="h-4 w-4" />
        </div>
        <div className="text-sm font-semibold text-slate-100">{value} ({percent}%)</div>
      </div>
    </div>
  );
}

export default function QualityScore({ versionName, loading, error, data }) {
  const chartData = useMemo(() => {
    if (!data) return [];
    return [{ name: 'Quality', value: data.score, fill: '#22c55e' }];
  }, [data]);

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#08101f] p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs uppercase text-slate-500">
            <span>Data Quality Score</span>
            <InfoTooltip {...getTooltipContent('qualityScore')} iconSize={12} className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{data ? `${data.score}/100 - ${data.grade}` : 'No data'}</h3>
          <div className="text-sm text-slate-400">Version: <span className="font-mono">{versionName}</span></div>
        </div>
        <div style={{ width: 120, height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={18} data={chartData} startAngle={180} endAngle={-180}>
              <RadialBar minAngle={15} background clockWise dataKey="value" />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {loading && <div className="mt-4 text-sm text-slate-400">Loading quality score...</div>}
      {error && <div className="mt-4 text-sm text-rose-300">{error}</div>}

      {data && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <MetricBullet icon={Database} label="Missing cells" value={data.metrics.missing} percent={data.metrics.missing_pct} tooltipKey="missingCells" />
          <MetricBullet icon={Users} label="Duplicate rows" value={data.metrics.duplicates} percent={data.metrics.duplicate_pct} tooltipKey="duplicateRows" />
          <MetricBullet icon={AlertTriangle} label="Outlier rows" value={data.metrics.outliers} percent={data.metrics.outlier_pct} tooltipKey="outlierRows" />
          <MetricBullet icon={ShieldCheck} label="Validation failures" value={data.metrics.validation_violations} percent={data.metrics.validation_pct} tooltipKey="validationFailures" />
        </div>
      )}
    </section>
  );
}
