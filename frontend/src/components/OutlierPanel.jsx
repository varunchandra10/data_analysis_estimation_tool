import React, { useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  BarChart3,
  Settings2,
  Search,
  Table as TableIcon,
  Activity,
  Info,
  Loader2
} from "lucide-react";

import HistogramChart from "./charts/HistogramChart";
import ScatterChartComponent from "./charts/ScatterChartComponent";
import BoxPlotComponent from "./charts/BoxPlotComponent";

const OutlierPanel = ({ data }) => {
  if (!data) return null;

  const { metadata, schema } = data;
  const numericColumns = schema.filter((col) => col.type === "Numerical");

  const [selectedColumn, setSelectedColumn] = useState("");
  const [method, setMethod] = useState("iqr");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDetect = async () => {
    if (!selectedColumn) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/outliers/detect", {
        file_path: metadata.file_path,
        column: selectedColumn,
        method,
      });

      // MERGE: Keep the selected column and method in the result object
      setResult({
        ...response.data,
        column: selectedColumn, // Manually ensure this exists
        method: method          // Manually ensure this exists
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 mt-8 shadow-sm transition-all duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
              Outlier Detection
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Identify and analyze statistical anomalies in your numerical variables.
            </p>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl mb-10">
        <div className="grid md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              Analyze Column
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                <option value="">Select Column</option>
                {numericColumns.map((col, idx) => (
                  <option key={idx} value={col.column}>{col.column}</option>
                ))}
              </select>
              <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">
                <Search size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              Detection Method
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="iqr">IQR Method (Tukey's)</option>
                <option value="zscore">Z-Score (Standardized)</option>
                <option value="winsorization">Winsorization (Capping)</option>
              </select>
              <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">
                <Settings2 size={16} />
              </div>
            </div>
          </div>

          <button
            onClick={handleDetect}
            disabled={loading || !selectedColumn}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3.5 transition-all font-bold shadow-lg shadow-purple-500/20 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Activity size={20} />}
            {loading ? "Analyzing..." : "Run Detection"}
          </button>
        </div>
      </div>

      {/* RESULTS */}
      {result && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm flex flex-col justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500" /> Total Outliers
              </p>
              <h3 className="text-4xl font-black mt-4 text-red-600 dark:text-red-400">
                {result.total_outliers.toLocaleString()}
              </h3>
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm flex flex-col justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Settings2 size={14} className="text-blue-500" /> Applied Method
              </p>
              <h3 className="text-2xl font-black mt-4 text-gray-900 dark:text-white uppercase">
                {result.method || method || 'N/A'}
              </h3>
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm flex flex-col justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 size={14} className="text-purple-500" /> Target Field
              </p>
              <h3 className="text-2xl font-black mt-4 text-gray-900 dark:text-white truncate">
                {result.column || selectedColumn || 'N/A'}
              </h3>
            </div>
          </div>

          {/* VISUALIZATIONS DASHBOARD */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-gray-100 dark:border-gray-700 p-6 bg-white dark:bg-gray-900/60 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Distribution Histogram</h3>
              </div>
              <HistogramChart data={result.visualizations.histogram} />
            </div>

            <div className="rounded-3xl border border-gray-100 dark:border-gray-700 p-6 bg-white dark:bg-gray-900/60 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Anomalous Scatter Plot</h3>
              </div>
              <ScatterChartComponent data={result.visualizations.scatterplot} xKey="x" yKey="y" />
            </div>
          </div>

          {/* BOXPLOT SECTION */}
          <div className="rounded-3xl border border-gray-100 dark:border-gray-700 p-8 bg-white dark:bg-gray-900/40">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Boxplot Statistics</h3>
              </div>
              <div className="group relative">
                <Info size={16} className="text-gray-400 cursor-help" />
                <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  Five-number summary showing the spread and skewness of your data.
                </div>
              </div>
            </div>
            <BoxPlotComponent stats={result.visualizations.boxplot} />

            {/* THRESHOLDS DATA */}
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Calculated Boundaries</h4>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl overflow-hidden">
                <pre className="text-xs font-mono text-purple-600 dark:text-purple-400">
                  {JSON.stringify(result.thresholds, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
            <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-2">
              <TableIcon size={18} className="text-gray-400" />
              <h3 className="font-bold text-gray-900 dark:text-white">Sample of Affected Rows</h3>
            </div>

            {result.affected_rows.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex p-4 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 mb-4">
                  <Activity size={32} />
                </div>
                <h4 className="text-gray-900 dark:text-white font-bold">Data appears clean!</h4>
                <p className="text-sm text-gray-500 mt-1">
                  No anomalous records found with the {result.method?.toUpperCase() || 'selected'} method.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                    <tr>
                      {Object.keys(result.affected_rows[0]).map((key, idx) => (
                        <th key={idx} className="text-left px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {result.affected_rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OutlierPanel;