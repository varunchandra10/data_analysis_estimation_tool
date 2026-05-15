import React, { useState } from "react";
import axios from "axios";
import { 
  Scale, 
  BrainCircuit, 
  Activity, 
  BarChart3, 
  Info, 
  ShieldCheck, 
  Zap, 
  Loader2,
  Database,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Target
} from "lucide-react";
import BarChartComponent from "./charts/BarChartComponent";

const WeightEstimationPanel = ({ data, aiInsights = [], onEstimationComplete }) => {
  if (!data) return null;

  const { metadata, schema } = data;
  const numericColumns = schema.filter((col) => col.type === "Numerical");

  const [valueColumn, setValueColumn] = useState("");
  const [weightColumn, setWeightColumn] = useState("");
  const [analysisType, setAnalysisType] = useState("mean");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRunAnalysis = async () => {
    if (!valueColumn || !weightColumn) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/statistics/estimate", {
        file_path: metadata.file_path,
        value_column: valueColumn,
        weight_column: weightColumn,
        analysis_type: analysisType,
      });

      setResult(response.data);
      if (onEstimationComplete) onEstimationComplete(response.data);
    } catch (err) {
      console.error("Estimation Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 antialiased text-slate-900 dark:text-slate-100">
      {/* ===================================================== */}
      {/* PROFESSIONAL AI INTELLIGENCE BAR */}
      {/* ===================================================== */}
      <div className={`rounded-xl border transition-all duration-300 ${
        aiInsights && aiInsights.length > 0 
        ? "bg-slate-900 border-slate-800 text-white shadow-2xl shadow-indigo-500/10" 
        : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
      }`}>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-lg border ${aiInsights && aiInsights.length > 0 ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}`}>
              <BrainCircuit size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight uppercase italic opacity-90">Inference & Weighting Engine</h3>
                {aiInsights?.length > 0 && <span className="bg-indigo-500 text-[10px] px-1.5 py-0.5 rounded font-black animate-pulse">AUTOCALIBRATE</span>}
              </div>
              <p className={`text-xs mt-0.5 font-medium ${aiInsights && aiInsights.length > 0 ? "text-slate-400" : "text-slate-500"}`}>
                {aiInsights && aiInsights.length > 0 
                  ? "Complex survey weights detected. Post-stratification logic injected for representative sampling." 
                  : "Analytical Mode: Select dependent and weighting variables to initialize the estimator."}
              </p>
            </div>
          </div>
          {aiInsights && aiInsights.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck size={14} /> Matrix Calibrated
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* HEADER */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="p-3 bg-slate-900 dark:bg-indigo-500 text-white rounded-lg shadow-lg">
              <Scale size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Statistical Estimation</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 uppercase tracking-tighter">Module: Weight_Inference_v2</span>
                <ChevronRight size={12} className="text-slate-300" />
                <p className="text-xs text-slate-500 font-medium italic">Mitigation of non-response bias and probability adjustment</p>
              </div>
            </div>
          </div>
        </div>

        {/* ANALYTICAL CONTROLS */}
        <div className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 p-8">
          <div className="grid md:grid-cols-4 gap-6 items-end">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Target size={12} /> Target Variable
              </label>
              <select
                className="w-full h-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg px-4 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={valueColumn}
                onChange={(e) => setValueColumn(e.target.value)}
              >
                <option value="">Select Field</option>
                {schema.map((col, idx) => (<option key={idx} value={col.column}>{col.column}</option>))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Scale size={12} /> Weight Column
              </label>
              <select
                className="w-full h-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg px-4 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={weightColumn}
                onChange={(e) => setWeightColumn(e.target.value)}
              >
                <option value="">Select Weight</option>
                {numericColumns.map((col, idx) => (<option key={idx} value={col.column}>{col.column}</option>))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity size={12} /> Estimation Logic
              </label>
              <select
                className="w-full h-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg px-4 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
              >
                <option value="mean">Weighted Mean (μw)</option>
                <option value="proportion">Weighted Proportion (pw)</option>
              </select>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={loading || !valueColumn || !weightColumn}
              className="w-full h-10 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-lg font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:translate-y-px"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
              {loading ? "Computing..." : "Run Engine"}
            </button>
          </div>
        </div>

        {/* RESULTS WORKBENCH */}
        {result && (
          <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* TOP METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-white dark:bg-slate-900 p-6">
                <div className="flex items-center gap-2 text-slate-400 uppercase text-[9px] font-black tracking-widest mb-3">
                  <Database size={12} /> Observation Count
                </div>
                <h3 className="text-3xl font-mono font-bold text-slate-900 dark:text-white leading-none tracking-tighter">
                  {result.rows_used.toLocaleString()}
                </h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6">
                <div className="flex items-center gap-2 text-slate-400 uppercase text-[9px] font-black tracking-widest mb-3">
                  <ShieldCheck size={12} /> Statistical Level
                </div>
                <h3 className="text-3xl font-mono font-bold text-emerald-500 leading-none">
                  {(result.confidence_level * 100)}%
                </h3>
              </div>
            </div>

            {/* WEIGHTED ESTIMATOR OUTPUT */}
            {result.results.analysis_type === "weighted_mean" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-xl bg-slate-900 text-white shadow-2xl shadow-indigo-500/10 border border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Weighted Mean (μw)</p>
                  <h3 className="text-4xl font-mono font-bold leading-none">{result.results.weighted_mean.toFixed(2)}</h3>
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold text-indigo-400">
                    <span>STATUS: CONVERGED</span>
                    <Zap size={12} />
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Raw Mean (μ)</p>
                  <h3 className="text-4xl font-mono font-bold text-slate-900 dark:text-white leading-none">{result.results.unweighted_mean.toFixed(2)}</h3>
                  <div className="mt-6 flex items-center gap-2">
                    <div className="px-2 py-1 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded text-[10px] font-black border border-rose-100 dark:border-rose-900">
                      BIAS: {((result.results.weighted_mean - result.results.unweighted_mean) / result.results.unweighted_mean * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Standard Error (MoE)</p>
                  <h3 className="text-4xl font-mono font-bold text-rose-600 leading-none">±{result.results.margin_of_error.toFixed(4)}</h3>
                </div>

                <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">95% Conf. Interval</p>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-sm font-black text-slate-400">UPPER: <span className="text-lg text-slate-900 dark:text-white font-mono">{result.results.confidence_interval.upper.toFixed(2)}</span></span>
                    <span className="text-sm font-black text-slate-400">LOWER: <span className="text-lg text-slate-900 dark:text-white font-mono">{result.results.confidence_interval.lower.toFixed(2)}</span></span>
                  </div>
                </div>
              </div>
            )}

            {/* VISUAL DIAGNOSTICS */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Weight Impact Diagnostic</h3>
                </div>
                <div className="group relative">
                  <Info size={14} className="text-slate-300 cursor-help" />
                  <div className="absolute right-0 bottom-full mb-3 w-64 p-4 bg-slate-900 text-white text-[10px] leading-relaxed rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                    Analytical overlay: Compares raw survey distribution vs. post-stratification population estimates to visualize data distortion.
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="h-72 w-full">
                  <BarChartComponent data={result.visualizations} xKey="label" yKey="value" color="#6366f1" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightEstimationPanel;