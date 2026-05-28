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
    /* FIXED OVERFLOW: Added isolation primitives, flex-1, and min-w-0 to prevent layout blowouts against the sidebar flex box */
    <div className="flex flex-col flex-1 min-w-0 h-full bg-[#0f172a] animate-in fade-in duration-200 overflow-hidden font-sans text-slate-200 isolated">
      
      {/* ================================================= */}
      {/* HEADER CONTROLS BAR */}
      {/* ================================================= */}
      <div className="bg-[#0b1329] px-6 py-4 border-b border-slate-900/80 flex items-center justify-between z-30 shadow-sm shrink-0">
        <div className="flex items-center gap-5">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-100 transition-colors active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-4 border-l pl-5 border-slate-900">
            <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-md border border-emerald-500/20 shrink-0">
              <FileSpreadsheet size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-wide uppercase font-mono">
                {initialFileName || 'Temporal Registry'}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-sm border border-indigo-500/10 uppercase tracking-wider font-mono">
                  <Layers size={11} />
                  V{data?.version_info?.active_version || '1'} : {data?.version_info?.stage || 'RAW'}
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-800" />
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Live Explorer Context
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={exportToCSV}
            disabled={loading || !data}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 hover:bg-indigo-600 hover:text-white disabled:opacity-40 disabled:hover:bg-slate-800 disabled:hover:text-slate-200 rounded-md text-xs font-semibold border border-slate-700/60 shadow-sm transition-all tracking-wide uppercase active:scale-95"
          >
            <Download size={13} />
            Export Snapshot
          </button>
        </div>
      </div>

      {/* ================================================= */}
      {/* FORMULA / VALUE PREVIEW CONSOLE */}
      {/* ================================================= */}
      <div className="bg-[#0f172a] px-6 py-2 border-b border-slate-900 flex items-center gap-4 font-mono shrink-0">
        <div className="text-[11px] font-bold text-indigo-400 w-20 text-center border-r pr-4 border-slate-900 flex items-center justify-center gap-1.5">
          <Maximize2 size={11} className="opacity-70" />
          {selectedCell.row !== null ? `${getColLetter(selectedCell.col)}${selectedCell.row + 1}` : 'INDEX'}
        </div>
        <div className="flex-1 bg-slate-950 border border-slate-900 rounded-sm px-4 py-1.5 text-xs font-medium text-slate-300 truncate shadow-inner h-8 flex items-center">
          {selectedCell.val || <span className="text-slate-600 italic font-normal uppercase tracking-wider text-[10px]">Await Selection...</span>}
        </div>
      </div>

      {/* ================================================= */}
      {/* MATRIX RENDER CONTENT CANVAS */}
      {/* ================================================= */}
      <div className="relative flex-1 bg-[#0b1329]/30 overflow-hidden flex flex-col min-h-0 min-w-0">
        {loading && <Loader message="Loading full dataset grid..." />}

        {!loading && error && (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-500 font-mono">
            <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-sm max-w-md shadow-lg">
              <p className="font-bold text-amber-500 text-xs uppercase tracking-wider mb-2">DATA_LINK_FAILURE</p>
              <p className="font-semibold text-slate-300 text-sm">{error}</p>
              <p className="text-xs text-slate-500 mt-3 font-sans leading-relaxed">Make sure the dataset file still exists and can be read by the server.</p>
            </div>
          </div>
        )}

        {!loading && data && (
          /* FIXED INNER BOX: Ensured scroll container context accurately uses absolute block limits to decouple grid width from sidebar positioning elements */
          <div className="overflow-auto h-full w-full bg-[#0f172a] custom-scrollbar">
            <table className="border-separate border-spacing-0 min-w-full font-mono text-xs table-layout-fixed">
              <thead className="sticky top-0 z-40">
                
                {/* ALPHABETICAL SPREADSHEET COORDINATE HEADER */}
                <tr className="bg-[#0b1329]">
                  <th className="w-16 border-b border-r border-slate-900 bg-slate-950 sticky left-0 z-50"></th>
                  {data.columns.map((_, i) => (
                    <th
                      key={i}
                      className={`min-w-[220px] border-b border-r border-slate-900 text-[10px] font-bold py-1.5 transition-colors text-center tracking-wider border-t border-slate-900/40 ${
                        selectedCell.col === i ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-600 bg-slate-950/80'
                      }`}
                    >
                      {getColLetter(i)}
                    </th>
                  ))}
                </tr>

                {/* LOGICAL COLUMN VALUE ATTRIBUTES */}
                <tr className="bg-[#0f172a]">
                  <th className="w-16 border-b border-r border-slate-900 text-slate-500 font-bold sticky left-0 z-50 bg-slate-950 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                    <Filter size={12} className="mx-auto opacity-40" />
                  </th>
                  {data.columns.map((col, idx) => (
                    <th
                      key={col}
                      className={`min-w-[220px] border-b border-r border-slate-900 px-5 py-3 text-left text-[11px] font-bold tracking-wide transition-colors uppercase ${
                        selectedCell.col === idx ? 'bg-indigo-500/5 text-indigo-400 border-b-indigo-500/30' : 'text-slate-400 bg-[#0b1329]/40'
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* DATA OBSERVATION CELLS */}
              <tbody className="divide-y divide-slate-900/60 bg-[#0f172a]/20">
                {data.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-900/40 transition-colors group">
                    
                    {/* INDEX ROW LABELS */}
                    <td
                      className={`border-b border-r border-slate-900 text-[10px] font-bold text-center sticky left-0 z-10 transition-all ${
                        selectedCell.row === i ? 'bg-indigo-500/20 text-indigo-400 font-black' : 'bg-slate-950 text-slate-600 group-hover:bg-slate-900'
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
                          className={`border-b border-r border-slate-900/40 px-5 py-2.5 text-[11px] font-medium truncate whitespace-nowrap cursor-cell transition-all ${
                            selectedCell.row === i && selectedCell.col === idx 
                              ? 'bg-slate-950 ring-1 ring-inset ring-indigo-500 text-slate-100 z-20' 
                              : 'text-slate-300'
                          } ${isModified ? 'bg-emerald-500/5 text-emerald-400 font-bold border-r-emerald-900/30' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            {isNull ? (
                              <span className="text-rose-500/40 font-bold italic text-[10px] uppercase tracking-wide">NaN</span>
                            ) : (
                              <span>{String(val)}</span>
                            )}
                            {isModified && (
                              <div className="flex items-center gap-1 shrink-0">
                                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                <CheckCircle2 size={11} className="text-emerald-400" />
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
      <div className="bg-[#0b1329] border-t border-slate-900 px-6 py-2.5 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono shadow-inner shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
            <span className="text-slate-400">Live Stream Channel Active</span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-900 pl-8">
            <Eye size={12} className="text-indigo-400 opacity-80" />
            <span className="text-slate-500">Integrity: <span className="text-emerald-500">Verified</span></span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-slate-400">Volumetry: <span className="text-slate-300">{data?.total_rows?.toLocaleString() || '0'}</span> rows</span>
          <div className="bg-slate-950 text-indigo-400 px-2 py-0.5 rounded-sm border border-slate-900 text-[9px]">ACTIVE_V: {data?.version_info?.active_version || '1'}</div>
        </div>
      </div>

    </div>
  );
}

export default DatasheetViewer;