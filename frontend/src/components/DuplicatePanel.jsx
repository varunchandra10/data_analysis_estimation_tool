import React, { useState } from "react";
import axios from "axios";
import {
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  PieChart as PieIcon,
  Database
} from "lucide-react";

import PieChartComponent from "./charts/PieChartComponent";
import BarChartComponent from "./charts/BarChartComponent";

const DuplicatePanel = ({ data, onProcessComplete }) => {
  if (!data) return null;

  const { metadata } = data;

  const [strategy, setStrategy] = useState("detect");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/duplicates/process",
        {
          file_path: metadata.file_path,
          strategy
        }
      );

      setResult(response.data);

      if (onProcessComplete) {
        onProcessComplete(response.data);
      }
    } catch (err) {
      console.error("Processing Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHART DATA (Using Optional Chaining to prevent crashes)
  // =====================================================

  const pieChartData = result ? [
    {
      name: "Duplicates",
      value: result.duplicate_count || 0
    },
    {
      name: "Unique Rows",
      value: (result.final_rows || 0) - (result.duplicate_count || 0)
    }
  ] : [];

  const summaryBarData = result ? [
    {
      category: "Original",
      value: result.original_rows || 0
    },
    {
      category: "Final",
      value: result.final_rows || 0
    },
    {
      category: "Duplicates",
      value: result.duplicate_count || 0
    },
    {
      category: "Removed",
      value: result.removed_count || 0
    }
  ] : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mt-8 shadow-sm transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <Copy size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Duplicate Handling
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ensure data integrity by managing redundant records
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 mb-8">
        <div className="grid md:grid-cols-2 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
              Processing Strategy
            </label>
            <select
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
            >
              <option value="detect">Detect Duplicates Only</option>
              <option value="remove">Remove and Keep First</option>
              <option value="keep_latest">Remove and Keep Latest</option>
            </select>
          </div>

          <button
            onClick={handleProcess}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl px-4 py-3.5 transition-all font-bold shadow-lg shadow-purple-500/20 active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {loading ? "Processing..." : "Run Duplicate Analysis"}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-blue-500 mb-3">
                <Database size={16} />
                <p className="text-xs font-bold uppercase tracking-wider">Original</p>
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                {(result.original_rows ?? 0).toLocaleString()}
              </h3>
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-green-500 mb-3">
                <CheckCircle2 size={16} />
                <p className="text-xs font-bold uppercase tracking-wider">Final</p>
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                {(result.final_rows ?? 0).toLocaleString()}
              </h3>
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-amber-500 mb-3">
                <AlertCircle size={16} />
                <p className="text-xs font-bold uppercase tracking-wider">Found</p>
              </div>
              <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {(result.duplicate_count ?? 0).toLocaleString()}
              </h3>
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-red-500 mb-3">
                <Trash2 size={16} />
                <p className="text-xs font-bold uppercase tracking-wider">Removed</p>
              </div>
              <h3 className="text-3xl font-black text-red-600 dark:text-red-400">
                {(result.removed_count ?? 0).toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <PieIcon className="text-purple-500" size={18} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Redundancy Distribution
                </h3>
              </div>
              <PieChartComponent data={pieChartData} nameKey="name" dataKey="value" />
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="text-purple-500" size={18} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Process Impact Analysis
                </h3>
              </div>
              <BarChartComponent data={summaryBarData} xKey="category" yKey="value" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Copy size={18} className="text-gray-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Identified Duplicate Samples
                </h3>
              </div>
              <span className="text-[10px] font-bold py-1 px-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-500">
                Top 20 Samples
              </span>
            </div>

            {/* FIXED: Added Optional Chaining and fallback to empty array */}
            {(result?.duplicate_rows?.length || 0) === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">No duplicates found</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your dataset is already unique.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      {result?.duplicate_rows?.[0] && Object.keys(result.duplicate_rows[0]).map((key, idx) => (
                        <th key={idx} className="text-left px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {result?.duplicate_rows?.map((row, idx) => (
                      <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-6 py-4 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                            {value === null ? <span className="text-gray-300 italic">null</span> : String(value)}
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

export default DuplicatePanel;