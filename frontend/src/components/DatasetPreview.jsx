import React, { useState } from 'react';
import { Database, Table, Type, Hash, FileSpreadsheet } from 'lucide-react';

const DatasetPreview = ({ data }) => {
  const [activeTab, setActiveTab] = useState('schema');

  if (!data) return null;

  const { metadata, schema, preview } = data;
  
  // Extract columns for the preview table
  const previewColumns = preview && preview.length > 0 ? Object.keys(preview[0]) : [];

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Meta Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Dataset</p>
            <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100">{metadata.filename}</h4>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-xl">
            <Hash size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Rows</p>
            <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{metadata.rows.toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-xl">
            <Database size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Columns</p>
            <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{metadata.columns.toLocaleString()}</h4>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-gray-700">
          <button 
            onClick={() => setActiveTab('schema')}
            className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'schema' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50 dark:bg-purple-900/10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
          >
            <Type size={18} />
            Schema Inference
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'preview' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50 dark:bg-purple-900/10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
          >
            <Table size={18} />
            Data Preview
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'schema' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Column Name</th>
                    <th className="px-6 py-4">Inferred Type</th>
                    <th className="px-6 py-4">Pandas DType</th>
                    <th className="px-6 py-4 text-right">Missing Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {schema.map((col, idx) => {
                    const nullCount = metadata.null_counts[col.column] || 0;
                    const nullPercent = ((nullCount / metadata.rows) * 100).toFixed(1);
                    
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                          {col.column}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${col.type === 'Numerical' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                              col.type === 'Categorical' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 
                              col.type === 'Date' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {col.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                          {col.pandas_dtype}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`${nullCount > 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-400'}`}>
                            {nullCount.toLocaleString()} ({nullPercent}%)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 uppercase text-xs font-semibold">
                  <tr>
                    {previewColumns.map((col, idx) => (
                      <th key={idx} className="px-6 py-4">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {preview.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      {previewColumns.map((col, colIdx) => (
                        <td key={colIdx} className="px-6 py-4">
                          {row[col] === null ? (
                            <span className="text-gray-300 italic">null</span>
                          ) : typeof row[col] === 'boolean' ? (
                            row[col] ? 'True' : 'False'
                          ) : (
                            String(row[col])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-100 dark:border-gray-700">
                Showing top 5 rows of {metadata.rows.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetPreview;
