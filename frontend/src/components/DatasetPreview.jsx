import React, { useState } from 'react';
import {
  Database,
  Table,
  Type,
  Hash,
  FileSpreadsheet,
  AlertCircle,
  ChevronRight,
  Eye
} from 'lucide-react';

const DatasetPreview = ({ data }) => {
  const [activeTab, setActiveTab] = useState('schema');

  // Handle null or undefined data gracefully
  if (!data || !data.metadata || !data.schema) {
    return (
      <div className="w-full flex items-center justify-center p-12 text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading dataset context...
      </div>
    );
  }

  const { metadata, schema, preview } = data;
  const previewColumns = preview && preview.length > 0 ? Object.keys(preview[0]) : [];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Top Meta Stats - Defensive access with toLocaleString */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
        {/* Dataset Card */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl shrink-0">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Source File</p>
            <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 truncate">
              {metadata?.filename ?? 'Unknown File'}
            </h4>
          </div>
        </div>

        {/* Rows Card - Error Fix Applied Here */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-xl shrink-0">
            <Hash className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total Rows</p>
            <h4 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-gray-100">
              {(metadata?.rows ?? 0).toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Columns Card - Error Fix Applied Here */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-xl shrink-0">
            <Database className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Dimensions</p>
            <h4 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-gray-100">
              {(metadata?.columns ?? 0).toLocaleString()} <span className="text-sm font-normal text-gray-400 uppercase tracking-tighter">Fields</span>
            </h4>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex-1 min-w-[150px] py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-all relative ${activeTab === 'schema'
              ? 'text-purple-600 bg-white dark:bg-gray-800'
              : 'text-gray-400 hover:bg-gray-100/50'
              }`}
          >
            <Type size={18} />
            Schema Inference
            {activeTab === 'schema' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 min-w-[150px] py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-all relative ${activeTab === 'preview'
              ? 'text-purple-600 bg-white dark:bg-gray-800'
              : 'text-gray-400 hover:bg-gray-100/50'
              }`}
          >
            <Eye size={18} />
            Data Preview
            {activeTab === 'preview' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-t-full" />}
          </button>
        </div>

        <div className="relative">
          {activeTab === 'schema' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 dark:bg-gray-900/40 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-5">Field Name</th>
                    <th className="px-6 py-5">Type</th>
                    <th className="px-6 py-5">DType</th>
                    <th className="px-6 py-5 text-right">Completeness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {schema.map((col, idx) => {
                    const nullCount = metadata?.null_counts?.[col.column] ?? 0;
                    const rowCount = metadata?.rows ?? 1; // Prevent division by zero
                    const nullPercent = ((nullCount / rowCount) * 100).toFixed(1);
                    const isHealthy = parseFloat(nullPercent) < 5;

                    return (
                      <tr key={idx} className="group hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-100">{col.column}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${col.type === 'Numerical' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                            {col.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-gray-500">{col.pandas_dtype}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-xs font-bold ${nullCount > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                              {nullPercent}% Null
                            </span>
                            <div className="w-20 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isHealthy ? 'bg-green-500' : 'bg-amber-500'}`}
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

          {activeTab === 'preview' && (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    {/* Use .slice(1) if the first column is always the index you want to hide */}
                    {previewColumns.map((col, idx) => (
                      <th key={idx} className="px-6 py-5 border-r border-gray-100/50 dark:border-gray-700/50 last:border-0">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {preview?.length > 0 ? (
                    preview.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        {previewColumns.map((col, colIdx) => (
                          <td key={colIdx} className="px-6 py-4 border-r border-gray-100/50 dark:border-gray-700/50 last:border-0">
                            {row[col] === null ? (
                              <span className="flex items-center gap-1 text-red-400 dark:text-red-900/50 italic text-xs font-normal">
                                null
                              </span>
                            ) : (
                              <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                                {String(row[col])}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={previewColumns.length || 1} className="p-12 text-center text-gray-500 italic">
                        No preview data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Showing top {preview?.length || 0} rows of {(metadata?.rows ?? 0).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetPreview;