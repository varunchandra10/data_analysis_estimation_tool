import React, { useMemo } from 'react';
import HistogramChart from '../charts/HistogramChart';

/**
 * Reusable AttributeProfiler component
 * Renders statistical profile, frequency distributions, and interactive histograms for any column.
 * Reusable in Dataset Explorer, Anomaly Detection, Weighting Calibration, and Statistical Summaries.
 */
export default function AttributeProfiler({
  schema = [],
  previewRows = [],
  nullCounts = {},
  selectedColumn = '',
  onSelectColumn = null,
  className = '',
}) {
  const activeCol = selectedColumn || schema[0]?.column || '';

  // Extract non-null values for the active column
  const columnValues = useMemo(() => {
    if (!activeCol || !previewRows || previewRows.length === 0) return [];
    return previewRows
      .map((r) => r[activeCol])
      .filter((v) => v !== null && v !== undefined && String(v) !== 'NaN' && String(v).trim() !== '');
  }, [activeCol, previewRows]);

  const colSchema = schema.find((s) => s.column === activeCol);
  const isNumeric = useMemo(() => {
    if (colSchema?.type === 'Numerical' || colSchema?.type === 'Integer' || colSchema?.type === 'Float') {
      return true;
    }
    return columnValues.length > 0 && columnValues.every((v) => typeof v === 'number');
  }, [colSchema, columnValues]);

  // Numerical metrics
  const numericStats = useMemo(() => {
    if (!isNumeric || columnValues.length === 0) return null;
    const nums = columnValues.map(Number).filter((n) => !isNaN(n));
    if (nums.length === 0) return null;
    return {
      count: nums.length,
      min: Math.min(...nums),
      max: Math.max(...nums),
      missing: nullCounts[activeCol] || 0,
    };
  }, [isNumeric, columnValues, nullCounts, activeCol]);

  // Categorical frequency breakdown
  const categoricalFrequency = useMemo(() => {
    if (isNumeric || columnValues.length === 0) return [];
    const counts = {};
    columnValues.forEach((val) => {
      const key = String(val);
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percent: ((count / columnValues.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);
  }, [isNumeric, columnValues]);

  return (
    <div className={`p-6 ${className}`}>
      {/* Column Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono">
            Attribute Distribution Inspector
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select any feature to inspect sample distribution, density, and category frequencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">Selected Column:</span>
          <select
            value={activeCol}
            onChange={(e) => onSelectColumn && onSelectColumn(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none cursor-pointer focus:border-indigo-500"
          >
            {schema.map((col, idx) => (
              <option key={idx} value={col.column}>
                {col.column} ({col.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Profile Inspector Content */}
      <div className="mt-6">
        {isNumeric ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Sample Count</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                  {numericStats?.count?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Min Value</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                  {numericStats?.min !== undefined ? numericStats.min.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Max Value</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                  {numericStats?.max !== undefined ? numericStats.max.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Missing Count</p>
                <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                  {numericStats?.missing ?? 0}
                </p>
              </div>
            </div>

            {/* Histogram Chart */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 mb-4 uppercase tracking-wider">
                Frequency Histogram: {activeCol}
              </p>
              <div className="h-64 w-full">
                <HistogramChart data={columnValues} />
              </div>
            </div>
          </div>
        ) : (
          /* Categorical Frequency Breakdown */
          <div>
            <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 mb-4 uppercase tracking-wider">
              Category Distribution: {activeCol} ({categoricalFrequency.length} Classes)
            </p>
            <div className="space-y-3 font-mono">
              {categoricalFrequency.length > 0 ? (
                categoricalFrequency.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {cat.count} occurrences ({cat.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 italic">
                  No categorical observations available.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

