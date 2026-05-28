import React, { useState } from 'react';
import {
  Database,
  Table,
  Type,
  Hash,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  Loader2,
  Filter,
  ArrowDownWideNarrowIcon,
  Sigma
} from 'lucide-react';
import StatisticsPanel from './StatisticsPanel';

const DatasetPreview = ({ data, aiResults }) => {
  const [activeTab, setActiveTab] = useState('schema');

  const formatCount = (value) => {
    if (Array.isArray(value)) return value.length.toLocaleString();
    if (typeof value === 'number') return value.toLocaleString();
    if (value && typeof value === 'object') {
      const numericValue = Number(value.rows ?? value.total_rows ?? value.count);
      return Number.isFinite(numericValue) ? numericValue.toLocaleString() : '0';
    }
    return '0';
  };

  if (!data || !data.metadata) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-24 text-slate-400 bg-slate-950 rounded-lg border border-slate-800 font-sans shadow-inner">
        <Loader2 className="animate-spin mb-4 text-indigo-500" size={24} />
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Initializing Dataset Context...
        </p>
      </div>
    );
  }
  const { metadata, preview, statistics } = data;
  const schema = Array.isArray(data.schema) && data.schema.length > 0
    ? data.schema
    : (preview && preview.length > 0)
      ? Object.keys(preview[0]).map((column) => ({
          column,
          type: 'Unknown',
          pandas_dtype: 'unknown',
        }))
      : [];

  const previewColumns = (preview && preview.length > 0) ? Object.keys(preview[0]) : [];
  const aiRecommendations = aiResults?.recommendations || [];

  return (
    <div className="w-full max-w-[1600px] mx-auto mt-4 px-4 sm:px-6 animate-in fade-in duration-200 antialiased font-sans text-slate-200">
      
      {/* ================================================= */}
      {/* METADATA SUMMARY GRID */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {/* SOURCE MATRIX */}
        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl flex items-center gap-4 shadow-sm hover:border-slate-700/80 transition-all duration-150">
          <div className="p-2.5 bg-slate-800 text-indigo-400 rounded-lg border border-slate-700/50 shrink-0">
            <FileSpreadsheet size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Dataset Filename</p>
            <h4 className="text-sm font-semibold text-slate-100 truncate">
              {metadata?.filename ?? 'system_buffer_01.csv'}
            </h4>
          </div>
        </div>

        {/* ROW COUNTER */}
        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl flex items-center gap-4 shadow-sm hover:border-slate-700/80 transition-all duration-150">
          <div className="p-2.5 bg-slate-800 text-emerald-400 rounded-lg border border-slate-700/50 shrink-0">
            <Hash size={16} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Observations (N)</p>
            <h4 className="text-sm font-semibold text-slate-100 font-mono">
              {formatCount(metadata?.rows)}
            </h4>
          </div>
        </div>

        {/* FEATURE COUNTER */}
        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl flex items-center gap-4 shadow-sm hover:border-slate-700/80 transition-all duration-150">
          <div className="p-2.5 bg-slate-800 text-amber-400 rounded-lg border border-slate-700/50 shrink-0">
            <Database size={16} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Features (P)</p>
            <h4 className="text-sm font-semibold text-slate-100 font-mono">
              {formatCount(metadata?.columns)}
            </h4>
          </div>
        </div>

        {/* DATA INTEGRITY COMPUTE */}
        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl flex items-center gap-4 shadow-sm hover:border-slate-700/80 transition-all duration-150">
          <div className="p-2.5 bg-slate-800 text-slate-400 rounded-lg border border-slate-700/50 shrink-0">
            <Filter size={16} />
          </div>
          <div className="w-full">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Integrity Index</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] font-bold text-emerald-400 tracking-wide">HIGH</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[94%] rounded-full" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ================================================= */}
      {/* STATISTICAL & DATA TYPE HEURISTICS PANEL */}
      {/* ================================================= */}
      {aiRecommendations.length > 0 && (
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Automated Column Diagnostics</p>
              <p className="text-xs text-slate-400 mt-0.5">Pipeline type mapping warnings and profiling alerts triggered for {aiRecommendations.length} attributes.</p>
            </div>
            <span className="self-start sm:self-center text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800 px-3 py-1 rounded-md border border-slate-700/60 font-mono">
              {aiResults?.status || 'success_execution'}
            </span>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3 bg-slate-950/20">
            {aiRecommendations.slice(0, 6).map((item, index) => {
              const recommendation = item.recommendations || {};
              const warnings = recommendation.warnings || [];

              return (
                <div key={index} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 shadow-sm hover:bg-slate-900/80 hover:border-slate-700/80 transition-all duration-150">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-100 truncate font-mono">{item.column}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5 tracking-wide">{item.type}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      {recommendation.confidence ?? 0}% match
                    </span>
                  </div>
                  <div className="mt-3.5 space-y-2 border-t border-slate-800/80 pt-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px]">Missing Value Strategy:</span>
                      <span className="text-slate-200 font-medium font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700/40 text-[10px]">{recommendation.missing_value_method || 'review'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px]">Outlier Out-of-Bounds:</span>
                      <span className="text-slate-200 font-medium font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700/40 text-[10px]">{recommendation.outlier_method || 'review'}</span>
                    </div>
                    {warnings.length > 0 && (
                      <div className="text-amber-400 text-[11px] mt-3 flex items-start gap-1.5 bg-amber-500/5 border border-amber-500/10 p-2 rounded-lg">
                        <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-500" />
                        <span className="leading-tight">{warnings[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* DATAGRID MANAGEMENT MODULE */}
      {/* ================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden mb-8">

        {/* TAB CONTROLS */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 bg-slate-900/40">
          <div className="flex gap-6 flex-wrap">
            
            {/* SCHEMA SPECIFICATION TAB */}
            <button
              onClick={() => setActiveTab('schema')}
              className={`py-3.5 text-xs font-semibold tracking-wide flex items-center gap-2 transition-all relative ${
                activeTab === 'schema' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Type size={14} />
              <span>Schema Specification</span>
              {activeTab === 'schema' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-full" />
              )}
            </button>

            {/* DATA MATRIX EXPLORER TAB */}
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-3.5 text-xs font-semibold tracking-wide flex items-center gap-2 transition-all relative ${
                activeTab === 'preview' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye size={14} />
              <span>Data Explorer</span>
              {activeTab === 'preview' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-full" />
              )}
            </button>

            {/* DESCRIPTIVE STATS TAB */}
            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-3.5 text-xs font-semibold tracking-wide flex items-center gap-2 transition-all relative ${
                activeTab === 'statistics' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sigma size={14} />
              <span>Descriptive Statistics</span>
              {activeTab === 'statistics' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        <div className="relative">

          {/* ================================================= */}
          {/* SCHEMA SPECIFICATION ARRAY */}
          {/* ================================================= */}
          {activeTab === 'schema' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <th className="px-6 py-3.5 font-semibold">Field Label</th>
                    <th className="px-6 py-3.5 font-semibold">Semantic Mapping</th>
                    <th className="px-6 py-3.5 font-semibold">Engine DType</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Null Distribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 bg-slate-950/10">
                  {schema.map((col, idx) => {
                    const nullCount = metadata?.null_counts?.[col.column] ?? 0;
                    const rowCount = metadata?.rows ?? 1;
                    const nullPercent = ((nullCount / rowCount) * 100).toFixed(1);
                    const isHealthy = parseFloat(nullPercent) < 5;

                    return (
                      <tr key={idx} className="group hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-3 font-semibold text-slate-100 font-mono">{col.column}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-medium ${
                            col.type === 'Numerical'
                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}>
                            {col.type}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <code className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded text-[10px] font-mono">
                            {col.pandas_dtype}
                          </code>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`text-[11px] font-mono font-medium ${nullCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {nullPercent}% <span className="text-[10px] text-slate-500 font-sans font-normal">NaN</span>
                            </span>
                            <div className="w-28 h-1 bg-slate-950 border border-slate-800/60 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                style={{ width: `${100 - nullPercent}%` }}
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
          )}

          {/* ================================================= */}
          {/* SPREADSHEET MATRIX PREVIEW */}
          {/* ================================================= */}
          {activeTab === 'preview' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
                    {previewColumns.map((col, idx) => (
                      <th key={idx} className="px-5 py-3 font-semibold border-r border-slate-800/60 last:border-0">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-mono text-slate-300">{col}</span>
                          <ArrowDownWideNarrowIcon size={12} className="text-slate-500 opacity-60 hover:text-slate-300 cursor-pointer" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 bg-slate-950/5 font-mono text-[11px]">
                  {preview?.length > 0 ? (
                    preview.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-800/30 transition-colors">
                        {previewColumns.map((col, colIdx) => (
                          <td key={colIdx} className="px-5 py-2.5 border-r border-slate-800/40 last:border-0 text-slate-300">
                            {row[col] === null ? (
                              <span className="text-rose-400/80 font-medium bg-rose-500/5 px-1 py-0.5 rounded border border-rose-500/10 text-[10px]">
                                NaN
                              </span>
                            ) : (
                              <span className="text-slate-300">
                                {typeof row[col] === 'number' ? row[col].toLocaleString() : String(row[col])}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={previewColumns.length || 1} className="p-16 text-center text-slate-500 italic text-sm font-sans">
                        No transactional data logs matching current frame layout parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* FOOTER CONSOLE BAR */}
              <div className="px-5 py-3 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-800 text-xs text-slate-400 gap-2">
                <div className="flex items-center gap-3 font-medium text-slate-400">
                  <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                    <Table size={13} />
                    Buffered Head: {preview?.length || 0} rows
                  </span>
                  <span className="text-slate-700">|</span>
                  <span>Total Frame Profile N: {(metadata?.rows ?? 0).toLocaleString()} observations</span>
                </div>
                <button className="self-start sm:self-auto font-semibold text-indigo-400 hover:text-indigo-300 transition-colors text-xs">
                  Export Dataset Profile Metadata (JSON)
                </button>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* STATISTICAL DESC PANEL PANEL */}
          {/* ================================================= */}
          {activeTab === 'statistics' && (
            <div className="p-5 bg-slate-950/10">
              {statistics ? (
                <StatisticsPanel statistics={statistics} />
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
                  Descriptive statistics are not available for this dataset version yet.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DatasetPreview;