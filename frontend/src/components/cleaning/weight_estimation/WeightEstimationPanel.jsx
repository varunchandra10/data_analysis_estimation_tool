import React from "react";
import { 
  Scale, 
  BrainCircuit, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Loader2,
  Database,
  ChevronRight,
  Target,
  AlertTriangle
} from "lucide-react";
import BarChartComponent from "../../charts/BarChartComponent";
import { useAI } from "../../../hooks/useAI";
import AIInsightCard from "../../common/AIInsightCard";
import InfoTooltip from "../../UI/InfoTooltip";
import { getTooltipContent } from "../../../utils/tooltipContent";

const WeightEstimationPanel = ({
  data,
  aiInsights = [],
  valueColumn = "",
  setValueColumn,
  weightColumn = "",
  setWeightColumn,
  analysisType = "mean",
  setAnalysisType,
  result = null,
  loading = false,
  error = null,
  onRunAnalysis
}) => {
  const {
    explanations,
    loadingExplanations,
    explanationsError,
    explanationsCacheUsed,
    fetchAIExplanations
  } = useAI();

  const weightingExplanation = explanations?.summary_explanations?.weighting_ai_explanation;
  const analysisResult = result?.results || {};
  const rowsUsed = Number(result?.rows_used ?? analysisResult.rows_used ?? 0);
  const confidenceLevel = Number(result?.confidence_level ?? analysisResult.confidence_level ?? 0);
  const confidenceInterval = analysisResult.confidence_interval || {};
  const visualizationRows = Array.isArray(result?.visualizations)
    ? result.visualizations
    : Array.isArray(analysisResult.visualizations)
      ? analysisResult.visualizations
      : [];

  if (!data) return null;

  const { metadata, schema } = data;
  const normalizedSchema = Array.isArray(schema) ? schema : [];
  const numericColumns = normalizedSchema.filter((col) => col.type === "Numerical");

  return (
    <div className="space-y-6 antialiased text-slate-200 font-sans max-w-[1600px] mx-auto pb-12 px-4 sm:px-6 selection:bg-slate-800">
      
      {/* ===================================================== */}
      {/* PROFESSIONAL AI INTELLIGENCE BAR */}
      {/* ===================================================== */}
      <div className={`rounded-xl border-2 transition-all duration-300 shadow-md ${
        aiInsights && aiInsights.length > 0 
        ? "bg-[#0b1329] border-indigo-500/30 text-slate-200" 
        : "bg-[#0f172a] border-slate-800 text-slate-400"
      }`}>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full">
            <div className={`p-2.5 rounded-lg border shrink-0 ${aiInsights && aiInsights.length > 0 ? "bg-slate-950 border-indigo-500/40 text-indigo-400" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
              <BrainCircuit size={20} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <h3 className="text-xs font-bold tracking-wider uppercase font-mono text-indigo-400">Inference & Weighting Engine</h3>
                {aiInsights?.length > 0 && <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-sm font-bold font-mono animate-pulse">AUTOCALIBRATE</span>}
              </div>
              <p className="text-xs mt-1.5 font-medium text-slate-300 leading-relaxed max-w-2xl">
                {aiInsights && aiInsights.length > 0 
                  ? "Complex survey weights detected. Post-stratification logic injected for representative sampling." 
                  : "Analytical Mode: Select dependent and weighting variables to initialize the estimator."}
              </p>
              <AIInsightCard
                explanation={weightingExplanation}
                loading={loadingExplanations}
                error={explanationsError}
                cacheUsed={explanationsCacheUsed}
                onRefresh={fetchAIExplanations}
              />
            </div>
          </div>
          {aiInsights && aiInsights.length > 0 && (
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-900 rounded-md text-indigo-400 text-[10px] font-bold uppercase tracking-wider font-mono">
              <ShieldCheck size={13} className="text-emerald-400" /> Matrix Calibrated
            </div>
          )}
        </div>
      </div>

      {/* ===================================================== */}
      {/* ESTIMATION ERROR ALERT CALLOUT */}
      {/* ===================================================== */}
      {error && (
        <div
          data-testid="weighting-error-banner"
          className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-amber-300"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider font-mono">Estimation Error</p>
            <p className="mt-1 text-[11px] leading-relaxed text-amber-200/80">{error}</p>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* STATISTICAL ESTIMATION WORKBENCH PANEL */}
      {/* ===================================================== */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-900 bg-[#0b1329]/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
              <Scale size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-slate-200 uppercase tracking-wide font-mono">Statistical Estimation</h2>
                <InfoTooltip {...getTooltipContent('weighting')} iconSize={12} className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono font-bold bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-slate-500 uppercase">Module: Weight_Inference_v2</span>
                <ChevronRight size={12} className="text-slate-700" />
                <p className="text-[11px] text-slate-500 font-medium">Mitigation of non-response bias and probability adjustment</p>
              </div>
            </div>
          </div>
        </div>

        {/* ANALYTICAL CONTROLS */}
        <div className="bg-slate-950/10 border-b border-slate-900 p-6">
          <div className="grid md:grid-cols-4 gap-6 items-end">
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Target size={13} /> Target Variable
              </label>
              <select
                className="w-full border border-slate-700 bg-slate-950 hover:border-slate-600 rounded-md px-3 py-2 text-[11px] font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer text-slate-300 uppercase tracking-wide font-mono shadow-inner"
                value={valueColumn}
                onChange={(e) => setValueColumn(e.target.value)}
              >
                <option value="" className="text-slate-500">- SELECT FIELD -</option>
                {normalizedSchema.map((col, idx) => (<option key={idx} value={col.column} className="bg-slate-950 text-slate-200">{col.column}</option>))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Scale size={13} /> Weight Column
              </label>
              <select
                className="w-full border border-slate-700 bg-slate-950 hover:border-slate-600 rounded-md px-3 py-2 text-[11px] font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer text-slate-300 uppercase tracking-wide font-mono shadow-inner"
                value={weightColumn}
                onChange={(e) => setWeightColumn(e.target.value)}
              >
                <option value="" className="text-slate-500">- SELECT WEIGHT -</option>
                {numericColumns.map((col, idx) => (<option key={idx} value={col.column} className="bg-slate-950 text-slate-200">{col.column}</option>))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Activity size={13} /> Estimation Logic
              </label>
              <select
                className="w-full border border-slate-700 bg-slate-950 hover:border-slate-600 rounded-md px-3 py-2 text-[11px] font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer text-slate-300 uppercase tracking-wide font-mono shadow-inner"
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
              >
                <option value="mean" className="bg-slate-950 text-slate-200">Weighted Mean (μw)</option>
                <option value="proportion" className="bg-slate-950 text-slate-200">Weighted Proportion (pw)</option>
              </select>
            </div>

            <button
              onClick={onRunAnalysis}
              data-testid="weight-run-btn"
              disabled={loading || !valueColumn || !weightColumn}
              className="flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-950 disabled:text-slate-600 border border-transparent disabled:border-slate-900 text-white rounded-md px-6 py-2.5 transition-all font-bold uppercase text-[11px] tracking-wide shadow-md active:scale-95 font-mono"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
              {loading ? "Computing..." : "Run Engine"}
            </button>
            <InfoTooltip {...getTooltipContent('runEngine')} iconSize={12} className="h-5 w-5" />
          </div>
        </div>

        {/* RESULTS WORKBENCH OUTPUT */}
        {result && (
          <div className="p-6 border-t border-slate-900 space-y-8 bg-slate-950/5 animate-in fade-in duration-300">
            
            {/* TOP METRICS GRID WITH THICK OUTLINE FRAME */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-transparent rounded-none border-0">
              <div className="bg-[#0b1329]/60 border-2 border-slate-800 rounded-xl p-5 relative overflow-hidden group shadow-md">
                <div className="flex items-center gap-2 text-slate-400 uppercase text-[9px] font-bold tracking-wider font-mono mb-2">
                  <Database size={13} className="text-slate-600" /> Observation Count
                  <InfoTooltip {...getTooltipContent('observations')} iconSize={12} className="h-4 w-4" />
                </div>
                <h3 className="text-2xl font-mono font-bold text-slate-100 tracking-tight leading-none">
                  {Number.isFinite(rowsUsed) ? rowsUsed.toLocaleString() : '0'}
                </h3>
              </div>
              <div className="bg-[#0b1329]/60 border-2 border-slate-800 rounded-xl p-5 relative overflow-hidden group shadow-md">
                <div className="flex items-center gap-2 text-slate-400 uppercase text-[9px] font-bold tracking-wider font-mono mb-2">
                  <ShieldCheck size={13} className="text-slate-600" /> Statistical Confidence
                  <InfoTooltip {...getTooltipContent('aiConfidence')} iconSize={12} className="h-4 w-4" />
                </div>
                <h3 className="text-2xl font-mono font-bold text-emerald-400 tracking-tight leading-none">
                  {`${Math.round((Number.isFinite(confidenceLevel) ? confidenceLevel : 0) * 100)}%`}
                </h3>
              </div>
            </div>

            {/* WEIGHTED ESTIMATOR METRIC CARDS OUTPUT */}
            {analysisResult.analysis_type === "weighted_mean" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-[#0b1329]/60 border-2 border-slate-800 rounded-xl p-5 relative overflow-hidden group shadow-md">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-3">Weighted Mean (μw)<InfoTooltip {...getTooltipContent('weightedMean')} iconSize={12} className="h-4 w-4" /></div>
                  <h3 className="text-3xl font-mono font-bold leading-none text-indigo-400">{Number(analysisResult.weighted_mean ?? 0).toFixed(2)}</h3>
                  <div className="mt-5 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>STATUS: CONVERGED</span>
                    <Zap size={11} className="text-indigo-400" />
                  </div>
                </div>

                <div className="bg-[#0b1329]/60 border-2 border-slate-800 rounded-xl p-5 relative overflow-hidden group shadow-md">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-3">Raw Mean (μ)<InfoTooltip {...getTooltipContent('rawMean')} iconSize={12} className="h-4 w-4" /></div>
                  <h3 className="text-3xl font-mono font-bold text-slate-100 leading-none">{Number(analysisResult.unweighted_mean ?? 0).toFixed(2)}</h3>
                  <div className="mt-5">
                    <span className="inline-flex px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-sm text-[9px] font-bold font-mono border border-rose-500/20">
                      BIAS: {(() => {
                        const weightedMean = Number(analysisResult.weighted_mean ?? 0);
                        const unweightedMean = Number(analysisResult.unweighted_mean ?? 0);
                        if (!Number.isFinite(unweightedMean) || unweightedMean === 0) {
                          return '0.0';
                        }
                        return (((weightedMean - unweightedMean) / unweightedMean) * 100).toFixed(1);
                      })()}%
                    </span>
                  </div>
                </div>

                <div className="bg-[#0b1329]/60 border-2 border-slate-800 rounded-xl p-5 relative overflow-hidden group shadow-md">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-3">Standard Error (MoE)<InfoTooltip {...getTooltipContent('marginOfError')} iconSize={12} className="h-4 w-4" /></div>
                  <h3 className="text-3xl font-mono font-bold text-rose-400 leading-none">±{Number(analysisResult.margin_of_error ?? 0).toFixed(4)}</h3>
                  <p className="text-[9px] font-bold text-slate-600 uppercase mt-4 tracking-wide font-mono">[Residual Bounds]</p>
                </div>

                <div className="bg-[#0b1329]/60 border-2 border-slate-800 rounded-xl p-5 relative overflow-hidden group shadow-md">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-3">95% Conf. Interval<InfoTooltip {...getTooltipContent('confidenceInterval')} iconSize={12} className="h-4 w-4" /></div>
                  <div className="flex flex-col gap-1.5 font-mono text-xs">
                    <span className="font-sans font-bold text-slate-500 text-[10px] uppercase">UPPER: <span className="text-sm text-slate-200 font-mono font-semibold ml-1">{Number(confidenceInterval.upper ?? 0).toFixed(2)}</span></span>
                    <span className="font-sans font-bold text-slate-500 text-[10px] uppercase">LOWER: <span className="text-sm text-slate-200 font-mono font-semibold ml-1">{Number(confidenceInterval.lower ?? 0).toFixed(2)}</span></span>
                  </div>
                </div>

              </div>
            )}

            {/* VISUAL DIAGNOSTICS LAYER WITH THICK FRAMING OUTLINES */}
            <div className="rounded-xl border-2 border-slate-900 overflow-hidden bg-[#0f172a] p-4">
              <div className="px-1 py-3 bg-[#0f172a] flex items-center justify-between border-b border-slate-900 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-3.5 bg-indigo-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Weight Impact Diagnostic</h3>
                </div>
                <InfoTooltip {...getTooltipContent('weightImpact')} iconSize={14} className="h-5 w-5" />
              </div>
              <div className="w-full overflow-hidden bg-[#0f172a] h-72">
                <BarChartComponent data={visualizationRows} xKey="label" yKey="value" color="#818cf8" />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default WeightEstimationPanel;
