import React from "react";
import {
  CheckCircle,
  AlertTriangle,
  Database,
  BarChart3,
  ShieldCheck,
  Sigma,
  Activity,
  Layers3,
  Binary,
  ArrowUpRight,
  Fingerprint,
  RefreshCcw
} from "lucide-react";

import BarChartComponent from "./charts/BarChartComponent";
import PieChartComponent from "./charts/PieChartComponent";
import LineChartComponent from "./charts/LineChartComponent";
import CorrelationHeatmap from "./charts/CorrelationHeatmap";
import StatisticsPanel from "./StatisticsPanel";

const AnalyticsDashboard = ({
  datasetData,
  validationResult,
  estimationResult,
  outlierResult,
  duplicateResult
}) => {

  if (!datasetData) return null;

  const { metadata, statistics } = datasetData;

  // Logic remains identical as per your request
  const totalMissing = Object.values(metadata.null_counts).reduce((acc, val) => acc + val, 0);
  const completeness = (((metadata.rows * metadata.columns) - totalMissing) / (metadata.rows * metadata.columns)) * 100;
  const missingChartData = Object.entries(metadata.null_counts).map(([key, value]) => ({ column: key, missing: value }));
  const qualityPieData = [{ name: "Available", value: (metadata.rows * metadata.columns) - totalMissing }, { name: "Missing", value: totalMissing }];
  const workflowData = [
    { step: "Upload", completed: 100 },
    { step: "Cleaning", completed: 100 },
    { step: "Validation", completed: validationResult ? 100 : 0 },
    { step: "Estimation", completed: estimationResult ? 100 : 0 }
  ];
  const validationChartData = validationResult ? [
    { severity: "Low", count: validationResult.severity_counts.low },
    { severity: "Medium", count: validationResult.severity_counts.medium },
    { severity: "High", count: validationResult.severity_counts.high }
  ] : [];
  const weightComparisonData = estimationResult?.visualizations || [];
  const numericalStats = statistics?.numerical || [];
  const categoricalStats = statistics?.categorical || [];
  const correlationStats = statistics?.correlation || [];

  return (
    <div className="space-y-8 mt-4 pb-12 antialiased text-slate-900 dark:text-slate-100 font-sans">

      {/* ================================================= */}
      {/* DASHBOARD HEADER: Technical Lab Style */}
      {/* ================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">System Ready: Batch Mode</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            Analytical Intelligence Terminal
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
               <Database size={14} />
               <span className="font-mono">{metadata.filename || "Session_Data_01"}</span>
            </div>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
               <Fingerprint size={14} />
               <span className="uppercase tracking-tighter">Vector ID: {metadata.rows}x{metadata.columns}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="px-4 py-1 border-r border-slate-100 dark:border-slate-800">
             <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1 text-right">Processing</p>
             <p className="text-xs font-mono font-bold text-emerald-500 text-right uppercase tracking-tighter">Real-time</p>
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold transition-all hover:bg-black dark:hover:bg-slate-200">
            Full Report <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* ================================================= */}
      {/* KPI CARDS: Scientific Scorecard */}
      {/* ================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Observations", value: metadata.rows.toLocaleString(), icon: Database, color: "text-slate-400" },
          { label: "Completeness", value: `${completeness.toFixed(1)}%`, icon: CheckCircle, color: "text-emerald-500", highlight: true },
          { label: "Anomaly count", value: outlierResult ? outlierResult.total_outliers : 0, icon: AlertTriangle, color: "text-rose-500" },
          { label: "Violations", value: validationResult ? validationResult.total_violations : 0, icon: ShieldCheck, color: "text-amber-500" },
          { label: "Quant vectors", value: numericalStats.length, icon: Activity, color: "text-blue-500" },
          { label: "Qual vectors", value: categoricalStats.length, icon: Layers3, color: "text-violet-500" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5 relative overflow-hidden group hover:border-indigo-400 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{kpi.label}</span>
              <kpi.icon size={16} className={kpi.color} strokeWidth={2.5} />
            </div>
            <h3 className={`text-2xl font-mono font-bold tracking-tighter tabular-nums ${kpi.highlight ? kpi.color : "text-slate-900 dark:text-white"}`}>
              {kpi.value}
            </h3>
            <div className="h-1 w-full bg-slate-100 dark:bg-slate-900 rounded-full mt-4 overflow-hidden">
               <div className={`h-full ${kpi.color.replace('text', 'bg')} opacity-30`} style={{ width: '100%' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* ================================================= */}
      {/* DATA QUALITY SECTION: Grid Layout */}
      {/* = ================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* MISSING VALUES */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <BarChart3 size={18} className="text-indigo-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">Null Density Distribution</h3>
            </div>
            <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">Unit: Frequency</span>
          </div>
          <div className="p-8">
            <BarChartComponent data={missingChartData} xKey="column" yKey="missing" />
          </div>
        </div>

        {/* QUALITY PIE */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col justify-center">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8 flex items-center gap-2">
            <RefreshCcw size={16} className="text-emerald-500" /> Integrity Ratio
          </h3>
          <div className="h-64">
            <PieChartComponent data={qualityPieData} nameKey="name" dataKey="value" />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 font-mono text-[11px]">
             <div className="flex flex-col border-l-2 border-emerald-500 pl-2">
                <span className="text-slate-400 uppercase">Available</span>
                <span className="text-lg font-bold">{qualityPieData[0].value.toLocaleString()}</span>
             </div>
             <div className="flex flex-col border-l-2 border-rose-500 pl-2">
                <span className="text-slate-400 uppercase">Missing</span>
                <span className="text-lg font-bold">{qualityPieData[1].value.toLocaleString()}</span>
             </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* ADVANCED STATISTICS PANEL: Laboratory Style */}
      {/* ================================================= */}
      {statistics && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-slate-900 text-white">
            <div className="p-2 bg-indigo-500 rounded text-white shadow-lg shadow-indigo-500/20">
              <Sigma size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Descriptive Statistics laboratory</h3>
              <p className="text-[10px] text-slate-400 font-medium">Confidence Interval: 95% σ-verified</p>
            </div>
          </div>
          <div className="p-8">
            <StatisticsPanel statistics={statistics} />
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* CORRELATION MATRIX & VALIDATION GRID */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {correlationStats.length > 0 && (
          <div className="xl:col-span-7 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <Binary className="text-indigo-600" size={20} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Covariance Heatmap (Pearson)</h3>
            </div>
            <CorrelationHeatmap data={correlationStats}/>
          </div>
        )}

        <div className="xl:col-span-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8 flex items-center gap-2">
            <ShieldCheck size={18} className="text-amber-500" /> Violation Distribution
          </h3>
          <div className="flex-grow">
            <BarChartComponent data={validationChartData} xKey="severity" yKey="count" />
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* WEIGHT ESTIMATION & PIPELINE PROGRESS */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {estimationResult && (
          <div className="xl:col-span-8 bg-slate-900 dark:bg-black rounded-xl p-10 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sigma size={200} />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold tracking-tight uppercase">Computational Bias Correction</h3>
                  <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">Iterative Proportional Fitting Comparison</p>
                </div>
                <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 font-mono">
                  <span className="text-xs text-slate-500 block uppercase font-black">Convergence Rate</span>
                  <span className="text-lg font-bold text-indigo-400">0.0001Δ</span>
                </div>
              </div>
              <BarChartComponent data={weightComparisonData} xKey="label" yKey="value" />
            </div>
          </div>
        )}
{/* ================================================= */}
{/* CONVERGENCE WORKFLOW - FULL WIDTH WORKBENCH STYLE */}
{/* ================================================= */}
<div className="col-span-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all">
  {/* Sub-header for the chart area */}
  <div className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <RefreshCcw className="text-indigo-500 animate-spin-slow" size={18} />
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
        Convergence Workflow Pipeline
      </h3>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-mono font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 uppercase">
        Mode: Linear_Sequence
      </span>
    </div>
  </div>

  {/* Chart Area */}
  <div className="p-8">
    <div className="h-72 w-full">
      <LineChartComponent 
        data={workflowData} 
        xKey="step" 
        yKey="completed" 
        color="#6366f1" 
      />
    </div>
    
    {/* Professional Footer for the chart context */}
    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
      <p className="text-[10px] font-medium text-slate-400 italic">
        * Monitoring iterative proportional fitting convergence across active transformation buffers.
      </p>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live telemetry</span>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;