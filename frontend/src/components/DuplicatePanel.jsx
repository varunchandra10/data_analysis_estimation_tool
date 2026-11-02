import React from "react";
import { 
  Trash2, CheckCircle2, AlertCircle,
  Database, BrainCircuit, Bot, 
  Zap, ShieldCheck, Maximize2,
  Fingerprint, Terminal
} from "lucide-react";

import PieChartComponent from "./charts/PieChartComponent";
import BarChartComponent from "./charts/BarChartComponent";
import InfoTooltip from "./UI/InfoTooltip";
import { getTooltipContent } from "../utils/tooltipContent";
import { MetricStatCard } from "./common";
import { DataGridTable } from "./dataset";

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
    <div className="space-y-6 antialiased text-slate-800 dark:text-slate-200 font-sans max-w-[1600px] mx-auto pb-12 px-4 sm:px-6">
      
      {/* ===================================================== */}
      {/* 1. HEURISTIC ENGINE BANNER */}
      {/* ===================================================== */}
      <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 shadow-xs ${
        aiInsights?.length > 0 
        ? "bg-indigo-50/40 dark:bg-[#0b1329] border-indigo-200 dark:border-indigo-500/30" 
        : "bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800"
      }`}>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className={`mt-0.5 p-2.5 rounded-lg border ${aiInsights?.length > 0 ? "bg-white dark:bg-slate-950 border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500"}`}>
              <BrainCircuit size={20} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-[10px] font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 font-mono">
                  Redundancy Pattern Heuristics
                </h3>
                {aiInsights?.length > 0 && (
                  <span className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[9px] px-2 py-0.5 rounded-sm font-bold border border-indigo-200 dark:border-indigo-500/20 font-mono animate-pulse">
                    ALGO_SCAN_ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs mt-1.5 font-medium leading-relaxed max-w-2xl text-slate-600 dark:text-slate-300">
                {aiInsights?.length > 0 
                  ? "Pattern matching suggests multi-vector entry overlaps. Algorithmic deduplication recommended to maintain statistical parity." 
                  : "Structural uniqueness scan complete. Row-level observation distribution aligns with expected variance thresholds."}
              </p>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-md text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">
            <ShieldCheck size={13} className={`mt-0.5 ${aiInsights?.length > 0 ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-500"}`} /> System Validated
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* 2. ENTROPY WORKBENCH PRIMARY UNIT */}
      {/* ===================================================== */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* WORKBENCH HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-900 bg-slate-50/60 dark:bg-[#0b1329]/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-md">
              <Fingerprint size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-200 uppercase tracking-wide font-mono">
                Entropy Workbench
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 px-2 py-0.5 rounded text-slate-500 uppercase">Module: redundancy_audit_v4.2</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleProcess}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Processing Deduplication...</span>
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  <span>Execute Deduplication</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI ADVISORY COLLAPSIBLE */}
        {aiInsights?.length > 0 && (
          <div className="px-6 pb-6 pt-0">
            <div className="p-4 rounded-md bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-slate-900 flex items-start gap-3.5">
              <Bot size={18} className="text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
              <div className="space-y-2 flex-1 w-full">
                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-950 pb-1.5">
                  <h5 className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Statistical Advisory</h5>
                  <div className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">RECOMMENDATION: <span className="text-indigo-600 dark:text-indigo-400">{aiInsights[0].recommended_strategy?.toUpperCase()}</span></span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic font-sans">
                  "{aiInsights[0].reason || "Pattern distribution suggests row-level overlaps across the primary key matrix."}"
                </p>
                {aiInsights[0].warning && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-slate-950 px-2 py-1 rounded border border-amber-200 dark:border-amber-500/10 shadow-xs font-mono uppercase inline-flex">
                    <Zap size={11} fill="currentColor" className="text-amber-500" /> {aiInsights[0].warning}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-900 space-y-8 bg-slate-50/30 dark:bg-slate-950/5 animate-in fade-in duration-300">
            
            {/* REUSED METRICSTATCARD PRIMITIVES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricStatCard
                label="Observations"
                value={Number(result.original_rows ?? 0).toLocaleString()}
                icon={Database}
                badge="Baseline"
                badgeVariant="slate"
              />
              <MetricStatCard
                label="Valid Rows"
                value={Number(result.final_rows ?? 0).toLocaleString()}
                icon={CheckCircle2}
                badge="Unique"
                badgeVariant="emerald"
              />
              <MetricStatCard
                label="Entropy Detected"
                value={Number(result.duplicate_count ?? 0).toLocaleString()}
                icon={AlertCircle}
                badge={result.duplicate_count > 0 ? "Duplicates" : "Clean"}
                badgeVariant={result.duplicate_count > 0 ? "amber" : "emerald"}
              />
              <MetricStatCard
                label="Purged Rows"
                value={Number(result.removed_count ?? 0).toLocaleString()}
                icon={Trash2}
                badge="Removed"
                badgeVariant={result.removed_count > 0 ? "rose" : "slate"}
              />
            </div>

            {/* VISUAL DIAGNOSTICS */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-4 bg-slate-100/60 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-slate-900">
              
              {/* REDUNDANCY MIX (PIE) */}
              <div className="xl:col-span-4 p-5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-xl flex flex-col justify-between min-w-0 shadow-xs">
                <div className="flex items-center justify-between mb-4 w-full">
                  <div className="space-y-0.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 font-mono">Redundancy Mix</h3>
                    <p className="text-[11px] text-slate-500 font-medium font-sans">Proportional entropy segmentations</p>
                  </div>
                  <InfoTooltip title="Redundancy Mix" description="Shows the balance between duplicate and unique rows after the deduplication scan." recommendation="Use it to explain the scale of redundancy before applying removals." iconSize={14} className="h-5 w-5" />
                </div>
                <div className="h-[320px] w-full flex items-center justify-center">
                  <PieChartComponent data={pieChartData} nameKey="name" dataKey="value" />
                </div>
              </div>

              {/* PROCESS DELTA (BAR) */}
              <div className="xl:col-span-8 p-5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-xl flex flex-col justify-between min-w-0 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 font-mono">Process Delta</h3>
                    <p className="text-[11px] text-slate-500 font-medium font-sans">Volumetric metrics step frame tracking</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wide bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-900">Unit: Observations</span>
                </div>
                <div className="h-[320px] w-full overflow-hidden">
                  <BarChartComponent data={summaryBarData} xKey="category" yKey="value" color="#818cf8" />
                </div>
              </div>

            </div>

            {/* SUBSET VIEW: REUSED DATAGRIDTABLE FOR DUPLICATE ROWS */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#0f172a] shadow-xs">
              <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-900 bg-slate-50/60 dark:bg-[#0b1329]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Terminal size={14} className="text-indigo-500 dark:text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 font-mono">
                    Terminal: Redundant Observation Cluster
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>

              {(result?.duplicate_rows?.length || 0) === 0 ? (
                <div className="p-16 text-center bg-slate-50/30 dark:bg-slate-950/20">
                  <div className="inline-flex p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4 border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
                    <ShieldCheck size={32} />
                  </div>
                  <h4 className="text-slate-900 dark:text-slate-200 font-bold font-mono uppercase tracking-wider text-sm">Set Integrity: High</h4>
                  <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed font-sans">
                    Zero row-level redundancies detected in current active buffer. Data vectors maintain full independence.
                  </p>
                </div>
              ) : (
                <DataGridTable
                  rows={result.duplicate_rows}
                  columns={Object.keys(result.duplicate_rows[0])}
                  totalRows={result.duplicate_count || result.duplicate_rows.length}
                />
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
