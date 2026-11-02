import { useMemo, useId } from 'react';
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
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Enterprise Custom Tooltip
 * High-contrast, theme-adaptive floating popover displaying scalar magnitude,
 * distribution share percentage, and raw dimensional vector context.
 */
const CustomTooltip = ({ active, payload, label, unit, isDark, totalSum }) => {
  if (active && payload && payload.length) {
    const rawVal = payload[0].value;
    const numVal = Number(rawVal);
    const percent =
      totalSum && totalSum > 0 && Number.isFinite(numVal)
        ? ((numVal / totalSum) * 100).toFixed(1) + '%'
        : null;

    return (
      <div
        className={`p-3.5 shadow-2xl rounded-xl border backdrop-blur-md font-mono select-none transition-all duration-150 min-w-[160px] ${
          isDark
            ? 'bg-slate-950/95 text-slate-100 border-slate-800'
            : 'bg-white/95 text-slate-900 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-2 border-b border-slate-200 dark:border-slate-800/80 pb-1.5">
          <p
            className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans truncate max-w-[190px]"
            title={String(label)}
          >
            {label}
          </p>
          {percent && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shrink-0">
              {percent}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Magnitude:
          </span>
          <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {Number.isFinite(numVal) ? numVal.toLocaleString() : rawVal}
            {unit ? ` ${unit}` : ''}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Enhanced BarChartComponent
 * Enterprise-grade statistical visualization primitive with adaptive light/dark theming,
 * SVG linear gradient fills, intelligent label truncation, and dynamic bar sizing.
 */
const BarChartComponent = ({
  data,
  xKey,
  yKey,
  color = '#818cf8',
  xLabel = 'Dimension Variables',
  yLabel = 'Frequency / Magnitude',
  unit = '',
  showGrid = true,
  showMeanLine = false,
  className = '',
  onBarClick = null,
}) => {
  const chartId = useId().replace(/:/g, '');
  const { isDark = true } = useTheme();

  // Calculate sum and mean across numerical observations
  const { totalSum, meanValue } = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { totalSum: 0, meanValue: 0 };
    }
    let sum = 0;
    let count = 0;
    for (const d of data) {
      const val = Number(d[yKey]);
      if (Number.isFinite(val)) {
        sum += val;
        count += 1;
      }
    }
    return { totalSum: sum, meanValue: count > 0 ? sum / count : 0 };
  }, [data, yKey]);

  // Adaptive bar sizing
  const barWidth = useMemo(() => {
    if (!data || data.length === 0) return 24;
    return Math.max(12, Math.min(32, Math.floor(480 / Math.max(data.length, 1))));
  }, [data]);

  // Empty State Guard
  if (!data || data.length === 0) {
    return (
      <div
        className={`w-full h-full min-h-[350px] flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 font-mono text-xs select-none ${className}`}
      >
        <BarChart2
          size={32}
          className="text-slate-300 dark:text-slate-700 mb-2.5 stroke-[1.5]"
        />
        <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
          No Distribution Data
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
          Awaiting dimensional aggregation or metric inputs
        </p>
      </div>
    );
  }

  // Format tick labels to avoid horizontal text overlap
  const formatXAxisTick = (val) => {
    if (typeof val !== 'string') return val;
    return val.length > 13 ? `${val.slice(0, 11)}..` : val;
  };

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
      {/* Visual Metadata Overlay */}
      <div className="absolute top-0 right-2 flex items-center gap-3 z-10 pointer-events-none select-none">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xs text-[10px] font-mono">
          <span className="text-slate-400 uppercase font-bold">Vector Points:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {data.length}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-400 uppercase font-bold">Scale:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            Linear
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 25, right: 15, left: 10, bottom: 65 }}
        >
          {/* Subtle Linear Gradient Definition */}
          <defs>
            <linearGradient id={`barGrad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.95} />
              <stop offset="100%" stopColor={color} stopOpacity={0.65} />
            </linearGradient>
            <linearGradient id={`barHoverGrad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a5b4fc" stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.85} />
            </linearGradient>
          </defs>

          {/* Dynamic Theme Grid */}
          {showGrid && (
            <CartesianGrid
              strokeDasharray="2 4"
              vertical={true}
              stroke={gridStroke}
            />
          )}

          {/* Dimension Horizontal X-Axis */}
          <XAxis
            dataKey={xKey}
            axisLine={{ stroke: axisStroke, strokeWidth: 1 }}
            tickLine={{ stroke: axisStroke }}
            tickFormatter={formatXAxisTick}
            tick={{
              fill: tickFill,
              fontSize: 10,
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

          {/* Magnitude Vertical Y-Axis */}
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
            tickFormatter={(val) => {
              const num = Number(val);
              if (!Number.isFinite(num)) return val;
              if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
              if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
              return num.toLocaleString();
            }}
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

          {/* Interactive Floating Tooltip */}
          <Tooltip
            content={
              <CustomTooltip
                unit={unit}
                isDark={isDark}
                totalSum={totalSum}
              />
            }
            cursor={{ fill: cursorFill }}
            animationDuration={150}
          />

          {/* Optional Mean Reference Line */}
          {showMeanLine && meanValue > 0 && (
            <ReferenceLine
              y={meanValue}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              label={{
                value: `μ = ${meanValue.toFixed(1)}`,
                fill: isDark ? '#fbbf24' : '#d97706',
                fontSize: 10,
                position: 'right',
                fontFamily: 'monospace',
              }}
            />
          )}

          {/* Enhanced Bar Series */}
          <Bar
            dataKey={yKey}
            fill={`url(#barGrad-${chartId})`}
            radius={[5, 5, 0, 0]}
            barSize={barWidth}
            animationBegin={0}
            animationDuration={450}
            onClick={onBarClick}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                className="hover:opacity-90 transition-opacity duration-150 cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
