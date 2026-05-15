import React, { useState } from 'react';

import {
  Database,
  Table,
  Type,
  Hash,
  FileSpreadsheet,
  AlertCircle,
  ChevronRight,
  Eye,
  Loader2,
  Filter,
  ArrowDownWideNarrowIcon,
  Sigma
} from 'lucide-react';

import StatisticsPanel from './StatisticsPanel';

const DatasetPreview = ({ data }) => {

  const [activeTab, setActiveTab] = useState('schema');

  if (!data || !data.metadata || !data.schema) {

    return (

      <div className="w-full flex flex-col items-center justify-center p-24 text-slate-500 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">

        <Loader2
          className="animate-spin mb-4 text-indigo-500"
          size={32}
        />

        <p className="text-sm font-medium tracking-wide">
          Initializing Dataset Context...
        </p>

      </div>
    );
  }

  const {
    metadata,
    schema,
    preview,
    statistics
  } = data;

  const previewColumns = (
    preview &&
    preview.length > 0
  )
    ? Object.keys(preview[0])
    : [];

  return (

    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-700">

      {/* ================================================= */}
      {/* DATASET HEADER / TOP STATS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {/* ============================================= */}
        {/* SOURCE INFO */}
        {/* ============================================= */}

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">

          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0 border border-indigo-100 dark:border-indigo-800">

            <FileSpreadsheet size={20} />

          </div>

          <div className="min-w-0">

            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1">

              Source Dataset

            </p>

            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">

              {metadata?.filename ?? 'system_buffer_01.csv'}

            </h4>

          </div>

        </div>

        {/* ============================================= */}
        {/* ROW COUNT */}
        {/* ============================================= */}

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">

          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0 border border-emerald-100 dark:border-emerald-800">

            <Hash size={20} />

          </div>

          <div>

            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1">

              Observations

            </p>

            <h4 className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100 leading-none">

              {(metadata?.rows ?? 0).toLocaleString()}

            </h4>

          </div>

        </div>

        {/* ============================================= */}
        {/* COLUMN COUNT */}
        {/* ============================================= */}

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">

          <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg shrink-0 border border-amber-100 dark:border-amber-800">

            <Database size={20} />

          </div>

          <div>

            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1">

              Features

            </p>

            <h4 className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100 leading-none">

              {(metadata?.columns ?? 0).toLocaleString()}

            </h4>

          </div>

        </div>

        {/* ============================================= */}
        {/* DATA INTEGRITY */}
        {/* ============================================= */}

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg shrink-0 border border-slate-200 dark:border-slate-700">

            <Filter size={20} />

          </div>

          <div className="w-full">

            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1">

              Data Integrity

            </p>

            <div className="flex items-center gap-2">

              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">

                High

              </span>

              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">

                <div className="h-full bg-emerald-500 w-[94%]"></div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* MAIN DATA WORKBENCH */}
      {/* ================================================= */}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden">

        {/* ================================================= */}
        {/* TAB CONTROLS */}
        {/* ================================================= */}

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-900">

          <div className="flex gap-8 flex-wrap">

            {/* ========================================= */}
            {/* SCHEMA TAB */}
            {/* ========================================= */}

            <button
              onClick={() => setActiveTab('schema')}
              className={`py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 transition-all relative ${
                activeTab === 'schema'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >

              <Type size={16} />

              Schema Definition

              {activeTab === 'schema' && (

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />

              )}

            </button>

            {/* ========================================= */}
            {/* PREVIEW TAB */}
            {/* ========================================= */}

            <button
              onClick={() => setActiveTab('preview')}
              className={`py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 transition-all relative ${
                activeTab === 'preview'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >

              <Eye size={16} />

              Data Explorer

              {activeTab === 'preview' && (

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />

              )}

            </button>

            {/* ========================================= */}
            {/* STATISTICS TAB */}
            {/* ========================================= */}

            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 transition-all relative ${
                activeTab === 'statistics'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >

              <Sigma size={16} />

              Statistics

              {activeTab === 'statistics' && (

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />

              )}

            </button>

          </div>

          {/* ========================================= */}
          {/* RIGHT CONTROLS */}
          {/* ========================================= */}

          <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">

            <span>Filter</span>

            <div className="h-4 w-px bg-slate-200 dark:border-slate-700"></div>

            <span>Sort</span>

          </div>

        </div>

        <div className="relative">

          {/* ================================================= */}
          {/* SCHEMA TABLE */}
          {/* ================================================= */}

          {activeTab === 'schema' && (

            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs border-collapse">

                <thead>

                  <tr className="bg-slate-50/80 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">

                    <th className="px-6 py-4 font-black">
                      Field Label
                    </th>

                    <th className="px-6 py-4">
                      Semantic Type
                    </th>

                    <th className="px-6 py-4">
                      Engine DType
                    </th>

                    <th className="px-6 py-4 text-right">
                      Null Distribution
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                  {schema.map((col, idx) => {

                    const nullCount =
                      metadata?.null_counts?.[col.column] ?? 0;

                    const rowCount =
                      metadata?.rows ?? 1;

                    const nullPercent = (
                      (nullCount / rowCount) * 100
                    ).toFixed(1);

                    const isHealthy =
                      parseFloat(nullPercent) < 5;

                    return (

                      <tr
                        key={idx}
                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >

                        <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">

                          {col.column}

                        </td>

                        <td className="px-6 py-4">

                          <span className={`inline-flex items-center px-2 py-0.5 rounded border ${
                            col.type === 'Numerical'
                              ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          } text-[10px] font-bold`}>

                            {col.type}

                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400 text-[10px]">

                            {col.pandas_dtype}

                          </code>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex flex-col items-end gap-1.5">

                            <span className={`font-mono text-[10px] font-bold ${
                              nullCount > 0
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}>

                              {nullPercent}%

                              <span className="text-[9px] opacity-60">
                                NULL
                              </span>

                            </span>

                            <div className="w-24 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">

                              <div
                                className={`h-full transition-all duration-1000 ${
                                  isHealthy
                                    ? 'bg-emerald-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{
                                  width: `${100 - nullPercent}%`
                                }}
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
          {/* PREVIEW TABLE */}
          {/* ================================================= */}

          {activeTab === 'preview' && (

            <div className="overflow-x-auto">

              <table className="w-full text-left text-[11px] whitespace-nowrap border-collapse">

                <thead>

                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[9px] font-bold tracking-widest border-b border-slate-200 dark:border-slate-800">

                    {previewColumns.map((col, idx) => (

                      <th
                        key={idx}
                        className="px-4 py-3 font-black border-r border-slate-100 dark:border-slate-800 last:border-0"
                      >

                        <div className="flex items-center justify-between gap-4">

                          {col}

                          <ArrowDownWideNarrowIcon
                            size={12}
                            className="opacity-30"
                          />

                        </div>

                      </th>

                    ))}

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                  {preview?.length > 0 ? (

                    preview.map((row, rowIdx) => (

                      <tr
                        key={rowIdx}
                        className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
                      >

                        {previewColumns.map((col, colIdx) => (

                          <td
                            key={colIdx}
                            className="px-4 py-2.5 border-r border-slate-100 dark:border-slate-800 last:border-0 font-mono"
                          >

                            {row[col] === null ? (

                              <span className="text-red-300 dark:text-red-900/40 italic">

                                ∅ null

                              </span>

                            ) : (

                              <span className="text-slate-600 dark:text-slate-400">

                                {typeof row[col] === 'number'
                                  ? row[col].toLocaleString()
                                  : String(row[col])}

                              </span>

                            )}

                          </td>

                        ))}

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td
                        colSpan={previewColumns.length || 1}
                        className="p-20 text-center text-slate-400 italic font-medium"
                      >

                        No records available for preview.

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

              {/* ============================================= */}
              {/* FOOTER BAR */}
              {/* ============================================= */}

              <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-950 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">

                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">

                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">

                    <Table size={12} />

                    Viewing Head: {preview?.length || 0} Records

                  </span>

                  <span className="text-slate-300 dark:text-slate-700">
                    |
                  </span>

                  <span>

                    Full Dataset Context:
                    {(metadata?.rows ?? 0).toLocaleString()} Rows

                  </span>

                </div>

                <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-widest">

                  Export Metadata (JSON)

                </button>

              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* STATISTICS PANEL */}
          {/* ================================================= */}

          {activeTab === 'statistics' && (

            <div className="p-6">

              <StatisticsPanel
                statistics={statistics}
              />

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default DatasetPreview;