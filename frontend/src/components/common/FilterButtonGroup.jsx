import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * Reusable FilterButtonGroup primitive
 * Segmented pill control for filtering views, tabs, or lists with count badges.
 */
export default function FilterButtonGroup({
  options = [],
  activeId,
  onChange,
  size = 'sm', // 'sm' | 'md'
  className = '',
}) {
  const containerSize =
    size === 'sm' ? 'p-0.5 rounded-lg gap-1' : 'p-1 rounded-xl gap-1.5';

  const buttonSize =
    size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs';

  return (
    <div
      className={`inline-flex items-center border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 ${containerSize} ${className}`}
      role="group"
    >
      {options.map((opt) => {
        const isActive = activeId === opt.id;
        const Icon = opt.icon;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange && onChange(opt.id)}
            className={`
              inline-flex items-center gap-1.5 font-medium rounded-md cursor-pointer transition-all duration-150 select-none
              ${buttonSize}
              ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
              }
            `}
          >
            {Icon && <Icon size={size === 'sm' ? 12 : 14} className="shrink-0" />}
            <span>{opt.label}</span>
            {opt.count !== undefined && opt.count !== null && (
              <StatusBadge
                size="xs"
                variant={
                  opt.badgeVariant || (isActive ? 'indigo' : 'slate')
                }
              >
                {opt.count}
              </StatusBadge>
            )}
          </button>
        );
      })}
    </div>
  );
}

