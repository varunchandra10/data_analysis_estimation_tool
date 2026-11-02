import React, { useState, useMemo } from 'react';
import { Table, ArrowRight, Download } from 'lucide-react';
import { SearchInput } from '../common';

/**
 * Reusable DataGridTable component
 * Renders sample tabular dataset rows with live search filtering, NaN highlighting, and CSV download trigger.
 * Reusable in Dataset Explorer, Whole Dataset View, and Anomaly Inspection.
 */
export default function DataGridTable({
  rows = [],
  columns = [],
  totalRows = 0,
  onExportCSV = null,
  onOpenFullDataset = null,
  className = '',
}) {
  const [search, setSearch] = useState('');

  // Auto-detect columns if not explicitly provided
  const tableColumns = useMemo(() => {
    if (columns && columns.length > 0) return columns;
    return rows && rows.length > 0 ? Object.keys(rows[0]) : [];
  }, [columns, rows]);

  // Filter rows by text across all columns
  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((val) => String(val ?? '').toLowerCase().includes(q))
    );
  }, [rows, search]);

  return (
    <div className={`overflow-hidden ${className}`}>
      {/* Search Filter Header */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter preview rows by value..."
          className="w-full sm:w-72"
        />

        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs">
          <span>
            Displaying <strong>{filteredRows.length}</strong> preview records
          </span>
          {onOpenFullDataset && (
            <button
              onClick={onOpenFullDataset}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open Full Dataset</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
          <thead>
            <tr className="bg-slate-100/70 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-800/60 w-12 text-center">
                #
              </th>
              {tableColumns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-5 py-3 font-semibold border-r border-slate-200 dark:border-slate-800/60 last:border-0"
                >
                  <span className="font-mono text-slate-800 dark:text-slate-200">{col}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-mono text-[11px]">
            {filteredRows.length > 0 ? (
              filteredRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-2.5 border-r border-slate-200 dark:border-slate-800/40 text-center text-[10px] text-slate-400">
                    {rowIdx + 1}
                  </td>
                  {tableColumns.map((col, colIdx) => {
                    const val = row[col];
                    const isMissing =
                      val === null || val === undefined || String(val) === 'NaN' || String(val).trim() === '';

                    return (
                      <td
                        key={colIdx}
                        className="px-5 py-2.5 border-r border-slate-200 dark:border-slate-800/40 last:border-0 text-slate-800 dark:text-slate-200"
                      >
                        {isMissing ? (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            NaN
                          </span>
                        ) : (
                          <span>
                            {typeof val === 'number' ? val.toLocaleString() : String(val)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={tableColumns.length + 1}
                  className="p-12 text-center text-slate-500 italic text-xs"
                >
                  No rows matched &quot;{search}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Console Bar */}
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 gap-2 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
            <Table size={13} />
            Preview Head: {rows.length} rows
          </span>
          <span>•</span>
          <span>Total Population: {Number(totalRows || rows.length).toLocaleString()} rows</span>
        </div>

        {onExportCSV && (
          <button
            onClick={onExportCSV}
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <Download size={12} />
            <span>Download CSV Sample</span>
          </button>
        )}
      </div>
    </div>
  );
}

