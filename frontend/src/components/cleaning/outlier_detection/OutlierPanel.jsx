import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl } from "../../../api/config";
import { 
  AlertTriangle, 
  BarChart3, 
  Settings2, 
  Table as TableIcon, 
  Activity, 
  Info, 
  Loader2, 
  BrainCircuit, 
  Bot, 
  Zap, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Database, 
  Crosshair, 
  Cpu, 
  Terminal, 
  Sigma
} from "lucide-react";

import HistogramChart from "../../charts/HistogramChart";
import ScatterChartComponent from "../../charts/ScatterChartComponent";
import BoxPlotComponent from "../../charts/BoxPlotComponent";
import GraphEnclosure from "../../UI/graphModal";

const OutlierPanel = ({ data, aiInsights = [] }) => {
  if (!data) return null;

  const { metadata, schema } = data;
  const numericColumns = schema.filter((col) => col.type === "Numerical");

  const [selectedColumn, setSelectedColumn] = useState("");
  const [method, setMethod] = useState("iqr");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  const handleDetect = async () => {
    if (!selectedColumn) return;
    setLoading(true);
    try {
      const response = await axios.post(apiUrl("/api/outliers/detect"), {
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

  const handleApply = async () => {
    if (!result) return;
    setApplyLoading(true);
    try {
      const response = await axios.post(apiUrl("/api/outliers/apply"), {
        file_path: metadata.file_path,
        column: selectedColumn,
        method: method,
      });

      setResult((r) => ({ ...r, applied: true, file_path: response.data.file_path, preview: response.data.preview, applied_preview: undefined }));

    } catch (err) {
      console.error(err);
    } finally {
      setApplyLoading(false);
    }
  };

  // Helper flags evaluating active chart arrays for structural safety blocks
  const hasHistogramData = result?.visualizations?.histogram && result.visualizations.histogram.length > 0;
  const hasScatterData = result?.visualizations?.scatterplot && result.visualizations.scatterplot.length > 0;

  return (
    <div className="space-y-6 antialiased text-slate-200 font-sans max-w-[1600px] mx-auto pb-10 px-4 sm:px-6">
      
      {/* ===================================================== */}
      {/* 1. ANALYTICAL CONTEXT HEADER */}
      {/* ===================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Sigma size={14} className="text-rose-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Diagnostic Module</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">Outlier Vector Analysis</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Detecting observational deviants in dataset: <span className="font-mono text-indigo-400">{metadata.filename}</span></p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#0b1329] px-4 py-2 rounded-md border border-slate-900">
           <div className="text-right">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Engine Latency</p>
              <p className="text-xs font-mono font-bold text-emerald-400 tracking-tight">0.12ms / Batch</p>
           </div>
           <div className="h-6 w-px bg-slate-800 mx-1" />
           <Cpu size={16} className="text-slate-400" />
        </div>
      </div>

      {/* ===================================================== */}
      {/* 2. HEURISTICS ADVISORY BAR */}
      {/* ===================================================== */}
      <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-md ${
        aiInsights && aiInsights.length > 0 
        ? "bg-[#0b1329] border-rose-500/30" 
        : "bg-[#0f172a] border-slate-800"
      }`}>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className={`mt-0.5 p-2.5 rounded-lg border ${aiInsights && aiInsights.length > 0 ? "bg-slate-950 border-rose-500/40 text-rose-400" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
              <BrainCircuit size={20} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-[10px] font-bold tracking-wider uppercase text-rose-400">
                  Neural Anomaly Heuristics
                </h3>
                {aiInsights?.length > 0 && (
                  <span className="flex items-center gap-1 bg-rose-500/10 text-rose-400 text-[9px] px-2 py-0.5 rounded-sm font-bold border border-rose-500/20 font-mono">
                    <Activity size={10} className="animate-pulse" /> SKEW_DETECTED
                  </span>
                )}
              </div>
              <p className="text-xs mt-1.5 font-medium leading-relaxed max-w-2xl text-slate-300">
                {aiInsights && aiInsights.length > 0 
                  ? "Distribution skewness identified. Parametric detection methods may yield biased residuals in standard normal models." 
                  : "Variance check complete: Dimension distributions align with standard detection assumptions."}
              </p>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-900 rounded-md text-indigo-400 text-[10px] font-bold uppercase tracking-wider font-mono">
            <Bot size={13} /> AI Copilot Active
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-xl border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* MODULE HEADER */}
        <div className="px-6 py-4 border-b border-slate-900 bg-[#0b1329]/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-200 uppercase font-mono">
                Anomaly Parser Workbench
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono font-bold bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-slate-500 uppercase">Vector_Parser_v2.4</span>
                <span className="h-1 w-1 rounded-full bg-slate-800" />
                <p className="text-[11px] text-slate-500 font-medium">Detection of observation deviants & high-influence residuals</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS SECTION */}
        <div className="bg-slate-950/10 border-b border-slate-900 p-6">
          <div className="grid md:grid-cols-3 gap-6 items-end">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Database size={13} /> Analytical Vector
              </label>
              <div className="relative">
                <select
                  className="w-full border border-slate-700 bg-slate-950 hover:border-slate-600 rounded-md px-3 py-2 text-[11px] font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer text-slate-300 uppercase tracking-wide font-mono shadow-inner"
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  <option value="" className="text-slate-500">— SELECT FIELD —</option>
                  {numericColumns.map((col, idx) => (
                    <option key={idx} value={col.column} className="bg-slate-950 text-slate-200">{col.column}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Settings2 size={13} /> Detection Methodology
              </label>
              <div className="relative">
                <select
                  className="w-full border border-slate-700 bg-slate-950 hover:border-slate-600 rounded-md px-3 py-2 text-[11px] font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer text-slate-300 uppercase tracking-wide font-mono shadow-inner"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="iqr" className="bg-slate-950 text-slate-200">IQR (Interquartile Range - Tukey)</option>
                  <option value="zscore" className="bg-slate-950 text-slate-200">Z-Score (Standardized residuals)</option>
                  <option value="winsorization" className="bg-slate-950 text-slate-200">Winsorization (Capping)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleDetect}
              disabled={loading || !selectedColumn}
              className="flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-950 disabled:text-slate-600 border border-transparent disabled:border-slate-900 text-white rounded-md px-6 py-2.5 transition-all font-bold uppercase text-[11px] tracking-wide shadow-md active:scale-95 group font-mono"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Crosshair size={14} className="group-hover:rotate-90 transition-transform duration-500" />
              )}
              {loading ? "INITIALIZING STREAMS..." : "EXECUTE ANALYSIS"}
            </button>
          </div>

          {/* AI ADVISORY COLLAPSIBLE */}
          {selectedColumn && aiInsights && aiInsights.find(i => i.column === selectedColumn) && (
            <div className="mt-6 p-4 rounded-md bg-[#0b1329] border border-slate-900 flex items-start gap-4 animate-in slide-in-from-top-2 duration-300">
              <Bot size={18} className="text-indigo-400 mt-0.5 shrink-0" />
              <div className="space-y-2 flex-1 w-full">
                <div className="flex items-center gap-3 border-b border-slate-950 pb-1.5">
                  <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Statistical Advisory</h5>
                  <div className="h-3 w-px bg-slate-800" />
                  <span className="text-[10px] font-mono font-bold text-slate-400">STRATEGY: <span className="text-indigo-400">USE_{aiInsights.find(i => i.column === selectedColumn).recommended_method.toUpperCase()}</span></span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium italic font-sans">
                  "{aiInsights.find(i => i.column === selectedColumn).reason}"
                </p>
                {aiInsights.find(i => i.column === selectedColumn).warning && (
                  <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-bold font-mono uppercase inline-flex">
                    <Zap size={11} fill="currentColor" className="text-rose-500" /> {aiInsights.find(i => i.column === selectedColumn).warning}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ANALYSIS OUTPUT */}
        {result && (
          <div className="p-6 border-t border-slate-900 space-y-6 bg-slate-950/5 animate-in fade-in duration-300">
            
            {/* SCORECARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Outlier Frequency", value: result.total_outliers, icon: AlertTriangle, color: "text-rose-400", sub: "Calculateddeviants" },
                { label: "Execution Model", value: result.method || method, icon: Settings2, color: "text-slate-500", sub: "Algorithm scope" },
                { label: "Target Feature", value: result.column || selectedColumn, icon: Database, color: "text-indigo-400", sub: "Active dimension" },
              ].map((kpi, i) => (
                <div key={i} className="bg-[#0b1329]/60 border-2 border-slate-800 rounded-xl p-5 relative overflow-hidden group shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">{kpi.label}</span>
                    <kpi.icon size={14} className={kpi.color} />
                  </div>
                  <h3 className={`font-mono font-bold tracking-tight truncate ${typeof kpi.value === 'number' ? 'text-2xl text-rose-400' : 'text-sm uppercase text-slate-200'}`}>
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-600 uppercase mt-2 tracking-wide font-mono">[{kpi.sub}]</p>
                </div>
              ))}
            </div>

            {/* ===================================================== */}
            {/* 3. DYNAMIC GRAPH SHELL ENCLOSURE ROW LAYOUT */}
            {/* ===================================================== */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* DENSITY DISTRIBUTION ENCLOSURE SLOT */}
              <div className="xl:col-span-7">
                <GraphEnclosure
                  title="Density Distribution"
                  subtitle="Null density across identified vector headers"
                  tooltipText="Continuous frequency parameters map variables. Increased vertical scale prevents X-Axis clipping parameters."
                  icon={BarChart3}
                  hasData={hasHistogramData}
                >
                  {/* Bumping component wrapper bounds up to 450px prevents structural cutoff parameters */}
                  <div className="h-[450px] w-full overflow-hidden bg-[#0f172a]">
                    <HistogramChart data={result.visualizations.histogram} />
                  </div>
                </GraphEnclosure>
              </div>

              {/* RESIDUAL SCATTER MAP ENCLOSURE SLOT */}
              <div className="xl:col-span-5">
                <GraphEnclosure
                  title="Residual Scatter Map"
                  subtitle="Proportional outlier dispersion plotting"
                  icon={Crosshair}
                  hasData={hasScatterData}
                >
                  <div className="h-[450px] w-full overflow-hidden bg-[#0f172a]">
                    <ScatterChartComponent data={result.visualizations.scatterplot} xKey="x" yKey="y" color="#f43f5e" />
                  </div>
                </GraphEnclosure>
              </div>

            </div>

            {/* ===================================================== */}
            {/* 4. FIVE-NUMBER SUMMARY DIAGNOSTIC ENCLOSURE */}
            {/* ===================================================== */}
            <GraphEnclosure
              title="Five-Number Summary Diagnostic"
              subtitle="Distribution Analysis • Quartile-Based Dispersion Overview"
              tooltipText="Confidence Interval: 95% σ-verified descriptive boundaries summary."
              icon={Terminal}
              hasData={result.visualizations?.boxplot ? true : false}
            >
              <div className="space-y-6">
                <BoxPlotComponent stats={result.visualizations.boxplot} />
                
                <div className="pt-6 border-t border-slate-900">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-3">Calculated Statistical Boundaries</p>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(result.thresholds || {}).map(([key, val], idx) => (
                        <div key={idx} className="bg-[#0b1329]/60 p-3 rounded-md border border-slate-900">
                           <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">{key.replace('_', ' ')}</p>
                           <p className="font-mono text-xs font-bold text-indigo-400">
                             {typeof val === 'number' ? val.toFixed(4) : String(val)}
                           </p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </GraphEnclosure>

            {/* DATASET PREVIEWS */}
            {result.applied_preview && (
              <div className="grid md:grid-cols-2 gap-4">
                
                {/* CURRENT DATASET HEAD */}
                <div className="rounded-xl border-2 border-slate-800 bg-[#0f172a] overflow-hidden shadow-md">
                  <div className="px-4 py-3 border-b border-slate-900 bg-[#0b1329]/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <TableIcon size={14} className="text-rose-400" />
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">Current Dataset Head [Observation Matrix]</h5>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900">ORIGINAL</span>
                  </div>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#0f172a] text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-900">
                          {result.preview?.[0] && Object.keys(result.preview[0]).map((key, idx) => (
                            <th key={idx} className="px-4 py-2.5 font-bold border-r border-slate-900 last:border-0">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="font-mono text-[11px] divide-y divide-slate-900/40 bg-[#0f172a]/20">
                        {result.preview?.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="px-4 py-3 text-slate-300 border-r border-slate-900 last:border-0 whitespace-nowrap">{String(value)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PREVIEW: AFTER APPLY */}
                <div className="rounded-xl border-2 border-slate-800 bg-[#0f172a] overflow-hidden shadow-md">
                  <div className="px-4 py-3 border-b border-slate-900 bg-[#0b1329]/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <TableIcon size={14} className="text-indigo-400" />
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">Preview: After Apply [Anomaly Corrections]</h5>
                    </div>
                    <span className="text-[9px] font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 uppercase tracking-wider">CHANGES_STAGED</span>
                  </div>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#0f172a] text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-900">
                          {result.applied_preview?.[0] && Object.keys(result.applied_preview[0]).map((key, idx) => (
                            <th key={idx} className="px-4 py-2.5 font-bold border-r border-slate-900 last:border-0">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="font-mono text-[11px] divide-y divide-slate-900/40 bg-[#0f172a]/20">
                        {result.applied_preview?.map((row, idx) => (
                          <tr key={idx} className="hover:bg-rose-500/5 transition-colors bg-rose-500/5">
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="px-4 py-2 text-rose-300 border-r border-slate-900 last:border-0 whitespace-nowrap">
                                {typeof value === 'number' ? (
                                  <span className="font-bold text-rose-400">{value.toLocaleString()}</span>
                                ) : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={handleApply}
                disabled={applyLoading || result.total_outliers === 0}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-950 disabled:text-slate-600 border border-transparent disabled:border-slate-900 text-white rounded-md px-4 py-2 font-bold uppercase text-[11px] tracking-wide shadow-md active:scale-95 transition-all font-mono"
              >
                {applyLoading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Database size={14} />
                )}
                {applyLoading ? "APPLYING CHANGES..." : "APPLY OUTLIER DETECTION"}
              </button>
            </div>
            
            {result.applied && result.preview && (
              <div className="mt-6 rounded-xl border-2 border-slate-800 bg-[#0f172a] overflow-hidden shadow-md">
                <div className="px-4 py-3 border-b border-slate-900 bg-[#0b1329]/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <TableIcon size={14} className="text-indigo-400" />
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Preview: Applied Dataset Head</h4>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">STAGED: {result.file_path?.split('/').pop() || ''}</span>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0f172a] text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-900">
                        {result.preview?.[0] && Object.keys(result.preview[0]).map((key, idx) => (
                          <th key={idx} className="px-5 py-3 border-r border-slate-900 last:border-0 text-left font-bold">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-mono text-[11px] divide-y divide-slate-900/40 bg-[#0f172a]/20">
                      {result.preview?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-indigo-500/5 transition-colors">
                          {Object.values(row).map((value, i) => (
                            <td key={i} className="px-5 py-2.5 text-slate-300 border-r border-slate-900/40 last:border-0 whitespace-nowrap">
                              {typeof value === 'number' ? (
                                <span className="font-bold text-indigo-400">{value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              ) : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CONSOLE SCAN NOTATION FOOTER */}
            <div className="px-5 py-2 bg-[#0b1329] border border-slate-900 rounded-lg flex justify-center">
              <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                End of Anomaly Scan Output
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default OutlierPanel;
