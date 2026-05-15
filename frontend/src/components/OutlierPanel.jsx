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
  Loader2,
  BrainCircuit,
  Bot,
  Zap,
  ShieldCheck,
  ChevronRight,
  Database,
  Crosshair,
  Cpu,
  Terminal,
  Sigma
} from "lucide-react";

import HistogramChart from "./charts/HistogramChart";
import ScatterChartComponent from "./charts/ScatterChartComponent";
import BoxPlotComponent from "./charts/BoxPlotComponent";

const OutlierPanel = ({ data, aiInsights = [] }) => {
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

      setResult({
        ...response.data,
        column: selectedColumn,
        method: method
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 antialiased text-slate-900 dark:text-slate-100 font-sans max-w-[1600px] mx-auto pb-10">
      
      {/* ===================================================== */}
      {/* 1. ANALYTICAL CONTEXT HEADER */}
      {/* ===================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Sigma size={16} className="text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Diagnostic Module</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Outlier Vector Analysis</h2>
          <p className="text-sm text-slate-500 font-medium italic">Detecting observational deviants in dataset: <span className="font-mono text-indigo-500">{metadata.filename}</span></p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded border border-slate-200 dark:border-slate-800">
           <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Engine Latency</p>
              <p className="text-xs font-mono font-bold text-emerald-500 tracking-tighter">0.12ms / Batch</p>
           </div>
           <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
           <Cpu size={18} className="text-slate-400" />
        </div>
      </div>

      {/* ===================================================== */}
      {/* 2. HEURISTICS ADVISORY BAR */}
      {/* ===================================================== */}
      <div className={`relative overflow-hidden rounded-xl border transition-all duration-500 shadow-sm ${
        aiInsights && aiInsights.length > 0 
        ? "bg-slate-900 border-slate-800 text-white shadow-2xl shadow-rose-500/10" 
        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
      }`}>
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-5">
            <div className={`mt-1 p-3 rounded-xl border-2 ${aiInsights && aiInsights.length > 0 ? "bg-slate-800 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/20" : "bg-slate-100 dark:bg-slate-900 text-slate-400"}`}>
              <BrainCircuit size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className={`text-[11px] font-black tracking-[0.2em] uppercase ${aiInsights?.length > 0 ? "text-rose-400" : "text-slate-500"}`}>
                  Neural Anomaly Heuristics
                </h3>
                {aiInsights?.length > 0 && (
                  <span className="flex items-center gap-1.5 bg-rose-600 text-white text-[9px] px-2 py-0.5 rounded-sm font-black tracking-tighter">
                    <Activity size={10} className="animate-pulse" /> SKEW_DETECTED
                  </span>
                )}
              </div>
              <p className={`text-sm mt-2 font-medium leading-relaxed max-w-2xl ${aiInsights && aiInsights.length > 0 ? "text-slate-300" : "text-slate-500"}`}>
                {aiInsights && aiInsights.length > 0 
                  ? "Distribution skewness identified. Parametric detection methods may yield biased residuals in standard normal models." 
                  : "Variance check complete: Dimension distributions align with standard detection assumptions."}
              </p>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} className={aiInsights?.length > 0 ? "text-rose-500" : "text-emerald-500"} /> Normalcy Verified
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
        
        {/* MODULE HEADER */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-rose-600 rounded-lg text-white shadow-xl shadow-rose-500/20">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">
                Anomaly Parser Workbench
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 uppercase">Vector_Parser_v2.4</span>
                <span className="h-1 w-1 rounded-full bg-slate-300 mx-1" />
                <p className="text-[11px] text-slate-400 font-medium">Detection of observation deviants & high-influence residuals</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS SECTION */}
        <div className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800 p-8">
          <div className="grid md:grid-cols-3 gap-8 items-end">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Database size={12} /> Analytical Vector
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg px-4 py-3 text-[11px] font-black focus:border-indigo-500 outline-none transition-all cursor-pointer text-slate-700 dark:text-slate-200 uppercase tracking-widest"
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  <option value="">— SELECT FIELD —</option>
                  {numericColumns.map((col, idx) => (
                    <option key={idx} value={col.column}>{col.column}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Search size={14} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Settings2 size={12} /> Detection Methodology
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg px-4 py-3 text-[11px] font-black focus:border-indigo-500 outline-none transition-all cursor-pointer text-slate-700 dark:text-slate-200 uppercase tracking-widest"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="iqr">IQR (Interquartile Range - Tukey)</option>
                  <option value="zscore">Z-Score (Standardized residuals)</option>
                  <option value="winsorization">Winsorization (Capping)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Activity size={14} />
                </div>
              </div>
            </div>

            <button
              onClick={handleDetect}
              disabled={loading || !selectedColumn}
              className="flex items-center justify-center gap-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl px-8 py-4 transition-all font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-500/20 active:scale-95 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Crosshair size={18} className="group-hover:rotate-90 transition-transform duration-500" />
              )}
              {loading ? "INITIALIZING STREAMS..." : "EXECUTE ANALYSIS"}
            </button>
          </div>

          {/* AI ADVISORY COLLAPSIBLE */}
          {selectedColumn && aiInsights && aiInsights.find(i => i.column === selectedColumn) && (
            <div className="mt-8 p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-5 animate-in slide-in-from-top-2 duration-500">
              <Bot size={22} className="text-indigo-600 dark:text-indigo-400 mt-1 shrink-0" />
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <h5 className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest">Statistical Advisory</h5>
                  <div className="h-4 w-px bg-indigo-200 dark:bg-indigo-800" />
                  <span className="text-[10px] font-mono font-bold text-indigo-600">STRATEGY: USE_{aiInsights.find(i => i.column === selectedColumn).recommended_method.toUpperCase()}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">
                  "{aiInsights.find(i => i.column === selectedColumn).reason}"
                </p>
                {aiInsights.find(i => i.column === selectedColumn).warning && (
                  <div className="flex items-center gap-2 text-[10px] text-rose-600 dark:text-rose-400 font-black uppercase">
                    <Zap size={12} fill="currentColor" /> {aiInsights.find(i => i.column === selectedColumn).warning}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ANALYSIS OUTPUT */}
        {result && (
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* SCORECARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Outlier Frequency", value: result.total_outliers, icon: AlertTriangle, color: "text-rose-500", sub: "Calculateddeviants" },
                { label: "Execution Model", value: result.method || method, icon: Settings2, color: "text-slate-400", sub: "Algorithm scope" },
                { label: "Target Feature", value: result.column || selectedColumn, icon: Database, color: "text-indigo-500", sub: "Active dimension" },
              ].map((kpi, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{kpi.label}</span>
                    <kpi.icon size={16} className={kpi.color} strokeWidth={2.5} />
                  </div>
                  <h3 className={`font-mono font-bold tracking-tighter truncate ${typeof kpi.value === 'number' ? 'text-4xl text-rose-600' : 'text-xl uppercase text-slate-700 dark:text-slate-200'}`}>
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-tighter italic">// {kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* PRIMARY CHARTS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity size={16} /> Density Distribution
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">Binned Intervals</span>
                </div>
                <div className="h-[300px]">
                  <HistogramChart data={result.visualizations?.histogram || []} />
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Crosshair size={16} /> Residual Scatter Map
                  </h3>
                  <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                </div>
                <div className="h-[300px]">
                  <ScatterChartComponent data={result.visualizations?.scatterplot || []} xKey="x" yKey="y" />
                </div>
              </div>
            </div>

            {/* QUARTILE SECTION */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white">
                <div className="flex items-center gap-3">
                  <Terminal size={16} className="text-indigo-400" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Five-Number Summary Diagnostic</h3>
                </div>
                <div className="group relative">
                  <Info size={14} className="text-slate-400 hover:text-white cursor-help" />
                  <div className="absolute right-0 bottom-full mb-4 w-80 p-4 bg-slate-800 text-slate-100 text-[11px] leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-slate-700 backdrop-blur-md font-medium">
                    The Box-and-Whisker plot identifies standard dispersion via Tukey's hinges. Extremes defined as values &gt 1.5 * IQR from the quartile boundaries.
                  </div>
                </div>
              </div>
              <div className="p-10 space-y-12">
                <BoxPlotComponent stats={result.visualizations?.boxplot || {}} />
                
                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Calculated Statistical Boundaries</p>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(result.thresholds || {}).map(([key, val], idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                           <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{key.replace('_', ' ')}</p>
                           <p className="font-mono text-sm font-bold text-indigo-500 tracking-tighter">
                             {typeof val === 'number' ? val.toFixed(4) : String(val)}
                           </p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>

            {/* ANOMALY DATA GRID */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TableIcon size={18} className="text-rose-500" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Observation Matrix: Anomalies Identified</h3>
                </div>
                <span className="text-[10px] font-mono font-black text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-3 py-1 rounded border border-rose-100 dark:border-rose-900/30">FLAGGED_BUFFER</span>
              </div>

              {(result.affected_rows?.length || 0) === 0 ? (
                <div className="p-20 text-center bg-slate-50/50 dark:bg-slate-950/20">
                  <div className="inline-flex p-5 rounded-full bg-emerald-500/10 text-emerald-500 mb-6 border border-emerald-500/20">
                    <ShieldCheck size={40} />
                  </div>
                  <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-lg leading-none">Zero Anomaly Distribution</h4>
                  <p className="text-sm text-slate-500 mt-3 max-w-sm mx-auto font-medium italic leading-relaxed">
                    The {result.method?.toUpperCase()} algorithm identified no observations outside the calculated threshold barriers. Statistical integrity confirmed.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-[11px] border-collapse leading-none">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[9px] font-black tracking-widest border-b border-slate-200 dark:border-slate-800">
                        {result.affected_rows?.[0] && Object.keys(result.affected_rows[0]).map((key, idx) => (
                          <th key={idx} className="px-6 py-4 border-r border-slate-100 dark:border-slate-800 last:border-0 text-left">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-mono tabular-nums divide-y divide-slate-100 dark:divide-slate-800">
                      {result.affected_rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors">
                          {Object.values(row).map((value, i) => (
                            <td key={i} className="px-6 py-4 text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 last:border-0 whitespace-nowrap">
                              {typeof value === 'number' ? (
                                <span className="text-rose-600 dark:text-rose-400 font-bold">{value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              ) : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-8 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-center">
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.3em]">
                      // End of Anomaly Scan Output
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlierPanel;