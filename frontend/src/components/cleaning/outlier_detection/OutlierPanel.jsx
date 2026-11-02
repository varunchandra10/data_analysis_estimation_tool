import { useMemo } from "react";
import { 
  AlertTriangle, 
  BarChart3, 
  Settings2, 
  Table as TableIcon, 
  Activity, 
  Loader2, 
  BrainCircuit, 
  Bot, 
  Zap, 
  Database, 
  Crosshair, 
  Cpu, 
  Terminal, 
  Sigma,
  CheckCircle2,
  Sparkles,
  Info
} from "lucide-react";

import HistogramChart from "../../charts/HistogramChart";
import ScatterChartComponent from "../../charts/ScatterChartComponent";
import BoxPlotComponent from "../../charts/BoxPlotComponent";
import GraphEnclosure from "../../UI/graphModal";
import { useAI } from "../../../hooks/useAI";
import AIInsightCard from "../../common/AIInsightCard";
import InfoTooltip from "../../UI/InfoTooltip";
import { getTooltipContent } from "../../../utils/tooltipContent";

const OutlierPanel = ({
  data,
  numericColumns: propsNumericColumns,
  aiInsights = [],
  selectedColumn,
  setSelectedColumn,
  method,
  setMethod,
  result,
  loading,
  applyLoading,
  onDetect,
  onApply
}) => {
  const {
    explanations,
    loadingExplanations,
    explanationsError,
    explanationsCacheUsed,
    fetchAIExplanations
  } = useAI();

  const getOutlierExplanation = (columnName) => {
    const colExp = explanations?.explanations?.find(exp => exp.column === columnName);
    return colExp?.outlier_ai_explanation;
  };

  const { metadata } = data || {};
  
  const numericColumns = useMemo(() => {
    if (propsNumericColumns && propsNumericColumns.length > 0) return propsNumericColumns;
    const schema = Array.isArray(data?.schema) ? data.schema : [];
    return schema.filter(
      (col) => col.type === "Numerical" || col.type === "numeric" || col.type === "Integer" || col.type === "Float"
    );
  }, [propsNumericColumns, data]);

  const visualizations = result?.visualizations || {};
  const histogramData = Array.isArray(visualizations.histogram) ? visualizations.histogram : [];
  const boxplotStats = visualizations.boxplot || null;

  // Synthesize or derive scatter coordinates
  const scatterData = useMemo(() => {
    const viz = result?.visualizations || {};
    if (Array.isArray(viz.scatterplot) && viz.scatterplot.length > 0) {
      return viz.scatterplot;
    }
    // Synthesize residual scatter distribution from preview or affected rows
    const sourceRows = Array.isArray(result?.affected_rows) && result.affected_rows.length > 0
      ? result.affected_rows
      : (Array.isArray(result?.preview) ? result.preview : (Array.isArray(data?.preview) ? data.preview : []));

    if (selectedColumn && sourceRows.length > 0) {
      return sourceRows
        .map((row, idx) => ({
          x: idx + 1,
          y: typeof row[selectedColumn] === 'number' ? row[selectedColumn] : parseFloat(row[selectedColumn])
        }))
        .filter(pt => !isNaN(pt.y));
    }
    return [];
  }, [result, data, selectedColumn]);

  const hasHistogramData = histogramData.length > 0;
  const hasScatterData = scatterData.length > 0;

  // Selected column AI insight
  const activeColumnInsight = useMemo(() => {
    if (!selectedColumn || !Array.isArray(aiInsights)) return null;
    return aiInsights.find(i => i.column === selectedColumn) || null;
  }, [selectedColumn, aiInsights]);

  // Method explanation helper
  const getMethodBadge = (m) => {
    switch (m) {
      case "iqr":
        return { label: "IQR (Tukey Fence)", desc: "Q1 - 1.5×IQR to Q3 + 1.5×IQR", tag: "Robust to Skew" };
      case "zscore":
        return { label: "Z-Score (Gaussian)", desc: "Values deviating |Z| > 3.0σ", tag: "Normal Distribution" };
      case "winsorization":
        return { label: "Winsorization", desc: "Caps at 5th & 95th Percentiles", tag: "Capping Strategy" };
      default:
        return { label: m?.toUpperCase() || "CUSTOM", desc: "Outlier filtering", tag: "Statistical" };
    }
  };

  const currentMethodInfo = getMethodBadge(method);

  // Calculate percentage of outliers if row count is known
  const totalRows = metadata?.row_count || metadata?.rows || 100;
  const outlierPercentage = result?.total_outliers !== undefined
    ? ((result.total_outliers / (totalRows || 1)) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 antialiased text-slate-800 dark:text-slate-200 font-sans max-w-[1600px] mx-auto pb-12 px-4 sm:px-6">
      
      {/* ===================================================== */}
      {/* 1. ANALYTICAL CONTEXT HEADER */}
      {/* ===================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
              <Sigma size={13} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Quality & Refinement Diagnostic
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              Outlier Vector Analysis
            </h2>
            <InfoTooltip {...getTooltipContent('outlierAnalysis')} iconSize={14} className="h-5 w-5" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Detect observational deviants, high-influence residuals, and dispersion anomalies in:{" "}
            <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
              {metadata?.filename || 'Active Dataset Buffer'}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide font-mono">Vector Stream</p>
            <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {numericColumns.length} Numeric Features
            </p>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <Cpu size={16} className="text-indigo-500 dark:text-indigo-400" />
        </div>
      </div>

      {/* ===================================================== */}
      {/* 2. HEURISTICS ADVISORY & QUICK-SELECT BAR */}
      {/* ===================================================== */}
      <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-xs ${
        aiInsights && aiInsights.length > 0 
          ? "bg-rose-50/40 dark:bg-slate-900/90 border-rose-200 dark:border-rose-500/30" 
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      }`}>
        <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className={`mt-0.5 p-2.5 rounded-xl border shrink-0 ${
              aiInsights && aiInsights.length > 0 
                ? "bg-white dark:bg-rose-950/60 border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-400" 
                : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500"
            }`}>
              <BrainCircuit size={20} />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xs font-bold tracking-wider uppercase text-rose-600 dark:text-rose-400 font-mono">
                  Neural Anomaly Heuristics
                </h3>
                {aiInsights?.length > 0 && (
                  <span className="flex items-center gap-1 bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[10px] px-2 py-0.5 rounded-md font-bold border border-rose-200 dark:border-rose-500/20 font-mono">
                    <Activity size={10} className="animate-pulse" /> SKEW_DETECTED
                  </span>
                )}
              </div>
              <p className="text-xs font-medium leading-relaxed max-w-3xl text-slate-600 dark:text-slate-300">
                {aiInsights && aiInsights.length > 0 
                  ? "Distribution skewness identified across surveyed dimensions. Parametric detection (e.g. standard normal Z-Score) may yield biased residuals; Tukey IQR or Winsorization capping is recommended for skewed features." 
                  : "Variance check complete: Dimension distributions align with standard parametric detection assumptions."}
              </p>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-2 self-start lg:self-center">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider font-mono shadow-2xs">
              <Bot size={13} /> AI Advisory Active
            </span>
          </div>
        </div>

        {/* Quick select chips for columns recommended by AI */}
        {aiInsights && aiInsights.length > 0 && (
          <div className="px-5 pb-4 pt-1 border-t border-rose-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Sparkles size={11} className="text-indigo-500" /> Recommended Targets:
            </span>
            {aiInsights.map((insight, idx) => {
              const isSelected = selectedColumn === insight.column;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedColumn(insight.column);
                    if (insight.recommended_method) {
                      setMethod(insight.recommended_method.toLowerCase());
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                      : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`}
                >
                  <span className="font-bold">{insight.column}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded ${
                    isSelected ? "bg-indigo-700 text-indigo-100" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>
                    {insight.recommended_method?.toUpperCase()}
                  </span>
                  {isSelected && <CheckCircle2 size={11} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================================================== */}
      {/* 3. WORKBENCH CONTROLS CARD */}
      {/* ===================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
        
        {/* Module Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-xl">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase font-mono">
                Anomaly Parser Workbench
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 uppercase">
                  Vector_Parser_v2.4
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Configurable parametric & non-parametric outlier boundaries
                </p>
              </div>
            </div>
          </div>

          {selectedColumn && (
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Target Dimension</span>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{selectedColumn}</span>
            </div>
          )}
        </div>

        {/* Form Controls Section */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            
            {/* Feature Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Database size={13} className="text-indigo-500" /> Analytical Vector
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {numericColumns.length} available
                </span>
              </div>
              <div className="relative">
                <select
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all cursor-pointer text-slate-800 dark:text-slate-200 uppercase tracking-wide font-mono shadow-2xs"
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  <option value="" className="text-slate-400">- SELECT NUMERICAL COLUMN -</option>
                  {numericColumns.map((col, idx) => (
                    <option key={idx} value={col.column} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">
                      {col.column} {col.type ? `(${col.type})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Methodology Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Settings2 size={13} className="text-indigo-500" /> Detection Methodology
                </label>
                <InfoTooltip {...getTooltipContent('detectionMethod')} iconSize={12} className="h-4 w-4" />
              </div>
              <div className="relative">
                <select
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all cursor-pointer text-slate-800 dark:text-slate-200 uppercase tracking-wide font-mono shadow-2xs"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="iqr" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">
                    IQR (Interquartile Range - Tukey)
                  </option>
                  <option value="zscore" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">
                    Z-Score (Standardized residuals |Z| &gt; 3)
                  </option>
                  <option value="winsorization" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">
                    Winsorization (5th & 95th Percentile Capping)
                  </option>
                </select>
              </div>
            </div>

            {/* Action Trigger */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDetect(selectedColumn, method)}
                data-testid="outlier-detect-btn"
                disabled={loading || !selectedColumn}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-950 disabled:text-slate-400 dark:disabled:text-slate-600 border border-transparent disabled:border-slate-200 dark:disabled:border-slate-800 text-white rounded-xl px-5 py-2.5 transition-all font-bold uppercase text-xs tracking-wider shadow-sm active:scale-95 group font-mono cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={15} />
                ) : (
                  <Crosshair size={15} className="group-hover:rotate-90 transition-transform duration-500" />
                )}
                <span>{loading ? "PARSING VECTORS..." : "EXECUTE ANALYSIS"}</span>
              </button>
              <InfoTooltip {...getTooltipContent('detectOutliers')} iconSize={13} className="h-5 w-5 shrink-0" />
            </div>

          </div>

          {/* Active Method Mathematical Guidance */}
          <div className="mt-4 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                Formula Fence:
              </span>
              <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                {currentMethodInfo.desc}
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 px-2 py-0.5 rounded-md">
              {currentMethodInfo.tag}
            </span>
          </div>

          {/* AI Advisory Callout for Selected Feature */}
          {activeColumnInsight && (
            <div className="mt-5 p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/40 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <Bot size={17} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 font-mono uppercase tracking-wide">
                      Statistical Advisory for {selectedColumn}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      REC: {activeColumnInsight.recommended_method?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Quick 1-click sync if method does not match recommendation */}
                {method !== activeColumnInsight.recommended_method?.toLowerCase() && (
                  <button
                    type="button"
                    onClick={() => {
                      const recMethod = activeColumnInsight.recommended_method.toLowerCase();
                      setMethod(recMethod);
                      onDetect(selectedColumn, recMethod);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all cursor-pointer font-mono"
                  >
                    <Sparkles size={12} />
                    <span>Apply AI Recommendation</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
                "{activeColumnInsight.reason}"
              </p>

              {activeColumnInsight.warning && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-bold font-mono">
                  <Zap size={13} className="text-rose-500 shrink-0" /> 
                  <span>Warning: {activeColumnInsight.warning}</span>
                </div>
              )}

              <AIInsightCard
                title="Method Explanation & Rationale"
                explanation={getOutlierExplanation(selectedColumn)}
                loading={loadingExplanations}
                error={explanationsError}
                cacheUsed={explanationsCacheUsed}
                onRefresh={fetchAIExplanations}
              />
            </div>
          )}

        </div>

        {/* ===================================================== */}
        {/* 4. ANALYSIS OUTPUT OR STANDBY STATE */}
        {/* ===================================================== */}
        {!result ? (
          <div className="p-10 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center">
            <div className="max-w-md mx-auto space-y-3">
              <div className="p-3 w-fit mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                <Crosshair size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wide">
                Ready for Outlier Scan
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Select an analytical vector above and click <span className="font-semibold text-indigo-600 dark:text-indigo-400">EXECUTE ANALYSIS</span> to compute density distributions, residual scatter plots, and five-number boxplot quantiles.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-6 bg-slate-50/30 dark:bg-slate-950/20 animate-in fade-in duration-300">
            
            {/* SCORECARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  label: "Outlier Frequency", 
                  value: result.total_outliers, 
                  icon: AlertTriangle, 
                  color: "text-rose-500", 
                  sub: `${outlierPercentage}% of observations` 
                },
                { 
                  label: "Execution Model", 
                  value: (result.method || method).toUpperCase(), 
                  icon: Settings2, 
                  color: "text-indigo-500", 
                  sub: currentMethodInfo.tag 
                },
                { 
                  label: "Target Feature", 
                  value: result.column || selectedColumn, 
                  icon: Database, 
                  color: "text-emerald-500", 
                  sub: "Numerical dimension" 
                },
                { 
                  label: "Boundary Thresholds", 
                  value: result.thresholds?.lower_bound !== undefined 
                    ? `[${result.thresholds.lower_bound.toFixed(2)}, ${result.thresholds.upper_bound.toFixed(2)}]`
                    : "Computed Bounds", 
                  icon: Sigma, 
                  color: "text-amber-500", 
                  sub: "Tukey fence limits" 
                },
              ].map((kpi, i) => (
                <div 
                  key={i} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 relative overflow-hidden shadow-2xs group hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono leading-none">
                      {kpi.label}
                    </span>
                    <kpi.icon size={15} className={kpi.color} />
                  </div>
                  <h3 className={`font-mono font-bold tracking-tight truncate ${
                    typeof kpi.value === 'number' 
                      ? (kpi.value > 0 ? 'text-2xl text-rose-600 dark:text-rose-400' : 'text-2xl text-emerald-600 dark:text-emerald-400')
                      : 'text-sm text-slate-800 dark:text-slate-100'
                  }`}>
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                  </h3>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    {kpi.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* ===================================================== */}
            {/* 5. DYNAMIC GRAPH SHELL ENCLOSURE ROW LAYOUT */}
            {/* ===================================================== */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* DENSITY DISTRIBUTION ENCLOSURE SLOT */}
              <div className="xl:col-span-7">
                <GraphEnclosure
                  title="Density Distribution"
                  subtitle="Continuous frequency histogram across feature bins"
                  tooltip={getTooltipContent('histograms')}
                  icon={BarChart3}
                  hasData={hasHistogramData}
                >
                  <div className="h-[400px] w-full p-2 bg-slate-50/50 dark:bg-slate-950/40 rounded-lg">
                    <HistogramChart data={histogramData} color="#6366f1" />
                  </div>
                </GraphEnclosure>
              </div>

              {/* RESIDUAL SCATTER MAP ENCLOSURE SLOT */}
              <div className="xl:col-span-5">
                <GraphEnclosure
                  title="Residual Scatter Map"
                  subtitle="Observation distribution & deviant dispersion plotting"
                  tooltip={getTooltipContent('residualScatter')}
                  icon={Crosshair}
                  hasData={hasScatterData}
                >
                  <div className="h-[400px] w-full p-2 bg-slate-50/50 dark:bg-slate-950/40 rounded-lg">
                    <ScatterChartComponent data={scatterData} xKey="x" yKey="y" color="#f43f5e" />
                  </div>
                </GraphEnclosure>
              </div>

            </div>

            {/* ===================================================== */}
            {/* 6. FIVE-NUMBER SUMMARY DIAGNOSTIC ENCLOSURE */}
            {/* ===================================================== */}
            <GraphEnclosure
              title="Five-Number Summary Diagnostic"
              subtitle="Distribution Analysis • Quartile-Based Dispersion Overview"
              tooltip={getTooltipContent('boxplot')}
              icon={Terminal}
              hasData={Boolean(boxplotStats)}
            >
              <div className="space-y-6">
                <BoxPlotComponent stats={boxplotStats} />
                
                {result.thresholds && Object.keys(result.thresholds).length > 0 && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-3">
                      Calculated Statistical Boundaries
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(result.thresholds).map(([key, val], idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <p className="text-[9px] font-bold text-slate-500 uppercase mb-1 font-mono">{key.replace('_', ' ')}</p>
                          <p className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {typeof val === 'number' ? val.toFixed(4) : String(val)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GraphEnclosure>

            {/* ===================================================== */}
            {/* 7. IDENTIFIED OUTLIER ROWS (AFFECTED RECORDS) */}
            {/* ===================================================== */}
            {result.total_outliers > 0 && Array.isArray(result.affected_rows) && result.affected_rows.length > 0 && (
              <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 border-b border-rose-100 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                        Identified Outlier Records
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Showing {result.affected_rows.length} flagged records exceeding boundary thresholds
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 uppercase">
                    {result.total_outliers} Total Deviants
                  </span>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                        {Object.keys(result.affected_rows[0]).map((key, idx) => (
                          <th 
                            key={idx} 
                            className={`px-4 py-2.5 border-r border-slate-200 dark:border-slate-800 last:border-0 ${
                              key === (result.column || selectedColumn) ? 'bg-rose-100/60 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' : ''
                            }`}
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-mono text-[11px] divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {result.affected_rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition-colors">
                          {Object.entries(row).map(([key, value], i) => (
                            <td 
                              key={i} 
                              className={`px-4 py-2.5 border-r border-slate-200 dark:border-slate-800 last:border-0 whitespace-nowrap ${
                                key === (result.column || selectedColumn)
                                  ? 'bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold'
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {typeof value === 'number' ? value.toLocaleString() : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===================================================== */}
            {/* 8. PREVIEW AFTER APPLY & ACTION BAR */}
            {/* ===================================================== */}
            {result.applied_preview && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* CURRENT DATASET HEAD */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TableIcon size={14} className="text-slate-500" />
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                        Current Dataset Head
                      </h5>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 font-bold bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                      ORIGINAL
                    </span>
                  </div>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                          {result.preview?.[0] && Object.keys(result.preview[0]).map((key, idx) => (
                            <th key={idx} className="px-3.5 py-2 font-bold border-r border-slate-200 dark:border-slate-800 last:border-0">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="font-mono text-[11px] divide-y divide-slate-100 dark:divide-slate-800/60">
                        {result.preview?.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="px-3.5 py-2 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 last:border-0 whitespace-nowrap">
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PREVIEW: AFTER APPLY */}
                <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                  <div className="px-4 py-3 border-b border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-950/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TableIcon size={14} className="text-indigo-600 dark:text-indigo-400" />
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 font-mono">
                        Staged Corrections Head
                      </h5>
                    </div>
                    <span className="text-[9px] font-mono text-rose-700 dark:text-rose-400 font-bold bg-rose-100 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-500/20 uppercase">
                      CHANGES_STAGED
                    </span>
                  </div>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                          {result.applied_preview?.[0] && Object.keys(result.applied_preview[0]).map((key, idx) => (
                            <th key={idx} className="px-3.5 py-2 font-bold border-r border-slate-200 dark:border-slate-800 last:border-0">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="font-mono text-[11px] divide-y divide-slate-100 dark:divide-slate-800/60">
                        {result.applied_preview?.map((row, idx) => (
                          <tr key={idx} className="hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-colors">
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="px-3.5 py-2 text-rose-700 dark:text-rose-300 border-r border-slate-200 dark:border-slate-800 last:border-0 whitespace-nowrap">
                                {typeof value === 'number' ? (
                                  <span className="font-bold text-rose-600 dark:text-rose-400">{value.toLocaleString()}</span>
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

            {/* ACTION COMMIT BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Info size={14} className="text-indigo-500" />
                <span>
                  {result.total_outliers > 0 
                    ? `Committing will ${method === 'winsorization' ? 'cap extreme values' : 'filter outlier rows'} and update your active dataset buffer.`
                    : "No observational deviants detected with current parameters."}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onApply}
                  data-testid="outlier-apply-btn"
                  disabled={applyLoading || result.total_outliers === 0}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 dark:disabled:bg-slate-950 disabled:text-slate-400 dark:disabled:text-slate-600 border border-transparent disabled:border-slate-200 dark:disabled:border-slate-800 text-white rounded-xl px-5 py-2.5 font-bold uppercase text-xs tracking-wider shadow-sm active:scale-95 transition-all font-mono cursor-pointer"
                >
                  {applyLoading ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Database size={14} />
                  )}
                  <span>{applyLoading ? "COMMITTING CHANGES..." : "APPLY OUTLIER FILTER"}</span>
                </button>
                <InfoTooltip {...getTooltipContent('applyOutliers')} iconSize={13} className="h-5 w-5 self-center" />
              </div>
            </div>
            
            {/* Confirmed Applied Dataset Result Banner */}
            {result.applied && result.preview && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 flex items-center justify-between gap-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 font-mono uppercase">
                      Outlier Filter Successfully Committed
                    </h5>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Active buffer updated to staged state: {result.file_path?.split('/').pop() || 'dataset_cleaned.csv'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 uppercase">
                  ACTIVE_STAGE
                </span>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default OutlierPanel;
