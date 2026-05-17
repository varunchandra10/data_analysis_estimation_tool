import React, { useEffect, useState } from 'react';
import { Download, FileSpreadsheet, ChevronLeft, Filter, Eye, Maximize2, Layers, CheckCircle2 } from 'lucide-react';
import Loader from '../UI/Loader';
import { fetchFullDatasetPreview } from '../../api/datasets.api';

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
    <div className="flex flex-col w-full h-full bg-white animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-95"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="flex items-center gap-4 border-l pl-6 border-slate-200">
            <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-xl shadow-emerald-100">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 tracking-tight leading-none uppercase">
                {initialFileName || 'Temporal Registry'}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-widest">
                  <Layers size={10} />
                  V{data?.version_info?.active_version || '1'} : {data?.version_info?.stage || 'RAW'}
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
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
            className="flex items-center gap-3 px-8 py-3 bg-slate-900 text-white hover:bg-blue-600 disabled:opacity-50 rounded-2xl text-[10px] font-black transition-all shadow-xl shadow-slate-200 tracking-[0.2em] uppercase active:scale-95"
          >
            <Download size={14} />
            Export Snapshot
          </button>
        </div>
      </div>

      <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center gap-4">
        <div className="text-[11px] font-black text-slate-500 w-20 text-center italic border-r pr-4 border-slate-200 flex items-center justify-center gap-2">
          <Maximize2 size={12} className="text-blue-500" />
          {selectedCell.row !== null ? `${getColLetter(selectedCell.col)}${selectedCell.row + 1}` : 'INDEX'}
        </div>
        <div className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 truncate shadow-inner h-9 flex items-center">
          {selectedCell.val || <span className="text-slate-200 italic font-normal uppercase tracking-widest text-[10px]">Await Selection...</span>}
        </div>
      </div>

      <div className="relative flex-1 bg-[#f1f3f4] overflow-hidden flex flex-col min-h-0">
        {loading && <Loader message="Loading full dataset grid..." />}

        {!loading && error && (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-500">
            <div>
              <p className="font-bold text-slate-900">{error}</p>
              <p className="text-sm mt-2">Make sure the dataset file still exists and can be read by the server.</p>
            </div>
          </div>
        )}

        {!loading && data && (
          <div className="overflow-auto scrollbar-thin scrollbar-thumb-slate-300 h-full w-full">
            <table className="border-separate border-spacing-0 min-w-full">
              <thead className="sticky top-0 z-40">
                <tr className="bg-[#f8f9fa]">
                  <th className="w-16 border-b border-r border-slate-300 bg-slate-200 sticky left-0 z-50"></th>
                  {data.columns.map((_, i) => (
                    <th
                      key={i}
                      className={`min-w-[220px] border-b border-r border-slate-300 text-[10px] font-black py-2 transition-colors uppercase tracking-widest ${
                        selectedCell.col === i ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-100'
                      }`}
                    >
                      {getColLetter(i)}
                    </th>
                  ))}
                </tr>
                <tr className="bg-white">
                  <th className="w-16 border-b border-r border-slate-300 text-slate-400 font-black sticky left-0 z-50 bg-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.05)]">
                    <Filter size={14} className="mx-auto" />
                  </th>
                  {data.columns.map((col, idx) => (
                    <th
                      key={col}
                      className={`min-w-[220px] border-b border-r border-slate-300 px-6 py-4 text-left text-[12px] font-black tracking-tight transition-colors ${
                        selectedCell.col === idx ? 'bg-blue-50 text-blue-800' : 'text-slate-900 bg-white'
                      }`}
                    >
                      {col.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white">
                {data.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td
                      className={`border-b border-r border-slate-200 text-[10px] font-black text-center sticky left-0 z-10 transition-all ${
                        selectedCell.row === i ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                      }`}
                    >
                      {i + 1}
                    </td>
                    {data.columns.map((col, idx) => {
                      const isModified = data.changed_cells?.[i]?.[col] === true;
                      const val = row[col];
                      const isNull = val === null || val === '' || val === 'NULL';

                      return (
                        <td
                          key={col}
                          onClick={() =>
                            setSelectedCell({
                              row: i,
                              col: idx,
                              val: isNull ? 'NULL_PTR' : String(val),
                            })
                          }
                          className={`border-b border-r border-slate-100 px-6 py-3 text-[13px] font-medium truncate whitespace-nowrap cursor-cell transition-all ${
                            selectedCell.row === i && selectedCell.col === idx ? 'bg-white ring-2 ring-inset ring-blue-600 z-20' : ''
                          } ${isModified ? 'bg-emerald-50/50 text-emerald-800 font-bold' : 'text-slate-600'}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            {isNull ? (
                              <span className="text-red-300 italic opacity-50 text-[11px] uppercase tracking-tighter">null_ptr</span>
                            ) : (
                              <span>{String(val)}</span>
                            )}
                            {isModified && (
                              <div className="flex items-center gap-1 shrink-0">
                                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                <CheckCircle2 size={12} className="text-emerald-500" />
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

      <div className="bg-slate-900 border-t border-slate-800 px-8 py-3 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
            <span className="text-white">Live Data Stream Active</span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-700 pl-10">
            <Eye size={12} className="text-blue-400" />
            <span className="text-slate-400">Snapshot Integrity: Verified</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <span className="text-slate-400">Volumetry: {data?.total_rows?.toLocaleString() || '0'} Records</span>
          <div className="bg-blue-600 text-white px-3 py-1 rounded font-mono text-[9px]">ACTIVE_V: {data?.version_info?.active_version || '1'}</div>
        </div>
      </div>
    </div>
  );
}

export default DatasheetViewer;
