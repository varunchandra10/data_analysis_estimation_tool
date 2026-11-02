import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable SearchInput primitive
 * Standardized search bar with instant clear button, keyboard accessibility, and theme styling.
 */
export default function SearchInput({
  value = '',
  onChange,
  onClear = null,
  placeholder = 'Search...',
  className = '',
  iconSize = 13,
  badge = null,
  disabled = false,
  autoFocus = false,
  size = 'sm', // 'sm' | 'md'
}) {
  const inputRef = useRef(null);

  const handleClear = () => {
    if (onChange) onChange('');
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && value) {
      handleClear();
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'pl-7 pr-7 py-1 text-xs'
      : 'pl-8 pr-8 py-1.5 text-sm';

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        size={iconSize}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none shrink-0"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-sans transition-all ${sizeClasses} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      />
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={12} />
        </button>
      ) : badge ? (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/60 rounded px-1 py-0.2 pointer-events-none">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

