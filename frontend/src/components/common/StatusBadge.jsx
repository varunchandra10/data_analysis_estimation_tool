import React from 'react';

const VARIANT_STYLES = {
  slate: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
  amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
  rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
  blue: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
  purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
};

const DOT_COLORS = {
  slate: 'bg-slate-400',
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
};

const SIZES = {
  xs: 'text-[9px] px-1.5 py-0.2 gap-1',
  sm: 'text-[10px] px-2 py-0.5 gap-1.5',
  md: 'text-xs px-2.5 py-1 gap-1.5',
};

/**
 * Reusable StatusBadge primitive
 * Provides enterprise-grade tag & status pill styling with light & dark theme fidelity.
 */
export default function StatusBadge({
  children,
  variant = 'slate',
  size = 'sm',
  dot = false,
  pulse = false,
  icon: Icon = null,
  iconSize = 10,
  className = '',
  title = '',
  onClick = null,
}) {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.slate;
  const dotColor = DOT_COLORS[variant] || DOT_COLORS.slate;
  const sizeClass = SIZES[size] || SIZES.sm;
  const interactiveClass = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';

  return (
    <span
      title={title || undefined}
      onClick={onClick}
      className={`inline-flex items-center font-mono font-bold rounded-md border shrink-0 select-none tracking-tight ${variantClass} ${sizeClass} ${interactiveClass} ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`} />
        </span>
      )}
      {Icon && <Icon size={iconSize} className="shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

