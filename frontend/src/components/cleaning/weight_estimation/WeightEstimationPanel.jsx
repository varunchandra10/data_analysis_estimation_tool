import { 
  Scale, 
  BrainCircuit, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Loader2,
  Database,
  Target,
  AlertTriangle,
  TrendingUp,
  Percent,
  CheckCircle2
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
  const analysisResult = result?.results || result?.data || {};
  const rowsUsed = Number(result?.rows_used ?? analysisResult.rows_used ?? 0);
  const confidenceLevel = Number(result?.confidence_level ?? analysisResult.confidence_level ?? 0.95);
  const confidenceInterval = analysisResult.confidence_interval || {};
  const effectiveN = Number(analysisResult.effective_sample_size ?? 0);
  
  const visualizationRows = Array.isArray(result?.visualizations)
    ? result.visualizations
    : Array.isArray(analysisResult.visualizations)
      ? analysisResult.visualizations
      : [];

  if (!data) return null;

  const { metadata, schema } = data;
  const normalizedSchema = Array.isArray(schema) ? schema : [];
  const numericColumns = normalizedSchema.filter(
    (col) => col.type === "Numerical" || col.type === "numeric" || col.type === "Integer" || col.type === "Float"
  );

  // Kish design effect: Deff = N / n_eff
  const designEffect = (rowsUsed > 0 && effectiveN > 0) 
    ? (rowsUsed / effectiveN).toFixed(2) 
    : "1.00";

  // Bias shift calculation
  const weightedMean = Number(analysisResult.weighted_mean ?? 0);
  const unweightedMean = Number(analysisResult.unweighted_mean ?? 0);
  const biasShift = (Number.isFinite(unweightedMean) && unweightedMean !== 0)
    ? (((weightedMean - unweightedMean) / unweightedMean) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 antialiased text-slate-800 dark:text-slate-200 font-sans max-w-[1600px] mx-auto pb-12 px-4 sm:px-6">
      
      {/* ===================================================== */}
      {/* 1. ANALYTICAL CONTEXT HEADER */}
      {/* ===================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
              <Scale size={13} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Survey Estimation & Inference Engine
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              Statistical Estimation & Weighting
            </h2>
            <InfoTooltip {...getTooltipContent('weighting')} iconSize={14} className="h-5 w-5" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Mitigate non-response bias, calculate Horvitz-Thompson weighted aggregates, and infer population parameters for:{" "}
            <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
              {metadata?.filename || 'Active Dataset Buffer'}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide font-mono">Engine State</p>
            <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              Calibrated Estimator
            </p>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <Activity size={16} className="text-indigo-500 dark:text-indigo-400" />
        </div>
      </div>

      {/* ===================================================== */}
      {/* 2. HEURISTICS ADVISORY & AI INTELLIGENCE BAR */}
      {/* ===================================================== */}
      <div className={`rounded-2xl border transition-all duration-300 shadow-xs ${
        aiInsights && aiInsights.length > 0 
          ? "bg-indigo-50/40 dark:bg-slate-900/90 border-indigo-200 dark:border-indigo-500/30" 
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      }`}>
        <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-xl border shrink-0 ${
              aiInsights && aiInsights.length > 0 
                ? "bg-white dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400" 
                : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500"
            }`}>
              <BrainCircuit size={20} strokeWidth={2} />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xs font-bold tracking-wider uppercase font-mono text-indigo-600 dark:text-indigo-400">
                  Inference & Weighting Engine
                </h3>
                {aiInsights?.length > 0 && (
                  <span className="bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[9px] px-2 py-0.5 rounded-md font-bold font-mono animate-pulse">
                    AUTOCALIBRATED
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {aiInsights && aiInsights.length > 0 
                  ? "Complex survey weights detected. Post-stratification calibration logic applied for representative demographic distribution." 
                  : "Analytical Mode: Select target observable and calibrated sampling weights to execute population inference."}
              </p>
              <AIInsightCard
                title="Weighting & Inference Rationale"
                explanation={weightingExplanation}
                loading={loadingExplanations}
                error={explanationsError}
                cacheUsed={explanationsCacheUsed}
                onRefresh={fetchAIExplanations}
              />
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 self-start lg:self-center">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider font-mono shadow-2xs">
              <ShieldCheck size={13} /> Matrix Calibrated
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* ESTIMATION ERROR ALERT CALLOUT */}
      {/* ===================================================== */}
      {error && (
        <div
          data-testid="weighting-error-banner"
          className="flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 p-4 text-amber-800 dark:text-amber-300 shadow-2xs animate-in fade-in duration-200"
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider font-mono">Estimation Engine Notice</p>
            <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* 3. STATISTICAL ESTIMATION WORKBENCH PANEL */}
      {/* ===================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-xl">
              <Scale size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wide font-mono">
                  Statistical Estimation
                </h2>
                <InfoTooltip {...getTooltipContent('weighting')} iconSize={12} className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 uppercase">
                  Module: Weight_Inference_v2
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Horvitz-Thompson unbiased estimators with Kish design-effect telemetry
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ANALYTICAL CONTROLS */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            
            {/* Target Column */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Target size={13} className="text-indigo-500" /> Target Variable
              </label>
              <div className="relative">
                <select
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all cursor-pointer text-slate-800 dark:text-slate-200 uppercase tracking-wide font-mono shadow-2xs"
                  value={valueColumn}
                  onChange={(e) => setValueColumn(e.target.value)}
                >
                  <option value="" className="text-slate-400">- SELECT FIELD -</option>
                  {normalizedSchema.map((col, idx) => (
                    <option key={idx} value={col.column} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">
                      {col.column} {col.type ? `(${col.type})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Weight Column */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Scale size={13} className="text-indigo-500" /> Weight Column
              </label>
              <div className="relative">
                <select
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all cursor-pointer text-slate-800 dark:text-slate-200 uppercase tracking-wide font-mono shadow-2xs"
                  value={weightColumn}
                  onChange={(e) => setWeightColumn(e.target.value)}
                >
                  <option value="" className="text-slate-400">- SELECT WEIGHT -</option>
                  {numericColumns.map((col, idx) => (
                    <option key={idx} value={col.column} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">
                      {col.column}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estimation Logic */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Activity size={13} className="text-indigo-500" /> Estimation Logic
              </label>
              <div className="relative">
                <select
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all cursor-pointer text-slate-800 dark:text-slate-200 uppercase tracking-wide font-mono shadow-2xs"
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                >
                  <option value="mean" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">
                    Weighted Mean (μw)
                  </option>
                  <option value="proportion" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">
                    Weighted Proportion (pw)
                  </option>
                </select>
              </div>
            </div>

            {/* Run Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRunAnalysis}
                data-testid="weight-run-btn"
                disabled={loading || !valueColumn || !weightColumn}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-950 disabled:text-slate-400 dark:disabled:text-slate-600 border border-transparent disabled:border-slate-200 dark:disabled:border-slate-800 text-white rounded-xl px-5 py-2.5 transition-all font-bold uppercase text-xs tracking-wider shadow-sm active:scale-95 group font-mono cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={15} /> : <Zap size={15} />}
                <span>{loading ? "Computing..." : "Run Engine"}</span>
              </button>
              <InfoTooltip {...getTooltipContent('runEngine')} iconSize={13} className="h-5 w-5 shrink-0" />
            </div>

          </div>
        </div>

        {/* ===================================================== */}
        {/* 4. RESULTS WORKBENCH OUTPUT OR STANDBY STATE */}
        {/* ===================================================== */}
        {!result ? (
          <div className="p-10 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center">
            <div className="max-w-md mx-auto space-y-3">
              <div className="p-3 w-fit mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                <Scale size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wide">
                Ready for Survey Weighting
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Select a target variable and calibrated weight column above, then click <span className="font-semibold text-indigo-600 dark:text-indigo-400">Run Engine</span> to calculate unbiased point estimates, effective sample sizes, and error margins.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-6 bg-slate-50/30 dark:bg-slate-950/20 animate-in fade-in duration-300">
            
            {/* TOP METRICS GRID (4 CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Observations (N)
                  </span>
                  <Database size={14} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                  {Number.isFinite(rowsUsed) ? rowsUsed.toLocaleString() : '0'}
                </h3>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  Microdata records used
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Effective Sample (n_eff)
                  </span>
                  <Activity size={14} className="text-indigo-500" />
                </div>
                <h3 className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {Number.isFinite(effectiveN) && effectiveN > 0 ? effectiveN.toLocaleString(undefined, { maximumFractionDigits: 1 }) : rowsUsed.toLocaleString()}
                </h3>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  Kish effective degrees
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Statistical Confidence
                  </span>
                  <ShieldCheck size={14} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {`${Math.round((Number.isFinite(confidenceLevel) ? confidenceLevel : 0.95) * 100)}%`}
                </h3>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  Interval coverage target
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Design Effect (Deff)
                  </span>
                  <TrendingUp size={14} className="text-amber-500" />
                </div>
                <h3 className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-200">
                  {designEffect}
                </h3>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  Variance inflation factor
                </p>
              </div>

            </div>

            {/* ===================================================== */}
            {/* WEIGHTED ESTIMATOR OUTPUT: MEAN */}
            {/* ===================================================== */}
            {analysisResult.analysis_type === "weighted_mean" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Weighted Mean */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs relative overflow-hidden group">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
                    <span className="flex items-center gap-1">
                      Weighted Mean (μw)
                      <InfoTooltip {...getTooltipContent('weightedMean')} iconSize={12} className="h-4 w-4" />
                    </span>
                    <Zap size={13} className="text-indigo-500" />
                  </div>
                  <h3 className="text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400 leading-none">
                    {Number(analysisResult.weighted_mean ?? 0).toFixed(2)}
                  </h3>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-500 font-mono">
                    <span>CONVERGED</span>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Unbiased
                    </span>
                  </div>
                </div>

                {/* Raw Mean */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs relative overflow-hidden group">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
                    <span className="flex items-center gap-1">
                      Raw Mean (μ)
                      <InfoTooltip {...getTooltipContent('rawMean')} iconSize={12} className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-100 leading-none">
                    {Number(analysisResult.unweighted_mean ?? 0).toFixed(2)}
                  </h3>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Weighting Bias:</span>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border ${
                      Number(biasShift) !== 0 
                        ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}>
                      {biasShift > 0 ? `+${biasShift}%` : `${biasShift}%`}
                    </span>
                  </div>
                </div>

                {/* Standard Error / MoE */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs relative overflow-hidden group">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
                    <span className="flex items-center gap-1">
                      Margin of Error (MoE)
                      <InfoTooltip {...getTooltipContent('marginOfError')} iconSize={12} className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="text-3xl font-mono font-bold text-rose-600 dark:text-rose-400 leading-none">
                    ±{Number(analysisResult.margin_of_error ?? 0).toFixed(4)}
                  </h3>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>SE: {Number(analysisResult.standard_error ?? 0).toFixed(4)}</span>
                    <span className="uppercase font-bold">Res. Bounds</span>
                  </div>
                </div>

                {/* Confidence Interval */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs relative overflow-hidden group">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
                    <span className="flex items-center gap-1">
                      95% Conf. Interval
                      <InfoTooltip {...getTooltipContent('confidenceInterval')} iconSize={12} className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500 text-[10px] uppercase">LOWER BOUND</span>
                      <span className="text-sm text-slate-800 dark:text-slate-100 font-bold">
                        {Number(confidenceInterval.lower ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500 text-[10px] uppercase">UPPER BOUND</span>
                      <span className="text-sm text-slate-800 dark:text-slate-100 font-bold">
                        {Number(confidenceInterval.upper ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400">
                    Range: [{Number(confidenceInterval.lower ?? 0).toFixed(2)}, {Number(confidenceInterval.upper ?? 0).toFixed(2)}]
                  </div>
                </div>

              </div>
            )}

            {/* ===================================================== */}
            {/* WEIGHTED ESTIMATOR OUTPUT: PROPORTION */}
            {/* ===================================================== */}
            {(analysisResult.analysis_type === "weighted_proportion" || analysisResult.analysis_type === "proportion") && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent size={15} className="text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                      Weighted Categorical Proportions
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    pw ESTIMATE
                  </span>
                </div>

                <div className="p-5">
                  {analysisResult.proportions && typeof analysisResult.proportions === 'object' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(analysisResult.proportions).map(([cat, val], idx) => {
                        const weightedPct = typeof val === 'object' 
                          ? Number(val.weighted ?? val.weighted_proportion ?? 0) * 100
                          : Number(val) * 100;
                        const unweightedPct = typeof val === 'object' && val.unweighted !== undefined
                          ? Number(val.unweighted) * 100
                          : null;

                        return (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{cat}</span>
                              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                {weightedPct.toFixed(1)}%
                              </span>
                            </div>
                            {unweightedPct !== null && (
                              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                                <span>Raw Observed: {unweightedPct.toFixed(1)}%</span>
                                <span className={weightedPct > unweightedPct ? "text-emerald-600" : "text-amber-600"}>
                                  {(weightedPct - unweightedPct).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-slate-500 text-center py-4">
                      Categorical proportions successfully computed.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ===================================================== */}
            {/* VISUAL DIAGNOSTICS LAYER */}
            {/* ===================================================== */}
            {visualizationRows.length > 0 && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                      Weight Impact Diagnostic
                    </h3>
                  </div>
                  <InfoTooltip {...getTooltipContent('weightImpact')} iconSize={14} className="h-5 w-5" />
                </div>
                <div className="w-full h-72">
                  <BarChartComponent data={visualizationRows} xKey="label" yKey="value" color="#6366f1" />
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default WeightEstimationPanel;
