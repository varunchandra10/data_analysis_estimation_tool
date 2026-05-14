import React, { useState } from "react";
import axios from "axios";
import { 
  AlertCircle, 
  CheckCircle2, 
  Droplets, 
  LayoutGrid, 
  Percent, 
  Settings2,
  Sparkles,
  Loader2
} from "lucide-react";
import BarChartComponent from "./charts/BarChartComponent";
import PieChartComponent from "./charts/PieChartComponent";

const MissingValuePanel = ({ data, onCleaningComplete }) => {
  if (!data) return null;

  const { metadata, schema } = data;
  const [strategies, setStrategies] = useState({});
  const [loading, setLoading] = useState(false);

  // =====================================================
  // FILTER COLUMNS WITH NULLS
  // =====================================================
  const columnsWithNulls = schema.filter(
    (col) => metadata.null_counts[col.column] > 0
  );

  // =====================================================
  // CHART DATA CALCULATIONS
  // =====================================================
  const totalMissing = Object.values(metadata.null_counts).reduce(
    (acc, val) => acc + val,
    0
  );
  const totalCells = metadata.rows * metadata.columns;
  const totalAvailable = totalCells - totalMissing;
  const completenessRate = ((totalAvailable / totalCells) * 100).toFixed(1);

  const missingBarData = columnsWithNulls.map((col) => ({
    column: col.column,
    missing: metadata.null_counts[col.column],
  }));

  const missingPieData = [
    { name: "Missing", value: totalMissing },
    { name: "Available", value: totalAvailable },
  ];

  const handleStrategyChange = (column, strategy) => {
    setStrategies((prev) => ({ ...prev, [column]: strategy }));
  };

  const handleApplyCleaning = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/clean/missing-values",
        { file_path: metadata.file_path, strategies }
      );
      onCleaningComplete(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 mt-8 shadow-sm transition-all">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <Droplets size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Missing Value Cleaning
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Refine your dataset by addressing gaps with advanced imputation
            </p>
          </div>
        </div>
        
        {/* Real-time Status Badge */}
        <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full border ${totalMissing > 0 ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400' : 'bg-green-50 border-green-100 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'}`}>
          {totalMissing > 0 ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span className="text-xs font-bold uppercase tracking-wider">
            {totalMissing > 0 ? `${totalMissing} Values to Fix` : 'Data is Healthy'}
          </span>
        </div>
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="group rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 p-6 hover:border-amber-200 dark:hover:border-amber-900/50 transition-all">
          <div className="flex items-center gap-3 mb-3 text-amber-600">
            <AlertCircle size={18} />
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total Missing</p>
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white leading-none">
            {totalMissing.toLocaleString()}
          </h3>
        </div>

        <div className="group rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 p-6 hover:border-purple-200 dark:hover:border-purple-900/50 transition-all">
          <div className="flex items-center gap-3 mb-3 text-purple-600">
            <LayoutGrid size={18} />
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Affected Cols</p>
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white leading-none">
            {columnsWithNulls.length}
          </h3>
        </div>

        <div className="group rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 p-6 hover:border-green-200 dark:hover:border-green-900/50 transition-all">
          <div className="flex items-center gap-3 mb-3 text-green-600">
            <Percent size={18} />
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Completeness</p>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-4xl font-black text-gray-900 dark:text-white leading-none">
              {completenessRate}%
            </h3>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-1 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${completenessRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* VISUALIZATION DASHBOARD */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
        <div className="rounded-3xl border border-gray-100 dark:border-gray-700 p-6 bg-white dark:bg-gray-900/60 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
             <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
             <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">By Column</h3>
          </div>
          <BarChartComponent data={missingBarData} xKey="column" yKey="missing" />
        </div>

        <div className="rounded-3xl border border-gray-100 dark:border-gray-700 p-6 bg-white dark:bg-gray-900/60 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
             <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
             <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Density Overview</h3>
          </div>
          <PieChartComponent data={missingPieData} nameKey="name" dataKey="value" />
        </div>
      </div>

      {/* CONFIGURATION LIST */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2 px-2">
            <Settings2 size={16} className="text-gray-400" />
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Configuration</h4>
        </div>

        {columnsWithNulls.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10 p-12 text-center">
            <div className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mb-4">
                <Sparkles size={32} />
            </div>
            <p className="text-xl font-bold text-green-800 dark:text-green-300">
              Your Data is Pristine!
            </p>
            <p className="text-sm text-green-600/80 dark:text-green-400/60 mt-1">
              No missing values found in any column.
            </p>
          </div>
        ) : (
          columnsWithNulls.map((col, idx) => (
            <div
              key={idx}
              className="group flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 bg-gray-50/30 dark:bg-gray-900/20 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-900 transition-all"
            >
              <div className="flex gap-4 items-center">
                <div className="hidden sm:flex w-12 h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors">
                    {col.type === "Numerical" ? "123" : "Abc"}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    {col.column}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 font-bold">
                      <AlertCircle size={14} /> {metadata.null_counts[col.column].toLocaleString()} missing
                    </span>
                    <span className="h-1 w-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                      {col.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  className="w-full md:w-[240px] appearance-none border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl px-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all cursor-pointer"
                  onChange={(e) => handleStrategyChange(col.column, e.target.value)}
                >
                  <option value="">Select Method</option>
                  {col.type === "Numerical" && (
                    <>
                      <option value="mean">Average (Mean)</option>
                      <option value="median">Middle Value (Median)</option>
                      <option value="knn">Predictive (KNN Imputer)</option>
                    </>
                  )}
                  <option value="most_frequent">Most Frequent (Mode)</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER ACTION */}
      {columnsWithNulls.length > 0 && (
        <div className="mt-12 flex items-center justify-between p-6 rounded-3xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
          <div className="hidden lg:block">
             <p className="text-sm font-bold text-purple-900 dark:text-purple-300">Ready to proceed?</p>
             <p className="text-xs text-purple-700 dark:text-purple-400">Calculated strategies will be applied to {columnsWithNulls.length} columns.</p>
          </div>
          <button
            onClick={handleApplyCleaning}
            disabled={loading || Object.keys(strategies).length === 0}
            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-10 py-4 rounded-2xl transition-all font-bold shadow-lg shadow-purple-500/25 active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Sparkles size={20} />
            )}
            {loading ? "Processing Data..." : "Run Cleaning Pipeline"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MissingValuePanel;