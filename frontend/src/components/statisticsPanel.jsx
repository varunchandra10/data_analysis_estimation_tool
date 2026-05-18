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
  ArrowUpRight
} from "lucide-react";

import BarChartComponent from "./charts/BarChartComponent";
import PieChartComponent from "./charts/PieChartComponent";
import ScatterChartComponent from "./charts/ScatterChartComponent";
import GraphEnclosure from "./UI/graphModal";


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
    <div className="space-y-6 antialiased text-slate-200 font-sans max-w-[1600px] mx-auto pb-10 selection:bg-slate-800">
      
      {/* ================================================= */}
      {/* 1. ANALYTIC OVERVIEW SCORECARDS */}
      {/* ================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Numerical Features", value: totalNumeric, icon: Sigma, color: "text-indigo-400", bg: "bg-slate-950/60", border: "border-slate-800" },
          { label: "Categorical Features", value: totalCategorical, icon: Database, color: "text-violet-400", bg: "bg-slate-950/60", border: "border-slate-800" },
          { label: "Correlation Pairs", value: correlation.length, icon: TrendingUp, color: "text-emerald-400", bg: "bg-slate-950/60", border: "border-slate-800" },
          { label: "Total Dimensions", value: totalNumeric + totalCategorical, icon: Layers3, color: "text-slate-400", bg: "bg-slate-950/60", border: "border-slate-800" }
        ].map((stat, i) => (
          <div key={i} className="relative bg-[#0b1329]/60 border-2 border-slate-800 rounded-xl p-5 shadow-md hover:border-slate-700 transition-colors duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {stat.label}
              </span>
              <div className={`p-1.5 rounded-sm ${stat.bg} text-slate-400 border border-slate-700/30 shrink-0`}>
                <stat.icon className={stat.color} size={14} />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
                {stat.value}
              </h3>
              <ArrowUpRight size={13} className="text-slate-600" />
            </div>
          </div>
        ))}
      </div>

      {/* ================================================= */}
      {/* 2. CORE DISTRIBUTION ANALYTICS IN ENCLOSURES */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* VARIABLE CENTRAL TENDENCY BAR ENCLOSURE */}
        <div className="lg:col-span-8">
          <GraphEnclosure
            title="Variable Central Tendency (Arithmetic Mean)"
            subtitle="Central location metrics overview across active quantitative profiles"
            tooltipText="Displays arithmetic averages. Long schema tokens are adjusted dynamically to verify alignment."
            icon={BarChart3}
            hasData={meanData && meanData.length > 0}
          >
            <div className="h-[400px] w-full overflow-hidden pl-4 pr-2">
              <BarChartComponent 
                data={meanData} 
                xKey="column" 
                yKey="mean" 
                color="#818cf8" 
                margin={{ top: 20, right: 10, left: 55, bottom: 100 }}
              />
            </div>
          </GraphEnclosure>
        </div>

        {/* DIMENSIONAL MIX PIE ENCLOSURE */}
        <div className="lg:col-span-4">
          <GraphEnclosure
            title="Dimensional Mix"
            subtitle="Composition analysis of schema architecture type distributions"
            icon={Activity}
            hasData={schemaPie && schemaPie.length > 0}
          >
            <div className="h-[350px] w-full flex items-center justify-center">
              <PieChartComponent data={schemaPie} nameKey="name" dataKey="value" />
            </div>
          </GraphEnclosure>
        </div>

      </div>

      {/* ================================================= */}
      {/* 3. RELATIONSHIP STRENGTH SCATTER ENCLOSURE */}
      {/* ================================================= */}
      <GraphEnclosure
        title="Linear Association Coefficients (Pearson's r)"
        subtitle="Bivariate correlation magnitude index mappings across paired columns"
        icon={Binary}
        hasData={correlationData && correlationData.length > 0}
      >
        <div className="h-[400px] bg-slate-950/20 w-full overflow-hidden">
          <ScatterChartComponent data={correlationData} xKey="x" yKey="y" color="#34d399" />
        </div>
      </GraphEnclosure>

      {/* ================================================= */}
      {/* 4. HIGH-DENSITY STATISTICS MATRIX */}
      {/* ================================================= */}
      <div className="bg-[#0f172a] border-2 border-slate-800/80 rounded-xl shadow-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-900 flex items-center justify-between bg-[#0b1329] text-slate-100">
          <div className="flex items-center gap-2.5">
            <TableIcon size={14} className="text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
              // Descriptive Statistics Laboratory
            </h3>
          </div>
          <div className="text-[10px] font-mono font-medium bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-900">
            σ-Threshold: Alpha 0.05
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0f172a] text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-900">
                <th className="px-6 py-3.5 font-bold border-r border-slate-900 last:border-0">Feature Variable</th>
                <th className="px-6 py-3.5 font-bold text-right border-r border-slate-900 last:border-0">Mean (μ)</th>
                <th className="px-6 py-3.5 font-bold text-right border-r border-slate-900 last:border-0">Median (M)</th>
                <th className="px-6 py-3.5 font-bold text-right border-r border-slate-900 last:border-0">Std Dev (σ)</th>
                <th className="px-6 py-3.5 font-bold text-right border-r border-slate-900 last:border-0">Min</th>
                <th className="px-6 py-3.5 font-bold text-right border-r border-slate-900 last:border-0">Max</th>
                <th className="px-6 py-3.5 font-bold text-right last:border-0">Skewness (γ₁)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 bg-[#0f172a]/20 font-mono text-[11px]">
              {numerical.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors border-b border-slate-900/40">
                  <td className="px-6 py-2.5 font-sans font-bold text-slate-100 border-r border-slate-900/40 last:border-0 italic">
                    {item.column}
                  </td>
                  <td className="px-6 py-2.5 text-right text-indigo-400 font-bold border-r border-slate-900/40 last:border-0">{item.mean.toFixed(3)}</td>
                  <td className="px-6 py-2.5 text-right text-slate-300 border-r border-slate-900/40 last:border-0">{item.median.toFixed(3)}</td>
                  <td className="px-6 py-2.5 text-right text-slate-400 border-r border-slate-900/40 last:border-0">{item.std.toFixed(3)}</td>
                  <td className="px-6 py-2.5 text-right text-slate-300 border-r border-slate-900/40 last:border-0">{item.min.toFixed(2)}</td>
                  <td className="px-6 py-2.5 text-right text-slate-300 border-r border-slate-900/40 last:border-0">{item.max.toFixed(2)}</td>
                  <td className={`px-6 py-2.5 text-right font-bold last:border-0 ${Math.abs(item.skew) > 1 ? 'text-amber-400 bg-amber-500/5' : 'text-slate-500'}`}>
                    {item.skew.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;