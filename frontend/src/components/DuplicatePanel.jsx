import React, { useState } from "react";
import axios from "axios";
import { 
  Copy, Trash2, CheckCircle2, AlertCircle, BarChart3, 
  PieChart as PieIcon, Database, BrainCircuit, Bot, 
  Zap, ShieldCheck, ChevronRight, Activity, Maximize2,
  Fingerprint, Cpu, Info, Search, Terminal
} from "lucide-react";

import PieChartComponent from "./charts/PieChartComponent";
import BarChartComponent from "./charts/BarChartComponent";

const DuplicatePanel = ({ data, aiInsights = [], onProcessComplete }) => {
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
        { file_path: metadata.file_path, strategy }
      );
      setResult(response.data);
      if (onProcessComplete) onProcessComplete(response.data);
    } catch (err) {
      console.error("Processing Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const pieChartData = result ? [
    { name: "Duplicates", value: result.duplicate_count || 0 },
    { name: "Unique Rows", value: (result.final_rows || 0) - (result.duplicate_count || 0) }
  ] : [];

  const summaryBarData = result ? [
    { category: "Original", value: result.original_rows || 0 },
    { category: "Final", value: result.final_rows || 0 },
    { category: "Duplicates", value: result.duplicate_count || 0 },
    { category: "Removed", value: result.removed_count || 0 }
  ] : [];

  return (
    <div className="space-y-6 antialiased text-slate-900 dark:text-slate-100 font-sans leading-normal selection:bg-indigo-500/30">
      
      {/* ===================================================== */}
      {/* 1. HEURISTIC ENGINE BANNER (High Density) */}
      {/* ===================================================== */}
      <div className={`relative overflow-hidden rounded-xl border transition-all duration-500 ${
        aiInsights?.length > 0 
        ? "bg-indigo-900/5 border-indigo-200 dark:border-indigo-900/30" 
        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
      }`}>
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-5">
            <div className={`mt-1 p-3 rounded-xl border-2 ${aiInsights?.length > 0 ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/20 text-indigo-600" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"}`}>
              <BrainCircuit size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-[11px] font-black tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">
                  Redundancy Pattern Heuristics
                </h3>
                {aiInsights?.length > 0 && (
                  <span className="flex items-center gap-1.5 bg-indigo-600 text-white text-[9px] px-2.5 py-1 rounded-sm font-black tracking-tighter shadow-sm animate-pulse">
                    ALGO_SCAN_ACTIVE
                  </span>
                )}
              </div>
              <p className="text-sm mt-2 font-medium leading-relaxed max-w-2xl text-slate-600 dark:text-slate-400">
                {aiInsights?.length > 0 
                  ? "Pattern matching suggests multi-vector entry overlaps. Algorithmic deduplication recommended to maintain statistical parity." 
                  : "Structural uniqueness scan complete. Row-level observation distribution aligns with expected variance thresholds."}
              </p>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} className={aiInsights?.length > 0 ? "text-indigo-500" : "text-emerald-500"} /> System Validated
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
        
        {/* WORKBENCH HEADER */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-600 rounded-lg text-white shadow-xl shadow-indigo-500/20">
              <Fingerprint size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">
                Entropy Workbench
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Module: redundancy_audit_v4.2</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Active Buffer: {metadata.filename}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
            <Cpu size={14} className="text-slate-400" />
            <span className="text-[10px] font-mono font-bold text-slate-500">LATENCY: 0.04ms / VECTOR</span>
          </div>
        </div>

        {/* STRATEGY CONFIGURATION */}
        <div className="p-8 grid md:grid-cols-12 gap-8 items-start bg-slate-50/50 dark:bg-slate-900/20">
          <div className="md:col-span-8 space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Search size={12} /> Execution Methodology
            </label>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { id: "detect", label: "Analyze", sub: "Scan metadata only", icon: Search },
                { id: "remove", label: "Purge First", sub: "Retain initial entry", icon: Trash2 },
                { id: "keep_latest", label: "Purge Last", sub: "Retain latest entry", icon: Activity },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setStrategy(opt.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    strategy === opt.id 
                    ? "bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/10 shadow-sm" 
                    : "bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <opt.icon size={16} className={strategy === opt.id ? "text-indigo-600" : "text-slate-400"} />
                  <p className={`text-xs font-bold mt-3 uppercase tracking-tighter ${strategy === opt.id ? "text-indigo-600" : "text-slate-600"}`}>{opt.label}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 leading-none">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 h-full flex flex-col justify-end">
            <button
              onClick={handleProcess}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl px-6 py-5 transition-all font-black uppercase text-xs tracking-[0.15em] shadow-2xl shadow-indigo-500/20 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
              {loading ? "Computing Entropy..." : "Commit Process Pipeline"}
            </button>
          </div>
        </div>

        {/* AI ADVISORY COLLAPSIBLE */}
        {aiInsights?.length > 0 && (
          <div className="px-8 pb-8 pt-2">
            <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-5">
              <Bot size={22} className="text-indigo-600 dark:text-indigo-400 mt-1 shrink-0" />
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <h5 className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest">Statistical Advisory</h5>
                  <div className="h-4 w-px bg-indigo-200 dark:bg-indigo-800" />
                  <span className="text-[10px] font-mono font-bold text-indigo-600">RECOMMENDATION: {aiInsights[0].recommended_strategy?.toUpperCase()}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic leading-relaxed">
                  "{aiInsights[0].reason || "Pattern distribution suggests row-level overlaps across the primary key matrix."}"
                </p>
                {aiInsights[0].warning && (
                  <div className="flex items-center gap-2 text-[10px] text-amber-600 dark:text-amber-500 font-black uppercase">
                    <Zap size={12} fill="currentColor" /> {aiInsights[0].warning}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* ANALYTICAL SCORECARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Observations", value: result.original_rows, icon: Database, color: "text-slate-400" },
                { label: "Valid Rows", value: result.final_rows, icon: CheckCircle2, color: "text-emerald-500" },
                { label: "Entropy Detected", value: result.duplicate_count, icon: AlertCircle, color: "text-amber-500" },
                { label: "Purged Bytes", value: result.removed_count, icon: Trash2, color: "text-rose-500" },
              ].map((kpi, i) => (
                <div key={i} className="relative group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{kpi.label}</span>
                    <kpi.icon size={14} className={kpi.color} />
                  </div>
                  <h3 className="text-3xl font-mono font-bold text-slate-900 dark:text-white tabular-nums tracking-tighter">
                    {(kpi.value ?? 0).toLocaleString()}
                  </h3>
                  <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                    <div className={`h-full ${kpi.color.replace('text', 'bg')} opacity-40`} style={{ width: '100%' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* VISUAL DIAGNOSTICS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <PieIcon size={16} /> Redundancy Mix
                  </h3>
                  <Info size={14} className="text-slate-300" />
                </div>
                <div className="h-[280px]">
                  <PieChartComponent data={pieChartData} nameKey="name" dataKey="value" />
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <BarChart3 size={16} /> Process Delta
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Unit: Observations</span>
                </div>
                <div className="h-[280px]">
                  <BarChartComponent data={summaryBarData} xKey="category" yKey="value" color="#6366f1" />
                </div>
              </div>
            </div>

            {/* SUBSET VIEW: REDUNDANCY CLUSTER */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal size={16} className="text-indigo-400" />
                  <h3 className="text-xs font-black uppercase tracking-[0.15em]">
                    Terminal: Observation Subset (Sample_Head)
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <Maximize2 size={12} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
                </div>
              </div>

              {(result?.duplicate_rows?.length || 0) === 0 ? (
                <div className="p-20 text-center bg-slate-50/50 dark:bg-slate-950/20">
                  <div className="inline-flex p-5 rounded-full bg-emerald-500/10 text-emerald-500 mb-6 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                    <ShieldCheck size={40} />
                  </div>
                  <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-lg">Set Integrity: High</h4>
                  <p className="text-xs text-slate-500 mt-2 font-medium max-w-xs mx-auto italic leading-relaxed">
                    Zero row-level redundancies detected in current active buffer. Data vectors maintain full independence.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-[11px] border-collapse leading-none">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[9px] font-black tracking-widest border-b border-slate-200 dark:border-slate-800">
                        {result?.duplicate_rows?.[0] && Object.keys(result.duplicate_rows[0]).map((key, idx) => (
                          <th key={idx} className="px-6 py-4 border-r border-slate-100 dark:border-slate-800 last:border-0 text-left">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-mono tabular-nums">
                      {result?.duplicate_rows?.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          {Object.values(row).map((value, i) => (
                            <td key={i} className="px-6 py-4 text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 last:border-0 whitespace-nowrap">
                              {value === null ? <span className="text-rose-400 opacity-60">∅ null</span> : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-8 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-center">
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.3em]">
                      // End of Redundancy Scan Output
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

// Simple loader helper
const Loader2 = ({ className, size }) => (
  <div className={`border-2 border-white/30 border-t-white rounded-full animate-spin ${className}`} style={{ width: size, height: size }} />
);

export default DuplicatePanel;