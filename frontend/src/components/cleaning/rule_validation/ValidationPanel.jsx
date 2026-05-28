import React from "react";
import { 
  ShieldCheck, 
  BrainCircuit, 
  Plus, 
  Play, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Bot,
  Info,
  Loader2,
  Table as TableIcon,
  ChevronRight,
  Database
} from "lucide-react";
import { useAI } from "../../../hooks/useAI";
import AIInsightCard from "../../common/AIInsightCard";
import InfoTooltip from "../../UI/InfoTooltip";
import { getTooltipContent } from "../../../utils/tooltipContent";

const RuleValidationPanel = ({
  data,
  aiInsights = [],
  rules = [],
  result = null,
  loading = false,
  suggestions = [],
  suggestionLoading = false,
  suggestionError = '',
  onAddSimpleRule,
  onRemoveRule,
  onUpdateRule,
  onRunValidation,
  onSuggestRules
}) => {
  const {
    explanations,
    loadingExplanations,
    explanationsError,
    explanationsCacheUsed,
    fetchAIExplanations
  } = useAI();

  const validationExplanation = explanations?.summary_explanations?.validation_ai_explanation;

  if (!data) return null;

  const { metadata, schema } = data;
  const visibleInsights = suggestions.length > 0 ? suggestions : aiInsights;
  const violations = Array.isArray(result?.violations) ? result.violations : [];

  return (
    <div className="space-y-6 antialiased text-slate-200 font-sans max-w-[1600px] mx-auto pb-12 px-4 sm:px-6 selection:bg-slate-800">
      
      {/* ===================================================== */}
      {/* PROFESSIONAL AI INTELLIGENCE HEADER */}
      {/* ===================================================== */}
      <div className={`rounded-xl border-2 transition-all duration-300 shadow-md ${
        visibleInsights && visibleInsights.length > 0 
        ? "bg-[#0b1329] border-indigo-500/30 text-slate-200" 
        : "bg-[#0f172a] border-slate-800 text-slate-400"
      }`}>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-lg border ${visibleInsights && visibleInsights.length > 0 ? "bg-slate-950 border-indigo-500/40 text-indigo-400" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
              <BrainCircuit size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xs font-bold tracking-wider uppercase font-mono text-indigo-400">Heuristic Rule Engine</h3>
                {visibleInsights?.length > 0 && <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-sm font-bold font-mono animate-pulse">AUTOGEN_READY</span>}
              </div>
              <p className="text-xs mt-1.5 font-medium text-slate-300 leading-relaxed max-w-2xl">
                {visibleInsights && visibleInsights.length > 0 
                  ? "ML models have inferred semantic constraints based on column distribution and headers." 
                  : "Manual Constraint Definition: Specify deterministic logic for cross-field validation."}
              </p>
              <AIInsightCard
                title="Validation Reasoning"
                explanation={validationExplanation}
                loading={loadingExplanations}
                error={explanationsError}
                cacheUsed={explanationsCacheUsed}
                onRefresh={fetchAIExplanations}
              />
            </div>
          </div>
          {visibleInsights && visibleInsights.length > 0 && (
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-900 rounded-md text-indigo-400 text-[10px] font-bold uppercase tracking-wider font-mono">
              <Bot size={13} /> {visibleInsights.length} suggestions found
            </div>
          )}
        </div>
      </div>

      {/* ===================================================== */}
      {/* VALIDATION WORKBENCH CONTAINER */}
      {/* ===================================================== */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* WORKBENCH TOP CONTROL BAR */}
        <div className="px-6 py-4 border-b border-slate-900 bg-[#0b1329]/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-slate-200 uppercase tracking-wide font-mono">Validation Workbench</h2>
                <InfoTooltip {...getTooltipContent('validationWorkbench')} iconSize={12} className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono font-bold bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-slate-500 uppercase">Module: Logic_Guard_v3</span>
                <ChevronRight size={12} className="text-slate-700" />
                <p className="text-[11px] text-slate-500 font-medium">Declarative constraint enforcement for structural integrity</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSuggestRules}
              data-testid="validation-suggest-btn"
              disabled={suggestionLoading}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-100 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all shadow-md active:scale-95 font-mono"
            >
              <BrainCircuit size={14} /> {suggestionLoading ? 'Suggesting...' : 'Suggest Rules'}
            </button>
            <InfoTooltip {...getTooltipContent('suggestRules')} iconSize={12} className="h-5 w-5 self-center" />
            <button
              onClick={() => onAddSimpleRule()}
              data-testid="validation-add-btn"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all shadow-md active:scale-95 font-mono"
            >
              <Plus size={14} /> Add Logic
            </button>
            <InfoTooltip {...getTooltipContent('addLogic')} iconSize={12} className="h-5 w-5 self-center" />
          </div>
        </div>

        {suggestionError && (
          <div className="mx-6 mt-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {suggestionError}
          </div>
        )}

        {/* ===================================================== */}
        {/* AI SUGGESTIONS SECTION (THICK OUTLINE ADDED) */}
        {/* ===================================================== */}
        {visibleInsights && visibleInsights.length > 0 && rules.length === 0 && (
          <div className="m-6 p-5 border-2 border-slate-800/80 bg-slate-950/10 rounded-xl">
             <div className="flex items-center gap-2 mb-4">
                <Bot size={14} className="text-indigo-400" />
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Statistical Recommendations</h4>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {visibleInsights.slice(0, 4).map((suggestion, i) => (
                <div key={i} className="flex flex-col justify-between p-4 rounded-lg bg-[#0b1329]/40 border border-slate-900 hover:border-slate-700 transition-colors shadow-sm">
                    <div className="mb-3.5">
                      <p className="font-mono text-xs font-semibold text-slate-200 truncate">{suggestion.column || 'Cross-field rule'}</p>
                      <p className="font-mono text-[11px] text-indigo-400 font-bold mt-1.5">{suggestion.rule_text || `${suggestion.operator || ''} ${suggestion.value ?? ''}`}</p>
                      {suggestion.confidence !== undefined && (
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">Confidence {suggestion.confidence}%</p>
                      )}
                    </div>
                    {suggestion.operator ? (
                      <button 
                        onClick={() => onAddSimpleRule(suggestion)}
                        className="w-full text-[10px] font-bold uppercase tracking-wide text-indigo-400 bg-indigo-500/5 hover:bg-indigo-600 border border-indigo-500/10 hover:text-white py-1.5 rounded-md transition-colors font-mono"
                      >
                        Apply Suggestion
                      </button>
                    ) : (
                      <div className="w-full rounded-md border border-slate-800 bg-slate-950/60 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 font-mono">
                        Guidance Only
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RULES LIST / ACTIVE CONSTRAINTS */}
        <div className="p-6 space-y-4 bg-slate-950/5">
          <div className="flex items-center gap-2">
              <Settings size={13} className="text-slate-500" />
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Active Constraints</h4>
          </div>
          
          {rules.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/20">
              <Database size={32} className="mx-auto text-slate-700 mb-3" />
              <p className="text-xs text-slate-500 font-bold font-mono uppercase tracking-wider">Buffer Empty: Awaiting Input Definition</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-center gap-3 p-3 bg-[#0b1329]/40 border border-slate-900 rounded-lg group hover:border-slate-700 transition-colors shadow-sm">
                  <div className="w-full md:flex-1">
                    <select
                      value={rule.column}
                      onChange={(e) => onUpdateRule(idx, "column", e.target.value)}
                      className="w-full h-9 border border-slate-700 bg-slate-950 hover:border-slate-600 rounded-md px-3 text-[11px] font-bold font-mono text-slate-300 focus:border-indigo-500 outline-none transition-colors cursor-pointer"
                    >
                      <option value="" className="text-slate-500">-- FEATURE --</option>
                      {schema.map((col, i) => <option key={i} value={col.column} className="text-slate-200 bg-slate-950">{col.column}</option>)}
                    </select>
                  </div>
                  <div className="w-full md:w-24">
                    <select
                      value={rule.operator}
                      onChange={(e) => onUpdateRule(idx, "operator", e.target.value)}
                      className="w-full h-9 border border-slate-700 bg-slate-950 hover:border-slate-600 rounded-md px-3 text-[11px] font-bold font-mono text-center text-indigo-400 focus:border-indigo-500 outline-none transition-colors cursor-pointer"
                    >
                      {["==", "!=", ">", "<", ">=", "<=", "is_null", "not_null"].map(op => <option key={op} value={op} className="text-slate-200 bg-slate-950">{op}</option>)}
                    </select>
                  </div>
                  <div className="w-full md:w-48">
                    <input
                      type="text"
                      placeholder="Scalar Value"
                      value={rule.value}
                      onChange={(e) => onUpdateRule(idx, "value", e.target.value)}
                      className="w-full h-9 border border-slate-700 bg-slate-950 hover:border-slate-600 rounded-md px-3 text-[11px] font-mono text-slate-200 focus:border-indigo-500 outline-none placeholder:text-slate-600 shadow-inner"
                    />
                  </div>
                  <div className="w-full md:w-40">
                    <select
                      value={rule.severity}
                      onChange={(e) => onUpdateRule(idx, "severity", e.target.value)}
                      className={`w-full h-9 border border-slate-700 bg-slate-950 hover:border-slate-600 rounded-md px-3 text-[10px] font-bold uppercase tracking-wide focus:border-indigo-500 outline-none transition-colors cursor-pointer ${
                        rule.severity === 'high' ? 'text-rose-400' : rule.severity === 'medium' ? 'text-amber-400' : 'text-indigo-400'
                      }`}
                    >
                      <option value="low" className="text-indigo-400 bg-slate-950">P3: Minor</option>
                      <option value="medium" className="text-amber-400 bg-slate-950">P2: Moderate</option>
                      <option value="high" className="text-rose-400 bg-slate-950">P1: Critical</option>
                    </select>
                  </div>
                  <button onClick={() => onRemoveRule(idx)} className="p-1.5 text-slate-500 hover:text-rose-400 border border-transparent hover:border-slate-800 hover:bg-slate-950 rounded transition-all opacity-0 group-hover:opacity-100 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onRunValidation}
            data-testid="validation-run-btn"
            disabled={loading || rules.length === 0}
            className="mt-6 w-full flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-950 disabled:text-slate-600 border border-transparent disabled:border-slate-900 text-white px-6 py-3.5 rounded-md font-bold uppercase text-[11px] tracking-wide shadow-md active:scale-95 transition-all font-mono"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
            {loading ? "COMPUTING DEVIANTS..." : "COMMIT BATCH VALIDATION"}
          </button>
          <InfoTooltip {...getTooltipContent('runValidation')} iconSize={12} className="h-5 w-5" />
        </div>

        {/* RESULTS SECTION (DASHBOARD STYLE) */}
        {result && (
          <div className="p-6 border-t border-slate-900 bg-slate-950/5 space-y-6 animate-in fade-in duration-300">
            
            {/* SCORECARD GRID (THICK LINE FRAME IMPLEMENTED) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-transparent rounded-none border-0">
              {[
                { label: 'Active Rules', val: result.total_rules, color: 'text-slate-200', icon: ShieldCheck },
                { label: 'Violations', val: result.total_violations, color: 'text-rose-400', icon: AlertCircle },
                { label: 'P1 Critical', val: result.severity_counts?.high ?? 0, color: 'text-rose-400', icon: Info },
                { label: 'P2 Moderate', val: result.severity_counts?.medium ?? 0, color: 'text-amber-400', icon: Info },
              ].map((card, i) => (
                <div key={i} className="bg-[#0b1329]/60 border-2 border-slate-800 rounded-xl p-4 shadow-md relative overflow-hidden group">
                  <div className="flex items-center gap-2 mb-2 text-slate-500 uppercase text-[9px] font-bold tracking-wider font-mono">
                    <card.icon size={12} className="text-slate-600" /> {card.label}
                  </div>
                  <h3 className={`text-2xl font-mono font-bold ${card.color}`}>{(card.val ?? 0).toLocaleString()}</h3>
                </div>
              ))}
            </div>

            {/* EXCEPTION LOG TABLE WITH THICK HIGHLIGHT OUTLINES */}
            <div className="rounded-xl border-2 border-slate-800 bg-[#0f172a] overflow-hidden shadow-md">
              <div className="px-4 py-3 border-b border-slate-900 bg-[#0b1329]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <TableIcon size={14} className="text-slate-500" />
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">Exception Log Output</h5>
                  <InfoTooltip {...getTooltipContent('exceptionLog')} iconSize={12} className="h-4 w-4" />
                </div>
              </div>

              {violations.length === 0 ? (
                <div className="p-16 text-center bg-slate-950/20">
                  <div className="inline-flex p-4 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4 shadow-md shadow-emerald-500/5">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-slate-200 font-bold font-mono uppercase tracking-wider text-sm"> Dataset Consistent</h4>
                  <p className="text-xs text-slate-500 mt-1.5 font-sans leading-relaxed">All observations comply with defined declarative logic.</p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0f172a] text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-900">
                        <th className="px-5 py-3 font-bold border-r border-slate-900 last:border-0">Index</th>
                        <th className="px-5 py-3 font-bold border-r border-slate-900 last:border-0">Variable</th>
                        <th className="px-5 py-3 font-bold border-r border-slate-900 last:border-0">Scalar Value</th>
                        <th className="px-5 py-3 font-bold border-r border-slate-900 last:border-0">Constraint Expectation</th>
                        <th className="px-5 py-3 font-bold last:border-0">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-[11px] divide-y divide-slate-900/40 bg-[#0f172a]/20">
                      {violations.map((v, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40 transition-colors border-b border-slate-900/40">
                          <td className="px-5 py-2.5 font-mono text-slate-500 italic border-r border-slate-900/40 last:border-0">#{v.row_index}</td>
                          <td className="px-5 py-2.5 font-mono font-bold text-slate-300 border-r border-slate-900/40 last:border-0">{v.column || v.target_column}</td>
                          <td className="px-5 py-2.5 font-mono text-rose-400 font-bold border-r border-slate-900/40 last:border-0">{String(v.actual_value)}</td>
                          <td className="px-5 py-2.5 font-mono text-indigo-400 bg-indigo-500/5 italic text-[10px] border-r border-slate-900/40 last:border-0">{v.expected}</td>
                          <td className="px-5 py-2.5 last:border-0">
                            <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold font-mono tracking-wide ${
                              v.severity === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {v.severity === 'high' ? 'P1' : 'P2'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-5 py-2.5 bg-[#0b1329] border-t border-slate-900 flex justify-center">
                    <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest italic">Showing head of deviant observations...</p>
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

const Settings = ({ size, className }) => <Database size={size} className={className} />; // Placeholder icon override tracking

export default RuleValidationPanel;
