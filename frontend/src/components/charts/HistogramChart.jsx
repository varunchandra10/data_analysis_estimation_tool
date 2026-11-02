import { useMemo, useId } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Label,
  ReferenceLine,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Technical Tooltip: Prioritizes data density, bin domain, and scalar distribution share.
 */
const CustomTooltip = ({ active, payload, label, isDark, totalObservations }) => {
  if (active && payload && payload.length) {
    const count = Number(payload[0].value ?? 0);
    const percent =
      totalObservations > 0
        ? ((count / totalObservations) * 100).toFixed(1) + '%'
        : null;

    return (
      <div
        className={`p-3.5 shadow-2xl rounded-xl border backdrop-blur-md font-mono select-none min-w-[170px] ${
          isDark
            ? 'bg-slate-950/95 text-slate-100 border-slate-800'
            : 'bg-white/95 text-slate-900 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-1.5 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans">
            Bin Interval Audit
          </p>
          {percent && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              {percent}
            </span>
          )}
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400 font-sans">Interval:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">{label}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400 font-sans">Frequency (n):</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{count.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Enhanced HistogramChart Component
 * Dual-mode histogram renderer: supports pre-computed backend bins [{ range, count }]
 * as well as raw continuous numerical arrays [n1, n2, ...].
 * Features SVG gradient styling, theme adaptation, and empty-state fallbacks.
 */
const HistogramChart = ({
  data,
  color = "#818cf8",
  xLabel = "Continuous Range Binning",
  yLabel = "Frequency Count (n)",
  showGrid = true,
  className = "",
}) => {
  const chartId = useId().replace(/:/g, '');
  const { isDark = true } = useTheme();

  // Normalize data into uniform [{ range, count }] structure
  const { histogram, totalObservations, meanBinCount } = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { histogram: [], totalObservations: 0, meanBinCount: 0 };
    }

    let bins;

    // Mode A: Data is already pre-binned objects from backend [{ range, count }, ...]
    if (typeof data[0] === 'object' && data[0] !== null) {
      bins = data.map((d) => ({
        range: String(d.range || d.bin || d.interval || '0'),
        count: Number(d.count || d.frequency || d.value || 0),
      }));
    } else {
      // Mode B: Data is raw numerical scalar array [12.4, 45.1, ...]
      const values = data.filter((v) => typeof v === 'number' && Number.isFinite(v));
      if (values.length === 0) {
        return { histogram: [], totalObservations: 0, meanBinCount: 0 };
      }

      const min = Math.min(...values);
      const max = Math.max(...values);
      const binCount = Math.max(5, Math.min(20, Math.ceil(Math.sqrt(values.length))));
      const rawSpan = max - min;
      const binSize = rawSpan > 0 ? rawSpan / binCount : 1;

      bins = Array.from({ length: binCount }, (_, i) => {
        const start = min + i * binSize;
        const end = start + binSize;
        const count = values.filter((v) =>
          i === binCount - 1 ? v >= start && v <= max : v >= start && v < end
        ).length;

        return {
          range: `${start.toFixed(1)} - ${end.toFixed(1)}`,
          count,
        };
      });
    }

    const totalObs = bins.reduce((acc, b) => acc + b.count, 0);
    const mean = bins.length > 0 ? totalObs / bins.length : 0;

    return { histogram: bins, totalObservations: totalObs, meanBinCount: mean };
  }, [data]);

  // Empty State Guard
  if (!histogram || histogram.length === 0) {
    return (
      <div
        className={`w-full h-full min-h-[350px] flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 font-mono text-xs select-none ${className}`}
      >
        <BarChart2
          size={32}
          className="text-slate-300 dark:text-slate-700 mb-2.5 stroke-[1.5]"
        />
        <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
          No Histogram Observations
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
          Requires continuous numerical vectors to compute probability density intervals
        </p>
      </div>
    );
  }

  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const axisStroke = isDark ? '#334155' : '#cbd5e1';
  const tickFill = isDark ? '#94a3b8' : '#64748b';
  const cursorFill = isDark
    ? 'rgba(129, 140, 248, 0.05)'
    : 'rgba(99, 102, 241, 0.04)';

  return (
    <div
      className={`w-full h-full min-h-[380px] p-0 bg-transparent relative group font-sans ${className}`}
    >
      {/* Density Metadata Overlay */}
      <div className="absolute top-0 right-2 flex items-center gap-3 z-10 pointer-events-none select-none">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xs text-[10px] font-mono">
          <span className="text-slate-400 uppercase font-bold">Bins:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {histogram.length}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-400 uppercase font-bold">Total Σ:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {totalObservations.toLocaleString()}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={histogram}
          margin={{ top: 25, right: 15, left: 10, bottom: 65 }}
          barCategoryGap={2}
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id={`histGrad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={color} stopOpacity={0.4} />
            </linearGradient>
          </defs>

          {/* Grid */}
          {showGrid && (
            <CartesianGrid
              strokeDasharray="2 4"
              vertical={true}
              stroke={gridStroke}
            />
          )}

          {/* Horizontal X Axis */}
          <XAxis
            dataKey="range"
            axisLine={{ stroke: axisStroke, strokeWidth: 1 }}
            tickLine={{ stroke: axisStroke }}
            tick={{
              fill: tickFill,
              fontSize: 9,
              fontWeight: 500,
              fontFamily: 'ui-monospace, monospace',
            }}
            angle={-30}
            textAnchor="end"
            dy={8}
            interval={0}
          >
            {xLabel && (
              <Label
                value={xLabel}
                offset={-48}
                position="insideBottom"
                className="text-[10px] font-bold uppercase tracking-wider fill-slate-400 dark:fill-slate-500 font-mono"
              />
            )}
          </XAxis>

          {/* Vertical Y Axis */}
          <YAxis
            axisLine={{ stroke: axisStroke, strokeWidth: 1 }}
            tickLine={{ stroke: axisStroke }}
            tick={{
              fill: tickFill,
              fontSize: 10,
              fontWeight: 500,
              fontFamily: 'ui-monospace, monospace',
            }}
            dx={-4}
          >
            {yLabel && (
              <Label
                value={yLabel}
                angle={-90}
                position="insideLeft"
                offset={0}
                style={{ textAnchor: 'middle' }}
                className="text-[10px] font-bold uppercase tracking-wider fill-slate-400 dark:fill-slate-500 font-mono"
              />
            )}
          </YAxis>

          {/* Floating Tooltip */}
          <Tooltip
            content={
              <CustomTooltip
                isDark={isDark}
                totalObservations={totalObservations}
              />
            }
            cursor={{ fill: cursorFill }}
            animationDuration={150}
          />

          {/* Mean Bin Count Line */}
          {meanBinCount > 0 && (
            <ReferenceLine
              y={meanBinCount}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              label={{
                value: `Mean bin: ${meanBinCount.toFixed(0)}`,
                fill: isDark ? '#fbbf24' : '#d97706',
                fontSize: 9,
                position: 'right',
                fontFamily: 'monospace',
              }}
            />
          )}

          {/* Histogram Bars */}
          <Bar
            dataKey="count"
            fill={`url(#histGrad-${chartId})`}
            radius={[4, 4, 0, 0]}
            animationBegin={0}
            animationDuration={450}
          >
            {histogram.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                stroke={color}
                strokeWidth={1}
                className="hover:opacity-90 transition-opacity duration-150 cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistogramChart;
