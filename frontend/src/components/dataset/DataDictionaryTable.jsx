import React, { useState, useMemo } from 'react';
import { SearchInput, StatusBadge } from '../common';

/**
 * Reusable DataDictionaryTable component
 * Renders schema field specifications, semantic type mapping, engine dtype, and completeness meters.
 * Reusable in Dataset Explorer, Ingestion Schema Review, Comparison Diff, and Reports.
 */
export default function DataDictionaryTable({
  schema = [],
  nullCounts = {},
  totalRows = 0,
  onColumnClick = null,
  className = '',
}) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('order'); // 'order' | 'name' | 'missing'

  const filteredSchema = useMemo(() => {
    let rows = [...schema];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.column.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          (r.pandas_dtype && r.pandas_dtype.toLowerCase().includes(q))
      );
    }
    if (sortBy === 'name') {
      rows.sort((a, b) => a.column.localeCompare(b.column));
    } else if (sortBy === 'missing') {
      rows.sort((a, b) => (nullCounts[b.column] || 0) - (nullCounts[a.column] || 0));
    }
    return rows;
  }, [schema, search, sortBy, nullCounts]);

  return (
    <div className={`overflow-hidden ${className}`}>
      {/* Search and Sort Toolbar */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter fields..."
          className="w-full sm:w-64"
        />

        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="order">Original Order</option>
            <option value="name">Field Name (A-Z)</option>
            <option value="missing">Missing Count (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Schema Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/70 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-mono font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-3.5">#</th>
              <th className="px-6 py-3.5">Field Label</th>
              <th className="px-6 py-3.5">Semantic Mapping</th>
              <th className="px-6 py-3.5">Engine DType</th>
              <th className="px-6 py-3.5 text-right">Null Distribution</th>
              <th className="px-6 py-3.5 text-right">Completeness</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
            {filteredSchema.map((col, idx) => {
              const nullCount = nullCounts[col.column] ?? 0;
              const nullPercent = totalRows > 0 ? ((nullCount / totalRows) * 100).toFixed(1) : 0;
              const isHealthy = parseFloat(nullPercent) < 5;
              const isNumeric = col.type === 'Numerical' || col.type === 'Integer' || col.type === 'Float';

              return (
                <tr
                  key={idx}
                  onClick={onColumnClick ? () => onColumnClick(col.column) : null}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                    onColumnClick ? 'cursor-pointer' : ''
                  }`}
                >
                  <td className="px-6 py-3 text-slate-400 text-[10px]">{idx + 1}</td>
                  <td className="px-6 py-3 font-bold text-slate-900 dark:text-slate-100">{col.column}</td>
                  <td className="px-6 py-3">
                    <StatusBadge variant={isNumeric ? 'indigo' : 'emerald'} size="xs">
                      {col.type}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-3">
                    <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px]">
                      {col.pandas_dtype || (isNumeric ? 'float64' : 'object')}
                    </code>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className={`font-semibold ${nullCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {nullCount} nulls ({nullPercent}%)
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {(100 - parseFloat(nullPercent)).toFixed(1)}%
                      </span>
                      <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${100 - parseFloat(nullPercent)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

