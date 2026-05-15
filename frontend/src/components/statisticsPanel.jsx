import React from "react";
import {
  Activity,
  Sigma,
  BarChart3,
  Database,
  TrendingUp,
  Layers3,
  Table as TableIcon,
  Binary,
  Info,
  ArrowUpRight
} from "lucide-react";

import BarChartComponent from "./charts/BarChartComponent";
import PieChartComponent from "./charts/PieChartComponent";
import ScatterChartComponent from "./charts/ScatterChartComponent";

const StatisticsPanel = ({ statistics }) => {
  if (!statistics) return null;

  const {
    numerical = [],
    categorical = [],
    correlation = []
  } = statistics;

  // =====================================================
  // DATA TRANSFORMATIONS
  // =====================================================
  const totalNumeric = numerical.length;
  const totalCategorical = categorical.length;

  const meanData = numerical.map((item) => ({
    column: item.column,
    mean: Number(item.mean.toFixed(2))
  }));

  const schemaPie = [
    { name: "Numerical", value: totalNumeric },
    { name: "Categorical", value: totalCategorical }
  ];

  const correlationData = correlation
    .filter(item => item.x !== item.y)
    .slice(0, 50)
    .map((item, idx) => ({
      x: idx, 
      y: item.value 
    }));

  return (
    <div className="space-y-6 antialiased text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100">
      
      {/* ================================================= */}
      {/* 1. ANALYTIC OVERVIEW SCORECARDS */}
      {/* ================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Numerical Features", value: totalNumeric, icon: Sigma, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50/50 dark:bg-indigo-900/10", border: "border-indigo-100 dark:border-indigo-900/30" },
          { label: "Categorical Features", value: totalCategorical, icon: Database, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50/50 dark:bg-violet-900/10", border: "border-violet-100 dark:border-violet-900/30" },
          { label: "Correlation Pairs", value: correlation.length, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50/50 dark:bg-emerald-900/10", border: "border-emerald-100 dark:border-emerald-900/30" },
          { label: "Total Dimensions", value: totalNumeric + totalCategorical, icon: Layers3, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50/50 dark:bg-slate-900/10", border: "border-slate-100 dark:border-slate-800" }
        ].map((stat, i) => (
          <div key={i} className={`relative overflow-hidden bg-white dark:bg-slate-950 border ${stat.border} rounded-lg p-5 shadow-sm transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded ${stat.bg}`}>
                <stat.icon className={stat.color} size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {stat.label}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-mono font-bold tracking-tighter">
                {stat.value}
              </h3>
              <ArrowUpRight size={14} className="text-slate-300" />
            </div>
          </div>
        ))}
      </div>

      {/* ================================================= */}
      {/* 2. CORE DISTRIBUTION ANALYTICS */}
      {/* ================================================= */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* MEAN DISTRIBUTION */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-indigo-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                Variable Central Tendency (Arithmetic Mean)
              </h3>
            </div>
            <Info size={14} className="text-slate-300 hover:text-indigo-500 cursor-help" />
          </div>
          <div className="p-6 h-[380px]">
            <BarChartComponent data={meanData} xKey="column" yKey="mean" color="#6366f1" />
          </div>
        </div>

        {/* SCHEMA COMPOSITION */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
            <Activity size={14} className="text-violet-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
              Dimensional Mix
            </h3>
          </div>
          <div className="p-6 h-[380px]">
            <PieChartComponent data={schemaPie} nameKey="name" dataKey="value" />
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* 3. RELATIONSHIP STRENGTH SCATTER */}
      {/* ================================================= */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
          <Binary size={14} className="text-emerald-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
            Linear Association Coefficients (Pearson's r)
          </h3>
        </div>
        <div className="p-6 h-[400px]">
          <ScatterChartComponent data={correlationData} xKey="x" yKey="y" color="#10b981" />
        </div>
      </div>

      {/* ================================================= */}
      {/* 4. HIGH-DENSITY STATISTICS MATRIX */}
      {/* ================================================= */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-900 dark:bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <TableIcon size={16} className="text-indigo-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.15em]">
              Descriptive Statistics Laboratory
            </h3>
          </div>
          <div className="text-[10px] font-mono text-slate-400">σ-Threshold: Alpha 0.05</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse leading-tight">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase tracking-tighter border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 text-left font-black border-r border-slate-100 dark:border-slate-800">Feature Variable</th>
                <th className="p-4 text-right font-black">Mean (μ)</th>
                <th className="p-4 text-right font-black">Median (M)</th>
                <th className="p-4 text-right font-black">Std Dev (σ)</th>
                <th className="p-4 text-right font-black">Min</th>
                <th className="p-4 text-right font-black">Max</th>
                <th className="p-4 text-right font-black">Skewness (γ₁)</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {numerical.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-4 font-sans font-bold text-slate-900 dark:text-slate-100 border-r border-slate-50 dark:border-slate-800/50 italic">
                    {item.column}
                  </td>
                  <td className="p-4 text-right text-indigo-600 dark:text-indigo-400 font-bold">{item.mean.toFixed(3)}</td>
                  <td className="p-4 text-right">{item.median.toFixed(3)}</td>
                  <td className="p-4 text-right text-slate-500">{item.std.toFixed(3)}</td>
                  <td className="p-4 text-right">{item.min.toFixed(2)}</td>
                  <td className="p-4 text-right">{item.max.toFixed(2)}</td>
                  <td className={`p-4 text-right font-bold ${Math.abs(item.skew) > 1 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {item.skew.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-2 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest text-center">
            Automated Feature Engineering Engine v2.4 • Batch Analysis Complete
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;