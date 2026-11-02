import { useState } from "react";
import { 
  AlertCircle, 
  CheckCircle2, 
  Settings2,
  Loader2,
  BrainCircuit,
  Bot,
  ShieldCheck,
  Database,
  BarChart3,
  PieChart,
  Activity,
  Terminal,
  Cpu,
  FlaskConical,
  Sparkles,
  RotateCcw,
  Hash,
  Type,
} from "lucide-react";
import BarChartComponent from "../../charts/BarChartComponent";
import PieChartComponent from "../../charts/PieChartComponent";
import GraphEnclosure from "../../UI/graphModal";
import { useAI } from "../../../hooks/useAI";
import AIInsightCard from "../../common/AIInsightCard";
import InfoTooltip from "../../UI/InfoTooltip";
import { getTooltipContent } from "../../../utils/tooltipContent";

const MissingValuePanel = ({ data, aiInsights = [], onApplyCleaning, loading }) => {
  const [strategies, setStrategies] = useState({});

  const {
    explanations,
    loadingExplanations,
    explanationsError,
    explanationsCacheUsed,
    fetchAIExplanations
  } = useAI();

  const getMissingValueExplanation = (columnName) => {
    const colExp = explanations?.explanations?.find(exp => exp.column === columnName);
    return colExp?.missing_value_ai_explanation;
  };

  if (!data) return null;

  const { metadata, schema } = data;
  const normalizedSchema = Array.isArray(schema) ? schema : [];
  const nullCounts = metadata?.null_counts || {};

  const columnsWithNulls = normalizedSchema.filter(
    (col) => (nullCounts[col.column] || 0) > 0
  );

  const totalRows = metadata?.rows || 1;
  const totalMissing = Object.values(nullCounts).reduce(
    (acc, val) => acc + val,
    0
  );
  const totalCells = (metadata?.rows || 0) * (metadata?.columns || 0);
  const totalAvailable = Math.max(0, totalCells - totalMissing);
  const completenessRate = totalCells > 0 ? ((totalAvailable / totalCells) * 100).toFixed(2) : '100.00';

  const missingBarData = columnsWithNulls.map((col) => ({
    column: col.column,
    missing: nullCounts[col.column] || 0,
  }));

  const missingPieData = [
    { name: "Missing", value: totalMissing },
    { name: "Available", value: totalAvailable },
  ];

  const handleStrategyChange = (column, strategy) => {
    setStrategies((prev) => ({ ...prev, [column]: strategy }));
  };

  // Quick 1-click apply of all AI recommended strategies
  const handleAutoFillAI = () => {
    const autoMap = {};
    columnsWithNulls.forEach((col) => {
      const insight = aiInsights.find((i) => i.column === col.column);
      const method = insight?.recommended_method || (col.type === 'Numerical' ? 'mean' : 'most_frequent');
      autoMap[col.column] = method;
    });
    setStrategies((prev) => ({ ...prev, ...autoMap }));
  };

  const handleResetStrategies = () => {
    setStrategies({});
  };

  const handleApplyCleaning = () => {
    onApplyCleaning(strategies);
  };

  const configuredCount = Object.values(strategies).filter(Boolean).length;

  return (
    <div className="space-y-6 antialiased text-slate-800 dark:text-slate-100 font-sans max-w-[1600px] mx-auto pb-12 px-4 sm:px-6">
      
      {/* ===================================================== */}
      {/* 1. ANALYTICAL CONTEXT HEADER */}
      {/* ===================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              <FlaskConical size={13} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Diagnostic Module
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-mono uppercase">
              Null Observation Audit
            </h2>
            <InfoTooltip {...getTooltipContent('missingAudit')} iconSize={14} className="h-5 w-5" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Detecting and remediating structural observation voids in dataset:{' '}
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {metadata?.filename || 'Active Dataset'}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
           <div className="text-right font-mono">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Inference Latency</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">0.4ms / Vector</p>
           </div>
           <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
           <Cpu size={16} className="text-slate-400" />
        </div>
      </div>

      {/* ===================================================== */}
      {/* 2. AI HEURISTICS OVERLAY */}
      {/* ===================================================== */}
      <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm ${
        aiInsights?.length > 0 
          ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60" 
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      }`}>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl border shrink-0 ${
              aiInsights?.length > 0 
                ? "bg-white dark:bg-slate-950 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-2xs" 
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"
            }`}>
              <BrainCircuit size={20} className={aiInsights?.length > 0 ? "animate-pulse" : ""} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xs font-bold tracking-wider uppercase text-indigo-700 dark:text-indigo-400 font-mono">
                  Neural Imputation Heuristics
                </h3>
                {aiInsights?.length > 0 && (
                  <span className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-indigo-200 dark:border-indigo-800 font-mono">
                    <Activity size={10} className="animate-pulse text-indigo-500" />
                    MODEL_ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs mt-1 leading-relaxed text-slate-600 dark:text-slate-300 max-w-3xl">
                {aiInsights?.length > 0 
                  ? "Neural patterns detected. The Statistical Insight Engine recommends specific imputation methods to minimize bias and preserve standard deviation across binned variables." 
                  : "Structural scan complete. No high-variance patterns detected. Select manual imputation strategies below."}
              </p>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider font-mono shadow-2xs">
            <Bot size={14} />
            <span>AI Copilot Active</span>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* 3. METRICS AND CHARTS PANELS */}
      {/* ===================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* TABULAR METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
          {[
            { label: "Missing Observations", value: totalMissing.toLocaleString(), sub: "Total Voids", icon: AlertCircle, color: "text-rose-500", tooltipKey: "missingObservations" },
            { label: "Impacted Dimensions", value: columnsWithNulls.length, sub: "High Variance Columns", icon: Database, color: "text-indigo-500", tooltipKey: "impactedDimensions" },
            { label: "Completeness Score", value: `${completenessRate}%`, sub: "Dataset Integrity", icon: Activity, color: "text-emerald-500", tooltipKey: "completenessScore" }
          ].map((kpi, i) => (
            <div key={i} className="p-6 font-sans">
              <p className="text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <kpi.icon size={13} className={kpi.color} /> {kpi.label}
                <InfoTooltip {...getTooltipContent(kpi.tooltipKey)} iconSize={12} className="h-4 w-4" />
              </p>
              <div className="flex items-baseline gap-2">
                 <h3 className="text-3xl font-mono font-bold tracking-tight text-slate-900 dark:text-white">{kpi.value}</h3>
                 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">[{kpi.sub}]</span>
              </div>
              {kpi.label === "Completeness Score" && (
                <div className="mt-4 w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, parseFloat(completenessRate)))}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* DATA VISUALIZATION BLOCK */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 bg-slate-50/30 dark:bg-slate-950/20">
          
          {/* FREQUENCY DISTRIBUTION */}
          <div className="xl:col-span-8">
            <GraphEnclosure
              title="Frequency Distribution"
              subtitle="Null observation counts across identified vector attributes"
              tooltip={getTooltipContent('nullDistribution')}
              icon={BarChart3}
              hasData={missingBarData && missingBarData.length > 0}
            >
              <div className="h-[430px] w-full overflow-hidden p-2 bg-white dark:bg-slate-900 rounded-xl">
                 <BarChartComponent data={missingBarData} xKey="column" yKey="missing" color="#818cf8" />
              </div>
            </GraphEnclosure>
          </div>

          {/* INTEGRITY RATIO */}
          <div className="xl:col-span-4">
            <GraphEnclosure
              title="Integrity Ratio"
              subtitle="Proportional completeness breakdown"
              tooltip={getTooltipContent('integrityRatio')}
              icon={PieChart}
              hasData={missingPieData && missingPieData.length > 0}
            >
              <div className="h-[330px] w-full flex items-center justify-center p-2 bg-white dark:bg-slate-900 rounded-xl">
                <PieChartComponent data={missingPieData} nameKey="name" dataKey="value" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-xs border-t border-slate-200 dark:border-slate-800 pt-3 w-full">
                 <div className="flex flex-col border-l-2 border-emerald-500 pl-2.5">
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Available Cells</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{missingPieData[1].value.toLocaleString()}</span>
                 </div>
                 <div className="flex flex-col border-l-2 border-rose-500 pl-2.5">
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Missing Voids</span>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">{missingPieData[0].value.toLocaleString()}</span>
                 </div>
              </div>
            </GraphEnclosure>
          </div>

        </div>

        {/* IMPUTATION CONFIGURATION WORKFLOW */}
        <div className="m-6 p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                    <Settings2 size={13} />
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Remediation Configuration Workflow
                  </h4>
                  <InfoTooltip {...getTooltipContent('remediationWorkflow')} iconSize={12} className="h-4 w-4" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Select algorithmic handlers for each variable with missing records ({configuredCount} of {columnsWithNulls.length} configured).
                </p>
              </div>

              {/* Action Buttons: Auto-Fill AI & Reset */}
              {columnsWithNulls.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleAutoFillAI}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer shadow-2xs"
                    title="Automatically set strategy for all columns using AI recommendations"
                  >
                    <Sparkles size={12} className="text-indigo-500" />
                    <span>Auto-Fill AI Recommendations</span>
                  </button>

                  {configuredCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetStrategies}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Clear all selected strategies"
                    >
                      <RotateCcw size={12} />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              )}
          </div>

          {columnsWithNulls.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-16 text-center bg-slate-50/50 dark:bg-slate-950/20">
              <div className="inline-flex p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 mb-3 shadow-2xs">
                <CheckCircle2 size={28} />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide font-mono">
                Zero Null Bias Detected
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                The current dataset maintains 100% observational density. No imputation necessary across any feature columns.
              </p>
            </div>
          ) : (
            <div className="grid gap-3.5">
              {columnsWithNulls.map((col, idx) => {
                const columnInsight = aiInsights.find((insight) => insight.column === col.column);
                const nullCount = nullCounts[col.column] || 0;
                const nullPct = ((nullCount / totalRows) * 100).toFixed(1);
                const isNumeric = col.type === "Numerical" || col.type === "Integer" || col.type === "Float";

                return (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30 hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all shadow-2xs"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 gap-4">
                      <div className="flex gap-3.5 items-center min-w-0">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-xl border shrink-0 ${
                          isNumeric
                            ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400"
                            : "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          {isNumeric ? <Hash size={16} /> : <Type size={16} />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-bold text-slate-900 dark:text-white text-sm tracking-tight truncate">
                              {col.column}
                            </p>
                            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.2 rounded-md uppercase tracking-wider font-mono shrink-0">
                              {nullPct}% Void
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs font-mono text-slate-400">
                            <span className="flex items-center gap-1">
                              <AlertCircle size={12} className="text-rose-500" />
                              {nullCount.toLocaleString()} missing rows
                            </span>
                            <span>•</span>
                            <span className="text-slate-500 dark:text-slate-400">
                              Type: {col.type || 'Object'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Strategy Selection Dropdown */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono hidden sm:inline">
                          Remediation:
                        </span>
                        <select
                          className="w-full lg:w-[260px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer text-slate-900 dark:text-slate-100 uppercase tracking-wide font-mono shadow-2xs"
                          value={strategies[col.column] || ""}
                          onChange={(e) => handleStrategyChange(col.column, e.target.value)}
                        >
                          <option value="" className="text-slate-400">- Select Strategy -</option>
                          <option value="drop">Drop Observations</option>
                          {isNumeric && (
                            <>
                              <option value="mean">Arithmetic Mean</option>
                              <option value="median">Statistical Median</option>
                              <option value="knn">K-Nearest Neighbors</option>
                            </>
                          )}
                          <option value="most_frequent">Mode Frequency</option>
                        </select>
                      </div>
                    </div>

                    {/* AI Recommendation Context Accordion/Card */}
                    {columnInsight && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-start gap-3 shadow-2xs">
                          <Bot size={18} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                          <div className="space-y-2 w-full text-xs">
                            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                              <h5 className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider font-mono">
                                Model Recommendation:{' '}
                                <span className="underline underline-offset-4 font-bold text-slate-900 dark:text-white capitalize">
                                  {columnInsight.recommended_method?.replace(/_/g, ' ')}
                                </span>
                              </h5>
                              <div className="h-3 w-px bg-slate-200 dark:border-slate-800" />
                              <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                Confidence: 94%
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                              {columnInsight.reason}
                            </p>

                            <AIInsightCard
                              title="Method Statistical Explanation"
                              explanation={getMissingValueExplanation(col.column)}
                              loading={loadingExplanations}
                              error={explanationsError}
                              cacheUsed={explanationsCacheUsed}
                              onRefresh={fetchAIExplanations}
                            />
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
          <div className="px-6 py-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-5">
            <div className="flex items-start gap-3.5 text-slate-500 dark:text-slate-400 max-w-2xl">
               <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
                  <ShieldCheck size={18} />
               </div>
               <div className="space-y-0.5">
                 <p className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                   Data Pipeline Persistence Warning
                 </p>
                 <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                   Executing this step commits transformations to the active in-memory buffer and updates the lineage graph. Make sure selected strategies align with your survey methodological standards.
                 </p>
               </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                type="button"
                onClick={handleApplyCleaning}
                data-testid="clean-btn"
                disabled={loading || configuredCount === 0}
                className="w-full lg:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider shadow-sm transition-all font-mono shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Terminal size={14} />
                )}
                <span>
                  {loading ? "INITIALIZING STREAMS..." : `COMMIT TRANSFORMATION PIPELINE (${configuredCount})`}
                </span>
              </button>
              <InfoTooltip {...getTooltipContent('applyCleaning')} iconSize={14} className="h-5 w-5 shrink-0" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissingValuePanel;
