import React from 'react';
import { Hash, Type, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../common';

/**
 * Reusable ColumnHealthCard component
 * Displays attribute health, missing rate distribution bar, heuristic strategy, and alert flags.
 * Reusable in Dataset Explorer, Logic Validation, and Null Analysis.
 */
export default function ColumnHealthCard({
  column,
  type = 'Numerical',
  confidence = 85,
  missingValueMethod = null,
  outlierMethod = null,
  nullCount = 0,
  totalRows = 0,
  warnings = [],
  onClick = null,
  className = '',
}) {
  const isNumeric = type === 'Numerical' || type === 'Integer' || type === 'Float';
  const nullPct = totalRows > 0 ? ((nullCount / totalRows) * 100).toFixed(1) : 0;
  const missingStrategy = missingValueMethod || (isNumeric ? 'mean' : 'most_frequent');
  const outlierStrategy = outlierMethod || (isNumeric ? 'zscore' : 'review');

  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl border border-slate-200 dark:border-slate-800 
        bg-white dark:bg-slate-900/80 p-4 shadow-2xs 
        hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Top line: Column name & Confidence badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {isNumeric ? (
              <Hash size={13} className="text-indigo-500 shrink-0" />
            ) : (
              <Type size={13} className="text-emerald-500 shrink-0" />
            )}
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate font-mono" title={column}>
              {column}
            </p>
          </div>
          <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
            {type} • {isNumeric ? 'Scale Metric' : 'Class Factor'}
          </p>
        </div>

        <StatusBadge variant="indigo" size="xs">
          {confidence}% match
        </StatusBadge>
      </div>

      {/* Missingness distribution mini bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/70">
        <div className="flex justify-between items-center text-[10px] font-mono mb-1">
          <span className="text-slate-500 dark:text-slate-400">Missing Rate:</span>
          <span className={nullCount > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>
            {nullCount > 0 ? `${nullCount} nulls (${nullPct}%)` : 'Complete (100%)'}
          </span>
        </div>
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${nullCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.max(2, 100 - parseFloat(nullPct))}%` }}
          />
        </div>
      </div>

      {/* Recommended Strategies */}
      <div className="mt-2.5 space-y-1.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Missing Value Strategy:</span>
          <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {missingStrategy}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Outlier Out-of-Bounds:</span>
          <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {outlierStrategy}
          </span>
        </div>

        {/* Warnings (if any) */}
        {(warnings.length > 0 || nullCount > 0) && (
          <div className="mt-2 text-[10px] flex items-start gap-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-2 rounded-md text-amber-800 dark:text-amber-300">
            <AlertCircle size={13} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              {warnings[0] || (nullCount > 0 ? `Requires null imputation (${nullCount} empty cells)` : 'Attribute requires review')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

