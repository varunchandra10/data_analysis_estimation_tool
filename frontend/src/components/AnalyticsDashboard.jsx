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
  RefreshCcw,
  Terminal,
  Info,
  Crosshair
} from "lucide-react";

import BarChartComponent from "./charts/BarChartComponent";
import PieChartComponent from "./charts/PieChartComponent";
import LineChartComponent from "./charts/LineChartComponent";
import CorrelationHeatmap from "./charts/CorrelationHeatmap";
import HistogramChart from "./charts/HistogramChart";
import ScatterChartComponent from "./charts/ScatterChartComponent";
import BoxPlotComponent from "./charts/BoxPlotComponent";
import StatisticsPanel from "./StatisticsPanel";
// import GraphEnclosure from "./GraphEnclosure";
import GraphEnclosure from "./UI/graphModal";

const AnalyticsDashboard = ({
  datasetData,
  validationResult,
  estimationResult,
  outlierResult,
  duplicateResult
}) => {

  if (!datasetData) return null;

  const { metadata, statistics } = datasetData;

  // Analytical metrics logic calculations remain identical
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
    <div className="space-y-6 mt-4 pb-12 antialiased text-slate-200 font-sans max-w-[1600px] mx-auto px-4 sm:px-6 selection:bg-slate-800">

      {/* ================================================= */}
      {/* 1. DASHBOARD HEADER */}
      {/* ================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">System Ready: Batch Mode</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
            Analytical Intelligence Terminal
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
               <Database size={13} />
               <span className="font-mono text-slate-400">{metadata.filename || "Session_Data_01"}</span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
               <Fingerprint size={13} />
               <span className="uppercase tracking-wide text-slate-400 font-mono text-[11px]">Vector ID: {metadata.rows}x{metadata.columns}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-[#0b1329] p-2 rounded-md border border-slate-900 shadow-sm">
           <div className="px-3 py-0.5 border-r border-slate-800">
             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-0.5 text-right">Processing</p>
             <p className="text-xs font-mono font-bold text-emerald-400 text-right uppercase tracking-tight">Real-time</p>
           </div>
           <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-200 hover:text-white rounded-md text-xs font-semibold transition-colors border border-slate-700/60 font-mono">
            Full Report <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

      {/* ================================================= */}
      {/* 2. KPI CARDS */}
      {/* ================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Observations", value: metadata.rows.toLocaleString(), icon: Database, color: "text-slate-500", barColor: "bg-slate-700" },
          { label: "Completeness", value: `${completeness.toFixed(1)}%`, icon: CheckCircle, color: "text-emerald-400", barColor: "bg-emerald-500", highlight: true },
          { label: "Anomaly count", value: outlierResult ? outlierResult.total_outliers : 0, icon: AlertTriangle, color: "text-rose-400", barColor: "bg-rose-500" },
          { label: "Violations", value: validationResult ? validationResult.total_violations : 0, icon: ShieldCheck, color: "text-amber-400", barColor: "bg-amber-500" },
          { label: "Quant vectors", value: numericalStats.length, icon: Activity, color: "text-indigo-400", barColor: "bg-indigo-500" },
          { label: "Qual vectors", value: categoricalStats.length, icon: Layers3, color: "text-violet-400", barColor: "bg-violet-500" },
        ].map((kpi, i) => (
          <div key={i} className="bg-[#0b1329]/60 border-2 border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-slate-700 transition-colors shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">{kpi.label}</span>
              <kpi.icon size={14} className={kpi.color} />
            </div>
            <h3 className={`text-xl font-mono font-bold tracking-tight tabular-nums ${kpi.highlight ? kpi.color : "text-slate-100"}`}>
              {kpi.value}
            </h3>
            <div className="h-1 w-full bg-slate-950 border border-slate-900/60 rounded-full mt-3 overflow-hidden">
               <div className={`h-full ${kpi.barColor} opacity-30`} style={{ width: '100%' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* ================================================= */}
      {/* 3. INDEPENDENT DATA QUALITY ENCLOSURES */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* NULL DENSITY ISOLATED TRACK */}
        <div className="xl:col-span-8">
          <GraphEnclosure
            title="Null Density Distribution"
            subtitle="Null observational gaps categorized across active schema fields"
            icon={BarChart3}
            hasData={missingChartData && missingChartData.length > 0}
          >
            <div className="h-[450px] w-full overflow-hidden pl-4 pr-2">
              <BarChartComponent
                data={missingChartData}
                xKey="column"
                yKey="missing"
                color="#818cf8"
                margin={{ top: 20, right: 10, left: 55, bottom: 100 }}
              />
            </div>
          </GraphEnclosure>
        </div>

        {/* INTEGRITY RATIO ISOLATED TRACK */}
        <div className="xl:col-span-4">
          <GraphEnclosure
            title="Integrity Ratio"
            subtitle="Proportional completeness mix calculation"
            icon={RefreshCcw}
            hasData={qualityPieData && qualityPieData.length > 0}
          >
            <div className="h-[350px] w-full flex items-center justify-center mt-2">
              <PieChartComponent data={qualityPieData} nameKey="name" dataKey="value" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 font-mono text-[11px] border-t border-slate-900 pt-4 w-full">
               <div className="flex flex-col border-l-2 border-emerald-500 pl-2">
                  <span className="text-slate-400 uppercase">Available</span>
                  <span className="text-sm font-bold text-slate-200 mt-0.5">{qualityPieData[0].value.toLocaleString()}</span>
               </div>
               <div className="flex flex-col border-l-2 border-rose-500 pl-2">
                  <span className="text-slate-400 uppercase">Missing</span>
                  <span className="text-sm font-bold text-slate-200 mt-0.5">{qualityPieData[1].value.toLocaleString()}</span>
               </div>
            </div>
          </GraphEnclosure>
        </div>
      </div>

      {/* ===================================================== */}
      {/* 4. INDEPENDENT DISPERSION PROFILE ENCLOSURES */}
      {/* ===================================================== */}
      {outlierResult?.visualizations && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* FEATURE VALUE HISTOGRAMS */}
          <div className="xl:col-span-7">
            <GraphEnclosure
              title="Feature Value Histograms"
              subtitle="Continuous distribution parameters over selected targets"
              icon={BarChart3}
              hasData={outlierResult.visualizations.histogram?.length > 0}
            >
              <div className="h-[380px] w-full overflow-hidden">
                <HistogramChart data={outlierResult.visualizations.histogram} />
              </div>
            </GraphEnclosure>
          </div>

          {/* RESIDUAL SCATTER MAP */}
          <div className="xl:col-span-5">
            <GraphEnclosure
              title="Residual Scatter Map"
              subtitle="Bivariate cross-feature outlier detection maps"
              icon={Crosshair}
              hasData={outlierResult.visualizations.scatterplot?.length > 0}
            >
              <div className="h-[380px] w-full overflow-hidden">
                <ScatterChartComponent data={outlierResult.visualizations.scatterplot} xKey="x" yKey="y" color="#818cf8" />
              </div>
            </GraphEnclosure>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* 5. STATISTICS LABORATORY & BOXPLOT NESTING */}
      {/* ================================================= */}
      {statistics && (
        <div className="bg-[#0f172a] border-2 border-slate-800/80 rounded-xl shadow-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-900 flex items-center gap-3 bg-[#0b1329] text-white">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
              <Sigma size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Descriptive Statistics Laboratory</h3>
              <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">Confidence Interval: 95% σ-verified</p>
            </div>
          </div>
          <div className="p-6 bg-slate-950/10 space-y-6">
            <StatisticsPanel statistics={statistics} />
            
            {/* BOXPLOT HOISTED IN AN INDEPENDENT ENCLOSURE SLOT */}
            {outlierResult?.visualizations?.boxplot && (
              <GraphEnclosure
                title="Structural Outlier Quantiles"
                subtitle="Whisker summary diagnostics evaluating interquartile tracking boundaries"
                icon={Activity}
                hasData={true}
              >
                <div className="pt-2 h-[300px]">
                  <BoxPlotComponent stats={outlierResult.visualizations.boxplot} />
                </div>
              </GraphEnclosure>
            )}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* 6. CORRELATION & VALIDATION ENCLOSURES */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* COVARIANCE HEATMAP */}
        {correlationStats.length > 0 && (
          <div className="xl:col-span-7">
            <GraphEnclosure
              title="Covariance Heatmap (Pearson)"
              subtitle="Linear product-moment relational outputs coefficient metrics"
              icon={Binary}
              hasData={true}
            >
              <div className="w-full overflow-hidden">
                <CorrelationHeatmap data={correlationStats} />
              </div>
            </GraphEnclosure>
          </div>
        )}

        {/* VIOLATION SEVERITY DISTRIBUTION */}
        {validationChartData.length > 0 && (
          <div className="xl:col-span-5">
            <GraphEnclosure
              title="Violation Severity Distribution"
              subtitle="Rule constraint failure weights array metrics"
              icon={ShieldCheck}
              hasData={true}
            >
              <div className="h-[320px] w-full overflow-hidden">
                <BarChartComponent data={validationChartData} xKey="severity" yKey="count" color="#fbbf24" />
              </div>
            </GraphEnclosure>
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* 7. BIAS ESTIMATION & WORKFLOW PROGRESS */}
      {/* ================================================= */}
      <div className="space-y-6">
        {/* BIAS CORRECTION BAR TRACK */}
        {estimationResult && (
          <GraphEnclosure
            title="Computational Bias Correction Profile"
            subtitle="Iterative proportional fitting mapping matrix adjustments"
            icon={Sigma}
            hasData={true}
          >
            <div className="relative z-10 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Iterative Proportional Fitting Comparison</h4>
                </div>
                <div className="bg-slate-950 px-3 py-1 rounded border border-slate-900 font-mono text-right">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wide">Convergence Rate</span>
                  <span className="text-sm font-bold text-indigo-400 font-mono">0.0001Δ</span>
                </div>
              </div>
              <div className="h-[340px] w-full overflow-hidden">
                <BarChartComponent data={weightComparisonData} xKey="label" yKey="value" color="#818cf8" />
              </div>
            </div>
          </GraphEnclosure>
        )}

        {/* WORKFLOW PIPELINE PROGRESS TRACK */}
        <GraphEnclosure
          title="Convergence Workflow Pipeline"
          subtitle="Monitoring fitting iterations sequential convergence logs across session states"
          icon={RefreshCcw}
          hasData={workflowData && workflowData.length > 0}
        >
          <div>
            {/* FIXED HEIGHT CLEARANCE: Expanded layout wrapper box height from h-80 (320px) to h-[380px] */}
            <div className="h-[380px] w-full overflow-hidden pl-4 pr-2">
              <LineChartComponent
                data={workflowData}
                xKey="step"
                yKey="completed"
                color="#818cf8"
                margin={{ top: 20, right: 15, left: 35, bottom: 45 }}
              />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between">
              <p className="text-[10px] font-medium text-slate-500 font-mono">
                * Monitoring iterative proportional fitting convergence across active transformation buffers.
              </p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Live telemetry</span>
              </div>
            </div>
          </div>
        </GraphEnclosure>
      </div>

    </div>
  );
};

export default AnalyticsDashboard;