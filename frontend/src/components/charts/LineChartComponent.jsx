import { useMemo, useId } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
  Label,
  ReferenceLine,
} from "recharts";
import { Activity } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Technical Tooltip: High-density information display using monospaced fonts for scalar values.
 */
const CustomTooltip = ({ active, payload, label, unit, isDark }) => {
  if (active && payload && payload.length) {
    const rawVal = payload[0].value;
    const numVal = Number(rawVal);

    return (
      <div
        className={`p-3.5 shadow-2xl rounded-xl border backdrop-blur-md font-mono select-none min-w-[160px] ${
          isDark
            ? 'bg-slate-950/95 text-slate-100 border-slate-800'
            : 'bg-white/95 text-slate-900 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-1.5 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans">
            Observation Point
          </p>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
            Seq: {label}
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400 font-sans">Magnitude:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {Number.isFinite(numVal) ? numVal.toLocaleString() : rawVal}
              {unit ? ` ${unit}` : ''}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Enhanced LineChartComponent
 * Continuous temporal and sequential progression line/area chart.
 * Features theme adaptation, dynamic SVG linear gradients, and responsive statistical markers.
 */
const LineChartComponent = ({
  data,
  xKey = "index",
  yKey = "value",
  color = "#6366f1",
  xLabel = "Temporal / Sequence Index",
  yLabel = "Scalar Magnitude",
  unit = "",
  showGrid = true,
  showAverage = false,
  className = "",
}) => {
  const chartId = useId().replace(/:/g, '');
  const { isDark = true } = useTheme();

  // Compute telemetry metrics (min, max, avg)
  const { avgValue, totalPoints } = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { avgValue: 0, totalPoints: 0 };
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
    return {
      avgValue: count > 0 ? sum / count : 0,
      totalPoints: data.length,
    };
  }, [data, yKey]);

  // Empty State Guard
  if (!data || data.length === 0) {
    return (
      <div
        className={`w-full h-full min-h-[350px] flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 font-mono text-xs select-none ${className}`}
      >
        <Activity
          size={32}
          className="text-slate-300 dark:text-slate-700 mb-2.5 stroke-[1.5]"
        />
        <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
          No Sequence Stream Data
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
          Awaiting ordered scalar series to plot continuous trend progression
        </p>
      </div>
    );
  }

  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const axisStroke = isDark ? '#334155' : '#cbd5e1';
  const tickFill = isDark ? '#94a3b8' : '#64748b';
  const dotFill = isDark ? '#0f172a' : '#ffffff';

  return (
    <div
      className={`w-full h-full min-h-[380px] p-0 bg-transparent relative group font-sans ${className}`}
    >
      {/* Sequence Telemetry Overlay */}
      <div className="absolute top-0 right-2 flex items-center gap-3 z-10 pointer-events-none select-none">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xs text-[10px] font-mono">
          <span className="text-slate-400 uppercase font-bold">Samples:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {totalPoints}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-400 uppercase font-bold">Curve:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            Monotone
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 25, right: 15, left: 10, bottom: 50 }}
        >
          {/* Dynamic Area Gradient */}
          <defs>
            <linearGradient id={`areaGrad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
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

          {/* X Axis */}
          <XAxis
            dataKey={xKey}
            axisLine={{ stroke: axisStroke, strokeWidth: 1 }}
            tickLine={{ stroke: axisStroke }}
            tick={{
              fill: tickFill,
              fontSize: 10,
              fontWeight: 500,
              fontFamily: 'ui-monospace, monospace',
            }}
            dy={8}
            textAnchor="middle"
          >
            {xLabel && (
              <Label
                value={xLabel}
                offset={-35}
                position="insideBottom"
                className="text-[10px] font-bold uppercase tracking-wider fill-slate-400 dark:fill-slate-500 font-mono"
              />
            )}
          </XAxis>

          {/* Y Axis */}
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

          {/* Floating Tooltip */}
          <Tooltip
            content={<CustomTooltip unit={unit} isDark={isDark} />}
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
            animationDuration={150}
          />

          {/* Optional Average Reference Line */}
          {showAverage && avgValue > 0 && (
            <ReferenceLine
              y={avgValue}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              label={{
                value: `Avg: ${avgValue.toFixed(1)}`,
                fill: isDark ? '#fbbf24' : '#d97706',
                fontSize: 10,
                position: 'right',
                fontFamily: 'monospace',
              }}
            />
          )}

          {/* Shaded Area with Precision Stroke */}
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#areaGrad-${chartId})`}
            activeDot={{
              r: 5,
              stroke: color,
              strokeWidth: 2,
              fill: dotFill,
            }}
            animationBegin={0}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
