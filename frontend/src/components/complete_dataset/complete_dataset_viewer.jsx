import React, { useEffect, useState } from 'react';
import { Download, FileSpreadsheet, ChevronLeft, Filter, Eye, Maximize2, Layers, CheckCircle2 } from 'lucide-react';
import Loader from '../UI/Loader';
import { fetchFullDatasetPreview } from '../../services/api/pipeline.api';

function DatasheetViewer({ datasetId, onBack, initialFileName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null, val: '' });

  useEffect(() => {
    if (!datasetId) {
      setLoading(false);
      setError('No dataset selected');
      return;
    }
    setLoading(true);
    setError(null);

    fetchFullDatasetPreview(datasetId)
      .then((resData) => {
        setData(resData);
        setTimeout(() => setLoading(false), 250);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load dataset registry stream');
        setLoading(false);
      });
  }, [datasetId]);

  const exportToCSV = () => {
    if (!data || !data.rows) return;
    const headers = data.columns.join(',');
    const csvRows = data.rows.map((row) =>
      data.columns.map((col) => {
        const value = row[col] === null ? '' : row[col];
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    const filename = `V${data.version_info?.active_version || '1'}_${initialFileName || 'dataset'}`;
    link.setAttribute('download', `${filename}.csv`);
    link.click();
  };

  const getColLetter = (n) => {
    let letter = '';
    while (n >= 0) {
      letter = String.fromCharCode((n % 26) + 65) + letter;
      n = Math.floor(n / 26) - 1;
    }
    return letter;
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-200 overflow-hidden font-sans text-slate-800 dark:text-slate-200 isolated">
      
      {/* ================================================= */}
      {/* HEADER CONTROLS BAR */}
      {/* ================================================= */}
      <div className="bg-white dark:bg-slate-900 px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-30 shadow-xs shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
              title="Return to Explorer"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <div className="flex items-center gap-3 border-l pl-4 border-slate-200 dark:border-slate-800">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-2 rounded-md border border-emerald-200 dark:border-emerald-800/60 shrink-0">
              <FileSpreadsheet size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase font-mono">
                {initialFileName || 'Temporal Registry'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-sm border border-indigo-200 dark:border-indigo-800/60 uppercase tracking-wider font-mono">
                  <Layers size={11} />
                  V{data?.version_info?.active_version || '1'} : {data?.version_info?.stage || 'RAW'}
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Full Coordinate Matrix
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            disabled={loading || !data}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 disabled:opacity-40 rounded-md text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
          >
            <Download size={13} className="text-indigo-500" />
            <span>Export Snapshot</span>
          </button>
        </div>
      </div>

      {/* ================================================= */}
      {/* FORMULA / VALUE PREVIEW CONSOLE */}
      {/* ================================================= */}
      <div className="bg-slate-100/70 dark:bg-slate-900/60 px-6 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 font-mono shrink-0">
        <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 w-20 text-center border-r pr-4 border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5">
          <Maximize2 size={11} className="opacity-70" />
          {selectedCell.row !== null ? `${getColLetter(selectedCell.col)}${selectedCell.row + 1}` : 'INDEX'}
        </div>
        <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 truncate shadow-2xs h-7 flex items-center">
          {selectedCell.val || <span className="text-slate-400 italic font-normal uppercase tracking-wider text-[10px]">Select any cell coordinate...</span>}
        </div>
      </div>

      {/* ================================================= */}
      {/* MATRIX RENDER CONTENT CANVAS */}
      {/* ================================================= */}
      <div className="relative flex-1 bg-white dark:bg-slate-950 overflow-hidden flex flex-col min-h-0 min-w-0">
        {loading && <Loader message="Loading full dataset grid..." />}

        {!loading && error && (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-500 font-mono">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-lg max-w-md shadow-lg">
              <p className="font-bold text-amber-500 text-xs uppercase tracking-wider mb-2">DATA_LINK_FAILURE</p>
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{error}</p>
              <p className="text-xs text-slate-500 mt-3 font-sans leading-relaxed">Make sure the dataset file still exists and can be read by the server.</p>
            </div>
          </div>
        )}

        {!loading && data && (
          <div className="overflow-auto h-full w-full bg-white dark:bg-slate-950 custom-scrollbar">
            <table className="border-separate border-spacing-0 min-w-full font-mono text-xs table-layout-fixed">
              <thead className="sticky top-0 z-40">
                {/* ALPHABETICAL SPREADSHEET COORDINATE HEADER */}
                <tr className="bg-slate-100 dark:bg-slate-900">
                  <th className="w-16 border-b border-r border-slate-200 dark:border-slate-800 bg-slate-200/80 dark:bg-slate-950 sticky left-0 z-50"></th>
                  {data.columns.map((_, i) => (
                    <th
                      key={i}
                      className={`min-w-[200px] border-b border-r border-slate-200 dark:border-slate-800 text-[10px] font-bold py-1.5 transition-colors text-center tracking-wider ${
                        selectedCell.col === i
                          ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                          : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900'
                      }`}
                    >
                      {getColLetter(i)}
                    </th>
                  ))}
                </tr>

                {/* LOGICAL COLUMN VALUE ATTRIBUTES */}
                <tr className="bg-slate-50 dark:bg-slate-900/90">
                  <th className="w-16 border-b border-r border-slate-200 dark:border-slate-800 text-slate-500 font-bold sticky left-0 z-50 bg-slate-100 dark:bg-slate-950 shadow-xs">
                    <Filter size={12} className="mx-auto opacity-50" />
                  </th>
                  {data.columns.map((col, idx) => (
                    <th
                      key={col}
                      className={`min-w-[200px] border-b border-r border-slate-200 dark:border-slate-800 px-5 py-2.5 text-left text-[11px] font-bold tracking-wide transition-colors uppercase ${
                        selectedCell.col === idx
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-b-indigo-500'
                          : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40'
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* DATA OBSERVATION CELLS */}
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {data.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    {/* INDEX ROW LABELS */}
                    <td
                      className={`border-b border-r border-slate-200 dark:border-slate-800 text-[10px] font-bold text-center sticky left-0 z-10 transition-all ${
                        selectedCell.row === i
                          ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-black'
                          : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-900'
                      }`}
                    >
                      {i + 1}
                    </td>

                    {/* ATTRIBUTE COORDINATE POINTS */}
                    {data.columns.map((col, idx) => {
                      const isModified = data.changed_cells?.[i]?.[col] === true;
                      const val = row[col];
                      const isNull = val === null || val === '' || val === 'NULL' || String(val).toUpperCase() === 'NAN';

                      return (
                        <td
                          key={col}
                          onClick={() =>
                            setSelectedCell({
                              row: i,
                              col: idx,
                              val: isNull ? 'NaN' : String(val),
                            })
                          }
                          className={`border-b border-r border-slate-200 dark:border-slate-800/40 px-5 py-2.5 text-[11px] font-medium truncate whitespace-nowrap cursor-cell transition-all ${
                            selectedCell.row === i && selectedCell.col === idx 
                              ? 'bg-indigo-50/70 dark:bg-slate-950 ring-1 ring-inset ring-indigo-500 text-indigo-950 dark:text-slate-100 z-20 font-semibold' 
                              : 'text-slate-700 dark:text-slate-300'
                          } ${isModified ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            {isNull ? (
                              <span className="text-amber-600 dark:text-amber-400 font-bold italic text-[10px] uppercase tracking-wide">NaN</span>
                            ) : (
                              <span>{String(val)}</span>
                            )}
                            {isModified && (
                              <div className="flex items-center gap-1 shrink-0">
                                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                <CheckCircle2 size={11} className="text-emerald-500" />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* FOOTER METRICS SYSTEM STATUS BAR */}
      {/* ================================================= */}
      <div className="bg-slate-100/90 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono shadow-xs shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 dark:text-slate-400">Live Registry Stream Active</span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-800 pl-8">
            <Eye size={12} className="text-indigo-500" />
            <span>Integrity: <span className="text-emerald-600 dark:text-emerald-400">Verified</span></span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span>Volumetry: <span className="text-slate-800 dark:text-slate-200">{data?.total_rows?.toLocaleString() || '0'}</span> rows</span>
          <div className="bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-sm border border-slate-200 dark:border-slate-800 text-[9px]">
            ACTIVE_V: {data?.version_info?.active_version || '1'}
          </div>
        </div>
      </div>

    </div>
  );
}

export default DatasheetViewer;
