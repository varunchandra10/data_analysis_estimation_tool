import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

// Semantic color dictionary for well-known dataset classifications
const SEMANTIC_PALETTE = {
  // Missing / Health
  "missing": "#f43f5e",     // Rose 500
  "available": "#10b981",   // Emerald 500
  "complete": "#10b981",
  "incomplete": "#f43f5e",

  // Duplication
  "duplicate": "#f59e0b",   // Amber 500
  "duplicates": "#f59e0b",
  "unique": "#6366f1",      // Indigo 500
  "non-duplicate": "#6366f1",

  // Data Types
  "numerical": "#6366f1",   // Indigo
  "categorical": "#06b6d4", // Cyan
  "datetime": "#8b5cf6",    // Purple
  "boolean": "#10b981",     // Emerald
  "text": "#f59e0b",        // Amber
  "object": "#06b6d4",

  // Severity
  "high": "#ef4444",
  "medium": "#f59e0b",
  "low": "#3b82f6",
};

// High-differentiability categorical fallback sequence
const FALLBACK_COLORS = [
  "#6366f1", // Indigo 500
  "#10b981", // Emerald 500
  "#06b6d4", // Cyan 500
  "#f59e0b", // Amber 500
  "#8b5cf6", // Purple 500
  "#f43f5e", // Rose 500
  "#3b82f6", // Blue 500
  "#ec4899", // Pink 500
];

/**
 * High-Precision Custom Tooltip
 */
const CustomTooltip = ({ active, payload, isDark, totalSum, unit }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const rawVal = item.value;
    const numVal = Number(rawVal);
    const percent =
      totalSum > 0 && Number.isFinite(numVal)
        ? ((numVal / totalSum) * 100).toFixed(1) + '%'
        : null;

    return (
      <div
        className={`p-3.5 shadow-2xl rounded-xl border backdrop-blur-md font-mono select-none min-w-[170px] ${
          isDark
            ? 'bg-slate-950/95 text-slate-100 border-slate-800'
            : 'bg-white/95 text-slate-900 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: item.payload?.fill || item.color }}
            />
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans truncate max-w-[160px]">
              {item.name}
            </p>
          </div>
          {percent && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shrink-0">
              {percent}
            </span>
          )}
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400 font-sans">Magnitude:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
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
 * Enhanced PieChartComponent
 * Enterprise donut and categorical proportion chart.
 * Features semantic color classification, center-donut summary readout, and theme adaptation.
 */
const PieChartComponent = ({
  data,
  nameKey = "label",
  dataKey = "count",
  unit = "",
  showCenterTotal = true,
  className = "",
}) => {
  const { isDark = true } = useTheme();

  // Calculate total sum across all slices
  const totalSum = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return 0;
    return data.reduce((acc, curr) => {
      const val = Number(curr[dataKey] ?? 0);
      return acc + (Number.isFinite(val) ? val : 0);
    }, 0);
  }, [data, dataKey]);

  // Empty State Guard
  if (!data || data.length === 0 || totalSum === 0) {
    return (
      <div
        className={`w-full h-full min-h-[250px] flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 font-mono text-xs select-none ${className}`}
      >
        <PieIcon
          size={32}
          className="text-slate-300 dark:text-slate-700 mb-2 stroke-[1.5]"
        />
        <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
          No Categorical Proportions
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
          Requires segmented class counts to compute relative shares
        </p>
      </div>
    );
  }

  const strokeColor = isDark ? "#0f172a" : "#ffffff";

  return (
    <div
      className={`w-full h-full min-h-[260px] relative flex flex-col justify-center items-center font-sans ${className}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            nameKey={nameKey}
            dataKey={dataKey}
            cx="50%"
            cy="45%"
            innerRadius="65%"
            outerRadius="88%"
            paddingAngle={3}
            stroke={strokeColor}
            strokeWidth={2}
            animationBegin={0}
            animationDuration={450}
            className="outline-none"
          >
            {data.map((entry, index) => {
              const segmentName = String(entry[nameKey] ?? '').toLowerCase();
              const sliceColor =
                SEMANTIC_PALETTE[segmentName] ||
                FALLBACK_COLORS[index % FALLBACK_COLORS.length];

              return (
                <Cell
                  key={`cell-${index}`}
                  fill={sliceColor}
                  className="hover:opacity-85 transition-opacity cursor-pointer outline-none"
                />
              );
            })}
          </Pie>

          <Tooltip
            content={
              <CustomTooltip
                isDark={isDark}
                totalSum={totalSum}
                unit={unit}
              />
            }
            animationDuration={150}
          />

          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 12, width: '100%' }}
            formatter={(value) => (
              <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide ml-1">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Donut Center Label (Executive Total Readout) */}
      {showCenterTotal && (
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none font-mono">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-tight">
            Total Σ
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none mt-0.5 block">
            {totalSum >= 1_000_000
              ? `${(totalSum / 1_000_000).toFixed(1)}M`
              : totalSum >= 1_000
              ? `${(totalSum / 1_000).toFixed(1)}k`
              : totalSum.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default PieChartComponent;
