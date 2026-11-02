import React, { useState, useMemo } from 'react';
import ColumnHealthCard from './ColumnHealthCard';
import { SearchInput, FilterButtonGroup } from '../common';

/**
 * Reusable ColumnDiagnosticsGrid component
 * Grid of ColumnHealthCards with built-in search, type filtering, and compact/expanded toggle.
 */
export default function ColumnDiagnosticsGrid({
  diagnostics = [],
  schema = [],
  nullCounts = {},
  totalRows = 0,
  onColumnClick = null,
  className = '',
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'numerical' | 'categorical' | 'warnings'
  const [showAll, setShowAll] = useState(true);

  // Group counts for filter buttons
  const numericalCount = useMemo(
    () => schema.filter((s) => s.type === 'Numerical' || s.type === 'Integer' || s.type === 'Float').length,
    [schema]
  );
  const categoricalCount = useMemo(
    () => schema.filter((s) => s.type !== 'Numerical' && s.type !== 'Integer' && s.type !== 'Float').length,
    [schema]
  );
  const warningsCount = useMemo(
    () => Object.values(nullCounts).filter((c) => c > 0).length,
    [nullCounts]
  );

  const filterOptions = [
    { id: 'all', label: 'All', count: schema.length },
    { id: 'numerical', label: 'Num', count: numericalCount },
    { id: 'categorical', label: 'Cat', count: categoricalCount },
    { id: 'warnings', label: 'Issues', count: warningsCount, badgeVariant: warningsCount > 0 ? 'amber' : 'slate' },
  ];

  // Filter diagnostics list
  const filteredList = useMemo(() => {
    let list = diagnostics.length > 0
      ? diagnostics
      : schema.map((s) => ({
          column: s.column,
          type: s.type,
          recommendations: {
            confidence: 85,
            missing_value_method: s.type === 'Numerical' ? 'mean' : 'most_frequent',
            outlier_method: s.type === 'Numerical' ? 'zscore' : 'review',
            warnings: nullCounts[s.column] > 0 ? [`${nullCounts[s.column]} null values detected`] : [],
          },
        }));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((item) => item.column.toLowerCase().includes(q));
    }

    if (filter === 'numerical') {
      list = list.filter((item) => item.type === 'Numerical' || item.type === 'Integer' || item.type === 'Float');
    } else if (filter === 'categorical') {
      list = list.filter((item) => item.type !== 'Numerical' && item.type !== 'Integer' && item.type !== 'Float');
    } else if (filter === 'warnings') {
      list = list.filter((item) => {
        const warnings = item.recommendations?.warnings || [];
        const hasNulls = (nullCounts[item.column] || 0) > 0;
        return warnings.length > 0 || hasNulls;
      });
    }

    return list;
  }, [diagnostics, schema, search, filter, nullCounts]);

  const displayedList = showAll ? filteredList : filteredList.slice(0, 6);

  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs ${className}`}>
      {/* Header and Controls */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
              Automated Column Diagnostics & Profile
            </p>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filteredList.length} of {schema.length} Attributes
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Heuristic strategies, missing value handlers, and statistical distribution flags for every column.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search attribute..."
            className="w-44"
          />

          <FilterButtonGroup
            options={filterOptions}
            activeId={filter}
            onChange={setFilter}
          />

          {filteredList.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
            >
              {showAll ? 'Show Compact (6)' : `Show All (${filteredList.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Diagnostics Cards Grid */}
      <div className="grid gap-3.5 p-4 md:grid-cols-2 xl:grid-cols-3 bg-slate-50/30 dark:bg-slate-950/30">
        {displayedList.length > 0 ? (
          displayedList.map((item, index) => {
            const recommendation = item.recommendations || {};
            const warnings = recommendation.warnings || [];
            const nullCount = nullCounts[item.column] || 0;

            return (
              <ColumnHealthCard
                key={index}
                column={item.column}
                type={item.type}
                confidence={recommendation.confidence ?? 85}
                missingValueMethod={recommendation.missing_value_method}
                outlierMethod={recommendation.outlier_method}
                nullCount={nullCount}
                totalRows={totalRows}
                warnings={warnings}
                onClick={onColumnClick ? () => onColumnClick(item.column) : null}
              />
            );
          })
        ) : (
          <div className="col-span-full py-8 text-center text-xs text-slate-500">
            No attributes matched &quot;{search}&quot; in the current filter.
          </div>
        )}
      </div>
    </div>
  );
}

