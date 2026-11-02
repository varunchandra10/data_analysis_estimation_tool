import { useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Label,
} from "recharts";
import { Compass, AlertTriangle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Technical Tooltip: High-density coordinate precision, outlier identification, and scalar audits.
 */
const CustomTooltip = ({ active, payload, xLabel, yLabel, isDark }) => {
  if (active && payload && payload.length) {
    const pt = payload[0]?.payload || {};
    const xVal = Number(payload[0]?.value ?? pt.x ?? 0);
    const yVal = Number(payload[1]?.value ?? pt.y ?? 0);
    const isOutlier = Boolean(pt.is_outlier || pt.isOutlier || pt.outlier);

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
            Coordinate Point
          </p>
          {isOutlier && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
              <AlertTriangle size={10} />
              Outlier
            </span>
          )}
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400 font-sans truncate max-w-[90px]" title={xLabel}>
              {xLabel || 'X Axis'}:
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {Number.isFinite(xVal) ? xVal.toLocaleString(undefined, { maximumFractionDigits: 3 }) : xVal}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400 font-sans truncate max-w-[90px]" title={yLabel}>
              {yLabel || 'Y Axis'}:
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {Number.isFinite(yVal) ? yVal.toLocaleString(undefined, { maximumFractionDigits: 3 }) : yVal}
            </span>
          </div>
          {pt.label && (
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[10px]">
              <span className="text-slate-400">Entity:</span>
              <span className="font-bold text-slate-600 dark:text-slate-300 truncate max-w-[100px]">{pt.label}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Enhanced ScatterChartComponent
 * Continuous bivariate scatter plot with outlier anomaly detection, theme adaptation,
 * and high-density cluster transparency.
 */
const ScatterChartComponent = ({
  data,
  xKey = "x",
  yKey = "y",
  color = "#6366f1",
  xLabel = "Explanatory Dimension (X)",
  yLabel = "Response Magnitude (Y)",
  showGrid = true,
  className = "",
}) => {
  const { isDark = true } = useTheme();

  // Validate points & compute telemetry
  const { validPoints, outlierCount } = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { validPoints: [], outlierCount: 0 };
    }
    let outliers = 0;
    const pts = data.filter((d) => {
      const x = Number(d[xKey]);
      const y = Number(d[yKey]);
      const valid = Number.isFinite(x) && Number.isFinite(y);
      if (valid && (d.is_outlier || d.isOutlier || d.outlier)) {
        outliers += 1;
      }
      return valid;
    });
    return { validPoints: pts, outlierCount: outliers };
  }, [data, xKey, yKey]);

  // Empty State Guard
  if (!validPoints || validPoints.length === 0) {
    return (
      <div
        className={`w-full h-full min-h-[350px] flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 font-mono text-xs select-none ${className}`}
      >
        <Compass
          size={32}
          className="text-slate-300 dark:text-slate-700 mb-2.5 stroke-[1.5]"
        />
        <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
          No Bivariate Scatter Points
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
          Requires paired numeric (X, Y) coordinates to map bivariate distribution dispersion
        </p>
      </div>
    );
  }

  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const axisStroke = isDark ? '#334155' : '#cbd5e1';
  const tickFill = isDark ? '#94a3b8' : '#64748b';
  const cursorStroke = isDark ? '#475569' : '#cbd5e1';

  return (
    <div
      className={`w-full h-full min-h-[380px] p-0 bg-transparent relative group font-sans ${className}`}
    >
      {/* Telemetry Overlay */}
      <div className="absolute top-0 right-2 flex items-center gap-3 z-10 pointer-events-none select-none">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xs text-[10px] font-mono">
          <span className="text-slate-400 uppercase font-bold">Coordinates:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {validPoints.length}
          </span>
          {outlierCount > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-rose-500 uppercase font-bold">Outliers:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {outlierCount}
              </span>
            </>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 25, right: 20, bottom: 50, left: 10 }}>
          {/* Grid */}
          {showGrid && (
            <CartesianGrid
              strokeDasharray="2 4"
              stroke={gridStroke}
            />
          )}

          {/* X Axis */}
          <XAxis
            type="number"
            dataKey={xKey}
            name={xLabel}
            axisLine={{ stroke: axisStroke, strokeWidth: 1 }}
            tickLine={{ stroke: axisStroke }}
            tick={{
              fill: tickFill,
              fontSize: 10,
              fontWeight: 500,
              fontFamily: 'ui-monospace, monospace',
            }}
            dy={8}
            tickFormatter={(val) => {
              const num = Number(val);
              if (!Number.isFinite(num)) return val;
              if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
              if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
              return num.toLocaleString();
            }}
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
            type="number"
            dataKey={yKey}
            name={yLabel}
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

          <ZAxis type="number" range={[50, 180]} />

          {/* Floating Tooltip */}
          <Tooltip
            content={<CustomTooltip xLabel={xLabel} yLabel={yLabel} isDark={isDark} />}
            cursor={{ strokeDasharray: '4 4', stroke: cursorStroke, strokeWidth: 1 }}
            animationDuration={150}
          />

          {/* Scatter Points */}
          <Scatter
            name="Observations"
            data={validPoints}
            fill={color}
            line={false}
            animationBegin={0}
            animationDuration={450}
          >
            {validPoints.map((entry, index) => {
              const isOutlier = Boolean(entry.is_outlier || entry.isOutlier || entry.outlier);
              const pointColor = isOutlier ? '#f43f5e' : color;

              return (
                <Cell
                  key={`cell-${index}`}
                  fill={pointColor}
                  fillOpacity={isOutlier ? 0.85 : 0.4}
                  stroke={pointColor}
                  strokeWidth={isOutlier ? 2 : 1}
                  className="hover:fill-opacity-100 hover:scale-125 transition-all duration-150 cursor-pointer"
                />
              );
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterChartComponent;
