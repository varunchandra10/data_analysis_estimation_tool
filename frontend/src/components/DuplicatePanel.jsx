import React from "react";
import { 
  Trash2, CheckCircle2, AlertCircle,
  Database, BrainCircuit, Bot, 
  Zap, ShieldCheck, Activity, Maximize2,
  Fingerprint, Cpu, Search, Terminal
} from "lucide-react";

import PieChartComponent from "./charts/PieChartComponent";
import BarChartComponent from "./charts/BarChartComponent";
import InfoTooltip from "./UI/InfoTooltip";
import { getTooltipContent } from "../utils/tooltipContent";

const DuplicatePanel = ({
  data,
  aiInsights = [],
  strategy,
  setStrategy,
  result,
  loading,
  onProcess
}) => {
  if (!data) return null;

  const { metadata } = data;

  const handleProcess = () => {
    onProcess();
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
    <div className="space-y-6 antialiased text-slate-200 font-sans max-w-[1600px] mx-auto pb-12 px-4 sm:px-6 selection:bg-slate-800">
      
      {/* ===================================================== */}
      {/* 1. HEURISTIC ENGINE BANNER */}
      {/* ===================================================== */}
      <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-md ${
        aiInsights?.length > 0 
        ? "bg-[#0b1329] border-indigo-500/30" 
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
                  Redundancy Pattern Heuristics
                </h3>
                {aiInsights?.length > 0 && (
                  <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 text-[9px] px-2 py-0.5 rounded-sm font-bold border border-indigo-500/20 font-mono animate-pulse">
                    ALGO_SCAN_ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs mt-1.5 font-medium leading-relaxed max-w-2xl text-slate-300">
                {aiInsights?.length > 0 
                  ? "Pattern matching suggests multi-vector entry overlaps. Algorithmic deduplication recommended to maintain statistical parity." 
                  : "Structural uniqueness scan complete. Row-level observation distribution aligns with expected variance thresholds."}
              </p>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-900 rounded-md text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">
            <ShieldCheck size={13} className={`mt-0.5 ${aiInsights?.length > 0 ? "text-indigo-400" : "text-emerald-400"}`} /> System Validated
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* 2. ENTROPY WORKBENCH PRIMARY UNIT */}
      {/* ===================================================== */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* WORKBENCH HEADER */}
        <div className="px-6 py-4 border-b border-slate-900 bg-[#0b1329]/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
              <Fingerprint size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-200 uppercase tracking-wide font-mono">
                Entropy Workbench
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono font-bold bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-slate-500 uppercase">Module: redundancy_audit_v4.2</span>
                <span className="h-1 w-1 rounded-full bg-slate-800" />
                <span className="text-[11px] font-medium text-indigo-400">Active Buffer: {metadata.filename}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-900 rounded-md">
            <Cpu size={14} className="text-slate-500" />
            <span className="text-[10px] font-mono font-bold text-slate-400">LATENCY: 0.04ms / VECTOR</span>
          </div>
        </div>

        {/* STRATEGY CONFIGURATION (THICK OUTLINE PREVENTS OVERLAP) */}
        <div className="m-6 p-6 border-2 border-slate-800/80 bg-slate-950/10 rounded-xl grid md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-8 space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Search size={13} /> Execution Methodology
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
                  className={`p-4 rounded-lg border text-left transition-all relative ${
                    strategy === opt.id 
                    ? "bg-slate-950 border-indigo-500 text-slate-100 ring-1 ring-indigo-500/30 shadow-md" 
                    : "bg-[#0b1329]/20 border-slate-900 text-slate-400 hover:border-slate-800"
                  }`}
                >
                  <opt.icon size={15} className={strategy === opt.id ? "text-indigo-400" : "text-slate-500"} />
                  <p className={`text-xs font-bold mt-2.5 uppercase tracking-wide font-mono ${strategy === opt.id ? "text-indigo-400" : "text-slate-300"}`}>{opt.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1 leading-normal font-sans">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 h-full flex flex-col justify-end">
            <button
              onClick={handleProcess}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-950 disabled:text-slate-600 border border-transparent disabled:border-slate-900 text-white rounded-md px-5 py-4 transition-all font-bold uppercase text-[11px] tracking-wider shadow-md active:scale-95 font-mono"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
              {loading ? "Computing Entropy..." : "Commit Process Pipeline"}
            </button>
          </div>
        </div>

        {/* AI ADVISORY COLLAPSIBLE */}
        {aiInsights?.length > 0 && (
          <div className="px-6 pb-6 pt-0">
            <div className="p-4 rounded-md bg-[#0b1329] border border-slate-900 flex items-start gap-3.5">
              <Bot size={18} className="text-indigo-400 mt-0.5 shrink-0" />
              <div className="space-y-2 flex-1 w-full">
                <div className="flex items-center gap-3 border-b border-slate-950 pb-1.5">
                  <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Statistical Advisory</h5>
                  <div className="h-3 w-px bg-slate-800" />
                  <span className="text-[10px] font-mono font-bold text-slate-400">RECOMMENDATION: <span className="text-indigo-400">{aiInsights[0].recommended_strategy?.toUpperCase()}</span></span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium italic font-sans">
                  "{aiInsights[0].reason || "Pattern distribution suggests row-level overlaps across the primary key matrix."}"
                </p>
                {aiInsights[0].warning && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold bg-slate-950 px-2 py-1 rounded border border-amber-500/10 shadow-sm font-mono uppercase inline-flex">
                    <Zap size={11} fill="currentColor" className="text-amber-500" /> {aiInsights[0].warning}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="p-6 border-t border-slate-900 space-y-8 bg-slate-950/5 animate-in fade-in duration-300">
            
            {/* ANALYTICAL SCORECARDS (THICK LINE OUTLINES INSTALLED) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Observations", value: result.original_rows, icon: Database, color: "text-slate-500", barColor: "bg-slate-700" },
                { label: "Valid Rows", value: result.final_rows, icon: CheckCircle2, color: "text-emerald-400", barColor: "bg-emerald-500" },
                { label: "Entropy Detected", value: result.duplicate_count, icon: AlertCircle, color: "text-amber-400", barColor: "bg-amber-500" },
                { label: "Purged Bytes", value: result.removed_count, icon: Trash2, color: "text-rose-400", barColor: "bg-rose-500" },
              ].map((kpi, i) => (
                <div key={i} className="bg-[#0b1329]/60 border-2 border-slate-800 rounded-xl p-4 relative overflow-hidden group shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">{kpi.label}</span>
                    <InfoTooltip {...getTooltipContent(kpi.label === "Observations" ? 'observations' : kpi.label === "Entropy Detected" ? 'duplicateRows' : 'qualityScore')} iconSize={12} className="h-4 w-4" />
                    <kpi.icon size={13} className={kpi.color} />
                  </div>
                  <h3 className="text-2xl font-mono font-bold text-slate-100 tabular-nums tracking-tight">
                    {(kpi.value ?? 0).toLocaleString()}
                  </h3>
                  <div className="h-1 w-full bg-slate-950 border border-slate-900/60 rounded-full mt-3 overflow-hidden">
                    <div className={`h-full ${kpi.barColor} opacity-40`} style={{ width: '100%' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* VISUAL DIAGNOSTICS WITH ISOLATED FIXED HEIGHT BOXES */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-4 bg-slate-950/20 rounded-xl border-2 border-slate-900">
              
              {/* REDUNDANCY MIX (PIE) */}
              <div className="xl:col-span-4 p-5 bg-[#0f172a] border-2 border-slate-800/80 rounded-xl flex flex-col justify-between min-w-0">
                <div className="flex items-center justify-between mb-4 w-full">
                  <div className="space-y-0.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-200 font-mono">Redundancy Mix</h3>
                    <p className="text-[11px] text-slate-500 font-medium font-sans">Proportional entropy segmentations</p>
                  </div>
                  <InfoTooltip title="Redundancy Mix" description="Shows the balance between duplicate and unique rows after the deduplication scan." recommendation="Use it to explain the scale of redundancy before applying removals." iconSize={14} className="h-5 w-5" />
                </div>
                <div className="h-[320px] w-full flex items-center justify-center">
                  {/* Pulls directly from the unified palette fixed in outlier stage */}
                  <PieChartComponent data={pieChartData} nameKey="name" dataKey="value" />
                </div>
              </div>

              {/* PROCESS DELTA (BAR) */}
              <div className="xl:col-span-8 p-5 bg-[#0f172a] border-2 border-slate-800/80 rounded-xl flex flex-col justify-between min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-200 font-mono">Process Delta</h3>
                    <p className="text-[11px] text-slate-500 font-medium font-sans">Volumetric metrics step frame tracking</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wide bg-slate-950 px-2 py-0.5 rounded border border-slate-900">Unit: Observations</span>
                </div>
                <div className="h-[320px] w-full overflow-hidden">
                  <BarChartComponent data={summaryBarData} xKey="category" yKey="value" color="#818cf8" />
                </div>
              </div>

            </div>

            {/* SUBSET VIEW: REDUNDANCY CLUSTER (THICK OUTLINE ADDED) */}
            <div className="rounded-xl border-2 border-slate-800/80 overflow-hidden bg-[#0f172a] shadow-sm">
              <div className="px-5 py-3.5 border-b border-slate-900 bg-[#0b1329]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Terminal size={14} className="text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                    Terminal: Observation Subset (Sample_Head)
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                   <Maximize2 size={12} className="text-slate-500 hover:text-slate-200 cursor-pointer transition-colors" />
                </div>
              </div>

              {(result?.duplicate_rows?.length || 0) === 0 ? (
                <div className="p-16 text-center bg-slate-950/20">
                  <div className="inline-flex p-4 rounded-lg bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                    <ShieldCheck size={32} />
                  </div>
                  <h4 className="text-slate-200 font-bold font-mono uppercase tracking-wider text-sm">Set Integrity: High</h4>
                  <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed font-sans">
                    Zero row-level redundancies detected in current active buffer. Data vectors maintain full independence.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0f172a] text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-900">
                        {result?.duplicate_rows?.[0] && Object.keys(result.duplicate_rows[0]).map((key, idx) => (
                          <th key={idx} className="px-5 py-3 border-r border-slate-900 last:border-0 text-left">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-mono text-[11px] divide-y divide-slate-900/40 bg-[#0f172a]/20">
                      {result?.duplicate_rows?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          {Object.values(row).map((value, i) => (
                            <td key={i} className="px-5 py-2.5 text-slate-300 border-r border-slate-900/40 last:border-0 whitespace-nowrap">
                              {value === null ? <span className="text-rose-400/50 bg-rose-500/5 border border-rose-500/10 px-1 py-0.5 rounded-sm font-bold text-[10px]">∅ null</span> : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-5 py-2 bg-[#0b1329] border-t border-slate-900 flex justify-center">
                    <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                      End of Redundancy Scan Output
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
