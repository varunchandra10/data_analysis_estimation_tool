import React from 'react';
import StatusBadge from './StatusBadge';
import InfoTooltip from '../UI/InfoTooltip';

/**
 * Reusable MetricStatCard primitive
 * High-density enterprise KPI metric card used across Dataset Explorer, Analytics,
 * Lineage, and Quality Reports.
 */
export default function MetricStatCard({
  label,
  value,
  icon: Icon = null,
  subValue = null,
  badge = null,
  badgeVariant = 'slate',
  progressBar = null, // { value: number (0-100), colorClass?: string }
  tooltip = null,     // string | { title: string, explanation: string, ... }
  onClick = null,
  className = '',
  truncateValue = false,
}) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-xl border border-slate-200 dark:border-slate-800 
        bg-white dark:bg-slate-900/60 p-4 transition-all duration-150
        ${isClickable ? 'cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm' : ''}
        ${className}
      `}
    >
      {/* Top Header: Icon, Label & Badges */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
              <Icon size={14} />
            </div>
          )}
          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">
            {label}
          </span>
          {tooltip && (
            typeof tooltip === 'string' ? (
              <InfoTooltip title={label} explanation={tooltip} iconSize={11} className="h-3.5 w-3.5" />
            ) : (
              <InfoTooltip {...tooltip} iconSize={11} className="h-3.5 w-3.5" />
            )
          )}
        </div>

        {badge && (
          <StatusBadge variant={badgeVariant} size="xs">
            {badge}
          </StatusBadge>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline justify-between gap-2">
        <div
          className={`text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 ${
            truncateValue ? 'truncate' : ''
          }`}
          title={typeof value === 'string' ? value : undefined}
        >
          {value}
        </div>

        {subValue && (
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">
            {subValue}
          </span>
        )}
      </div>

      {/* Optional Progress Bar (e.g., Integrity Index, Completion %) */}
      {progressBar && (
        <div className="mt-2.5">
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressBar.colorClass || 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progressBar.value))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

