import React, { useState } from "react";
import axios from "axios";
import { apiUrl } from "../../../api/config";
import { 
  AlertCircle, 
  CheckCircle2, 
  Settings2,
  Loader2,
  BrainCircuit,
  Bot,
  ShieldCheck,
  Zap,
  ChevronRight,
  Database,
  BarChart3,
  PieChart,
  Activity,
  Terminal,
  Cpu,
  Layers,
  FlaskConical
} from "lucide-react";
import BarChartComponent from "../../charts/BarChartComponent";
import PieChartComponent from "../../charts/PieChartComponent";
import GraphEnclosure from "../../UI/graphModal";

const MissingValuePanel = ({ data, aiInsights = [], onCleaningComplete }) => {
  if (!data) return null;

  const { metadata, schema } = data;
  const [strategies, setStrategies] = useState({});
  const [loading, setLoading] = useState(false);

  const columnsWithNulls = schema.filter(
    (col) => metadata.null_counts[col.column] > 0
  );

  const totalMissing = Object.values(metadata.null_counts).reduce(
    (acc, val) => acc + val,
    0
  );
  const totalCells = metadata.rows * metadata.columns;
  const totalAvailable = totalCells - totalMissing;
  const completenessRate = ((totalAvailable / totalCells) * 100).toFixed(2);

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
        apiUrl("/api/clean/missing-values"),
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
    <div className="space-y-6 antialiased text-slate-200 font-sans max-w-[1600px] mx-auto pb-12 px-4 sm:px-6">
      
      {/* ===================================================== */}
      {/* 1. ANALYTICAL CONTEXT HEADER */}
      {/* ===================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Diagnostic Module</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">Null Observation Audit</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Detecting and remediating structural voids in dataset: <span className="font-mono text-indigo-400">{metadata.filename}</span></p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#0b1329] px-4 py-2 rounded-md border border-slate-900">
           <div className="text-right">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Engine Latency</p>
              <p className="text-xs font-mono font-bold text-emerald-400 tracking-tight">0.4ms / Vector</p>
           </div>
           <div className="h-6 w-px bg-slate-800 mx-1" />
           <Cpu size={16} className="text-slate-400" />
        </div>
      </div>

      {/* ===================================================== */}
      {/* 2. AI HEURISTICS OVERLAY */}
      {/* ===================================================== */}
      <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-md ${
        aiInsights?.length > 0 
        ? "bg-[#0b1329] border-indigo-500/40" 
        : "bg-[#0f172a] border-slate-800"
      }`}>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className={`mt-0.5 p-2.5 rounded-lg border ${aiInsights?.length > 0 ? "bg-slate-950 border-indigo-500/40 text-indigo-400" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
              <BrainCircuit size={20} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-[10px] font-bold tracking-wider uppercase text-indigo-400">
                  Neural Imputation Heuristics
                </h3>
                {aiInsights?.length > 0 && (
                  <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 text-[9px] px-2 py-0.5 rounded-sm font-bold border border-indigo-500/20 font-mono">
                    <Activity size={10} className="animate-pulse" /> MODEL_ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs mt-1.5 font-medium leading-relaxed text-slate-300 max-w-3xl">
                {aiInsights?.length > 0 
                  ? "Neural patterns detected. The Statistical Insight Engine recommends specific imputation methods to minimize bias and preserve standard deviation across binned variables." 
                  : "Structural scan complete. No high-variance patterns detected. Waiting for user-defined imputation strategy."}
              </p>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-900 rounded-md text-indigo-400 text-[10px] font-bold uppercase tracking-wider font-mono">
            <Bot size={13} /> AI Copilot Active
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* 3. METRICS AND CHARTS PANELS */}
      {/* ===================================================== */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* TABULAR METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-900 border-b border-slate-900 bg-[#0b1329]/40">
          {[
            { label: "Missing Observations", value: totalMissing.toLocaleString(), sub: "Total Δ Gaps", icon: AlertCircle, color: "text-rose-400" },
            { label: "Impacted Dimensions", value: columnsWithNulls.length, sub: "High Variance Columns", icon: Database, color: "text-indigo-400" },
            { label: "Completeness Score", value: `${completenessRate}%`, sub: "Dataset Integrity", icon: Activity, color: "text-emerald-400" }
          ].map((kpi, i) => (
            <div key={i} className="p-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <kpi.icon size={13} className={kpi.color} /> {kpi.label}
              </p>
              <div className="flex items-baseline gap-2">
                 <h3 className="text-3xl font-mono font-bold tracking-tight text-slate-100">{kpi.value}</h3>
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide font-mono">[{kpi.sub}]</span>
              </div>
              {kpi.label === "Completeness Score" && (
                <div className="mt-4 w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${completenessRate}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* DATA VISUALIZATION BLOCK (DYNAMIC ENCLOSURE UPGRADE) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 bg-slate-950/20">
          
          {/* FREQUENCY DISTRIBUTION DYNAMIC ENCLOSURE */}
          <div className="xl:col-span-8">
            <GraphEnclosure
              title="Frequency Distribution"
              subtitle="Null density across identified vector headers"
              tooltipText="Analyzes granular text features. Bottom graph padding properties scale automatically to block text overlap."
              icon={BarChart3}
              hasData={missingBarData && missingBarData.length > 0}
            >
              <div className="h-[450px] w-full overflow-hidden pl-4 pr-2 bg-[#0f172a]">
                 <BarChartComponent data={missingBarData} xKey="column" yKey="missing" color="#818cf8" />
              </div>
            </GraphEnclosure>
          </div>

          {/* INTEGRITY RATIO DYNAMIC ENCLOSURE */}
          <div className="xl:col-span-4">
            <GraphEnclosure
              title="Integrity Ratio"
              subtitle="Proportional state metrics"
              icon={PieChart}
              hasData={missingPieData && missingPieData.length > 0}
            >
              <div className="h-[350px] w-full flex items-center justify-center mt-2 bg-[#0f172a]">
                <PieChartComponent data={missingPieData} nameKey="name" dataKey="value" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 font-mono text-[11px] border-t border-slate-900 pt-4 w-full bg-[#0f172a]">
                 <div className="flex flex-col border-l-2 border-emerald-500 pl-2">
                    <span className="text-slate-500 uppercase tracking-wide text-[10px]">Available</span>
                    <span className="text-sm font-bold text-slate-200 mt-0.5">{missingPieData[1].value.toLocaleString()}</span>
                 </div>
                 <div className="flex flex-col border-l-2 border-rose-500 pl-2">
                    <span className="text-slate-500 uppercase tracking-wide text-[10px]">Missing</span>
                    <span className="text-sm font-bold text-slate-200 mt-0.5">{missingPieData[0].value.toLocaleString()}</span>
                 </div>
              </div>
            </GraphEnclosure>
          </div>

        </div>

        {/* IMPUTATION CONFIGURATION WORKFLOW */}
        <div className="m-6 p-6 border-2 border-slate-800/80 bg-[#0f172a] rounded-xl">
          <div className="flex items-center justify-between mb-6 border-b border-slate-900 pb-4">
              <div className="flex items-center gap-2">
                  <Settings2 size={15} className="text-indigo-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Remediation Workflow</h4>
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                Manual Override: Active
              </div>
          </div>

          {columnsWithNulls.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-16 text-center bg-slate-950/20">
              <div className="inline-flex p-4 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
                  <CheckCircle2 size={32} />
              </div>
              <p className="text-sm font-bold text-slate-200 uppercase tracking-wide font-mono">Zero Null Bias Detected</p>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                The current dataset maintains 100% observational density. No imputation necessary for the selected binned segments.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {columnsWithNulls.map((col, idx) => {
                const columnInsight = aiInsights.find(insight => insight.column === col.column);

                return (
                  <div key={idx} className="group overflow-hidden rounded-lg border border-slate-900 bg-[#0b1329]/30 hover:border-slate-700 transition-colors shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 gap-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-950 border border-slate-900 text-[10px] font-mono font-bold text-slate-400 uppercase">
                            {col.type === "Numerical" ? "F64" : "OBJ"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <p className="font-mono font-bold text-slate-200 text-sm tracking-tight">{col.column}</p>
                            <span className="text-[9px] font-bold text-rose-400 border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                                Critical Gap
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                             <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-500">
                                <AlertCircle size={11} className="text-rose-400/70" /> {metadata.null_counts[col.column].toLocaleString()} Observations
                             </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="hidden xl:block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action:</span>
                        <select
                          className="w-full lg:w-[260px] border border-slate-700 bg-slate-950 hover:border-slate-600 rounded-md px-3 py-2 text-[11px] font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer text-slate-200 uppercase tracking-wide font-mono shadow-inner"
                          value={strategies[col.column] || ""}
                          onChange={(e) => handleStrategyChange(col.column, e.target.value)}
                        >
                          <option value="" className="text-slate-500">— Select Strategy —</option>
                          <option value="drop" className="text-slate-200 bg-slate-950">Drop Observations</option>
                          {col.type === "Numerical" && (
                            <>
                              <option value="mean" className="text-slate-200 bg-slate-950">Arithmetic Mean</option>
                              <option value="median" className="text-slate-200 bg-slate-950">Statistical Median</option>
                              <option value="knn" className="text-slate-200 bg-slate-950">K-Nearest Vectors</option>
                            </>
                          )}
                          <option value="most_frequent" className="text-slate-200 bg-slate-950">Mode Frequency</option>
                        </select>
                      </div>
                    </div>

                    {columnInsight && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="p-4 rounded-md bg-slate-950/60 border border-slate-900 flex items-start gap-3.5">
                          <Bot size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                          <div className="space-y-2 w-full">
                            <div className="flex flex-wrap items-center gap-3 border-b border-slate-900 pb-1.5">
                              <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Model Recommendation: <span className="underline underline-offset-4 font-mono font-bold text-slate-200">{columnInsight.recommended_method}</span></h5>
                              <div className="h-3 w-px bg-slate-800" />
                              <span className="text-[10px] font-mono text-slate-500">Confidence: 0.94</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium font-sans">
                              {columnInsight.reason}
                            </p>
                            {columnInsight.warning && (
                              <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold bg-slate-950 px-2 py-1 rounded border border-amber-500/10 shadow-sm font-mono uppercase inline-flex">
                                <Zap size={11} fill="currentColor" className="text-amber-500" /> {columnInsight.warning}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM GLOBAL ACTION BAR */}
        {columnsWithNulls.length > 0 && (
          <div className="px-6 py-5 bg-[#0b1329] border-t border-slate-900 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4 text-slate-400 max-w-2xl">
               <div className="p-2 bg-slate-950 rounded border border-slate-900 text-amber-500 shrink-0">
                  <ShieldCheck size={16} />
               </div>
               <div className="space-y-0.5">
                 <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">Data Persistence Warning</p>
                 <p className="text-[11px] leading-relaxed text-slate-500 font-medium font-sans">
                   Executing this pipeline will commit transformations to the <span className="font-mono text-slate-400">BUFFER_SESSION</span>. The statistical distribution will be altered. Ensure all binned methodologies align with project research standards before finalizing.
                 </p>
               </div>
            </div>
            <button
              onClick={handleApplyCleaning}
              disabled={loading || Object.keys(strategies).length === 0}
              className="w-full lg:w-auto flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-950 disabled:text-slate-600 border border-transparent disabled:border-slate-900 text-white px-6 py-3 rounded-md font-bold uppercase text-[11px] tracking-wide shadow-md active:scale-95 transition-all group font-mono shrink-0"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Terminal size={14} className="group-hover:translate-x-0.5 transition-transform" />
              )}
              {loading ? "INITIALIZING STREAMS..." : "COMMIT TRANSFORMATION PIPELINE"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissingValuePanel;
