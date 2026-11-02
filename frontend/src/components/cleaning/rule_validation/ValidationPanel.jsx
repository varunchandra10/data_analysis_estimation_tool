import { 
  ShieldCheck, 
  BrainCircuit, 
  Plus, 
  Play, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Bot, 
  Loader2, 
  Table as TableIcon, 
  Database,
  Sparkles,
  Sliders,
  RotateCcw,
  Check,
  Info
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
  onClearRules,
  onApplyAllSuggestions,
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
  const normalizedSchema = Array.isArray(schema) ? schema : [];
  const visibleInsights = suggestions.length > 0 ? suggestions : aiInsights;
  const violations = Array.isArray(result?.violations) ? result.violations : [];

  // Calculate compliance statistics
  const totalRows = metadata?.row_count || metadata?.rows || 100;
  const totalViolations = result?.total_violations ?? 0;
  const complianceRate = totalViolations === 0 
    ? "100.0" 
    : Math.max(0, 100 - ((totalViolations / (totalRows * Math.max(1, rules.length))) * 100)).toFixed(1);

  return (
    <div className="space-y-6 antialiased text-slate-800 dark:text-slate-200 font-sans max-w-[1600px] mx-auto pb-12 px-4 sm:px-6">
      
      {/* ===================================================== */}
      {/* 1. ANALYTICAL CONTEXT HEADER */}
      {/* ===================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
              <ShieldCheck size={13} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Schema & Integrity Governance
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              Logic & Rule Constraint Validation
            </h2>
            <InfoTooltip {...getTooltipContent('validationWorkbench')} iconSize={14} className="h-5 w-5" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Enforce declarative domain constraints, multi-field assertions, and data integrity logic for:{" "}
            <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
              {metadata?.filename || 'Active Dataset Buffer'}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide font-mono">Rule Buffer</p>
            <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
              {rules.length} Defined Constraint{rules.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <Sliders size={16} className="text-indigo-500 dark:text-indigo-400" />
        </div>
      </div>

      {/* ===================================================== */}
      {/* 2. HEURISTIC RULE ENGINE & AI INTELLIGENCE HEADER */}
      {/* ===================================================== */}
      <div className={`rounded-2xl border transition-all duration-300 shadow-xs ${
        visibleInsights && visibleInsights.length > 0 
          ? "bg-indigo-50/40 dark:bg-slate-900/90 border-indigo-200 dark:border-indigo-500/30" 
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      }`}>
        <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-xl border shrink-0 ${
              visibleInsights && visibleInsights.length > 0 
                ? "bg-white dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400" 
                : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500"
            }`}>
              <BrainCircuit size={20} strokeWidth={2} />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xs font-bold tracking-wider uppercase font-mono text-indigo-600 dark:text-indigo-400">
                  Heuristic Rule Engine
                </h3>
                {visibleInsights?.length > 0 && (
                  <span className="bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[9px] px-2 py-0.5 rounded-md font-bold font-mono animate-pulse">
                    AUTOGEN_READY ({visibleInsights.length} SUGGESTIONS)
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {visibleInsights && visibleInsights.length > 0 
                  ? "AI models have inferred semantic domain constraints based on column data types, distribution quantiles, and standard survey ranges." 
                  : "Manual Constraint Definition: Specify deterministic logic and scalar bounds for continuous validation."}
              </p>
              <AIInsightCard
                title="Validation Reasoning & Rationale"
                explanation={validationExplanation}
                loading={loadingExplanations}
                error={explanationsError}
                cacheUsed={explanationsCacheUsed}
                onRefresh={fetchAIExplanations}
              />
            </div>
          </div>

          {visibleInsights && visibleInsights.length > 0 && (
            <div className="shrink-0 flex items-center gap-2 self-start lg:self-center">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider font-mono shadow-2xs">
                <Bot size={13} /> {visibleInsights.length} AI Rules Inferred
              </span>
            </div>
          )}
        </div>

        {/* AI Recommendations Shelf */}
        {visibleInsights && visibleInsights.length > 0 && (
          <div className="px-5 pb-5 pt-2 border-t border-indigo-100 dark:border-slate-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-indigo-500" />
                <h4 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
                  Synthesized Statistical Constraints
                </h4>
              </div>
              {onApplyAllSuggestions && visibleInsights.some(s => s.operator && s.column) && (
                <button
                  type="button"
                  onClick={() => onApplyAllSuggestions(visibleInsights)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all cursor-pointer font-mono"
                >
                  <Check size={12} />
                  <span>Apply All AI Suggestions</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {visibleInsights.slice(0, 4).map((suggestion, i) => (
                <div 
                  key={i} 
                  className="flex flex-col justify-between p-3.5 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors shadow-2xs"
                >
                  <div className="mb-3">
                    <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {suggestion.column || 'Cross-field rule'}
                    </p>
                    <p className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                      {suggestion.rule_text || `${suggestion.operator || ''} ${suggestion.value ?? ''}`}
                    </p>
                    {suggestion.confidence !== undefined && (
                      <span className="inline-block mt-1 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Confidence {suggestion.confidence}%
                      </span>
                    )}
                  </div>
                  {suggestion.operator ? (
                    <button 
                      type="button"
                      onClick={() => onAddSimpleRule(suggestion)}
                      className="w-full text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white border border-indigo-200 dark:border-indigo-500/20 py-1.5 rounded-lg transition-colors font-mono cursor-pointer text-center"
                    >
                      + Add Rule
                    </button>
                  ) : (
                    <div className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 font-mono">
                      Guidance Only
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================== */}
      {/* 3. VALIDATION WORKBENCH CONTAINER */}
      {/* ===================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
        
        {/* WORKBENCH TOP CONTROL BAR */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-xl">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wide font-mono">
                  Validation Workbench
                </h2>
                <InfoTooltip {...getTooltipContent('validationWorkbench')} iconSize={12} className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 uppercase">
                  Module: Logic_Guard_v3
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Declarative constraint enforcement for structural integrity
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSuggestRules}
              data-testid="validation-suggest-btn"
              disabled={suggestionLoading}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-2xs active:scale-95 font-mono cursor-pointer"
            >
              <BrainCircuit size={13} className="text-indigo-500" />
              <span>{suggestionLoading ? 'Suggesting...' : 'Suggest Rules'}</span>
            </button>
            <InfoTooltip {...getTooltipContent('suggestRules')} iconSize={12} className="h-5 w-5 self-center" />

            <button
              type="button"
              onClick={() => onAddSimpleRule()}
              data-testid="validation-add-btn"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-sm active:scale-95 font-mono cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Logic</span>
            </button>
            <InfoTooltip {...getTooltipContent('addLogic')} iconSize={12} className="h-5 w-5 self-center" />

            {rules.length > 0 && onClearRules && (
              <button
                type="button"
                onClick={onClearRules}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 text-slate-500 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-2xs font-mono cursor-pointer"
                title="Clear all rules"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {suggestionError && (
          <div className="mx-6 mt-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-300">
            {suggestionError}
          </div>
        )}

        {/* ACTIVE CONSTRAINTS BUILDER */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders size={13} className="text-indigo-500" />
              <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                Active Constraints ({rules.length})
              </h4>
            </div>
            {rules.length > 0 && (
              <span className="text-[10px] font-mono text-slate-400">
                Evaluating against {totalRows} microdata records
              </span>
            )}
          </div>
          
          {rules.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
              <Database size={32} className="mx-auto text-slate-400 dark:text-slate-600 mb-3" />
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold font-mono uppercase tracking-wider">
                Buffer Empty: No Active Constraints
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                Click <span className="font-semibold text-indigo-600 dark:text-indigo-400">Add Logic</span> to build custom validation rules, or click <span className="font-semibold text-indigo-600 dark:text-indigo-400">Suggest Rules</span> to auto-generate constraints from AI heuristics.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header Labels for Desktop */}
              <div className="hidden md:flex items-center gap-3 px-3 text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                <div className="flex-1">Variable / Feature</div>
                <div className="w-28 text-center">Condition</div>
                <div className="w-48">Expected Value</div>
                <div className="w-40">Severity</div>
                <div className="w-9 text-center">Action</div>
              </div>

              {rules.map((rule, idx) => {
                const isNullCheck = rule.operator === "is_null" || rule.operator === "not_null";
                return (
                  <div 
                    key={idx} 
                    className="flex flex-col md:flex-row items-center gap-3 p-3 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs"
                  >
                    {/* Feature Select */}
                    <div className="w-full md:flex-1">
                      <select
                        value={rule.column}
                        onChange={(e) => onUpdateRule(idx, "column", e.target.value)}
                        className="w-full h-9 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg px-3 text-xs font-bold font-mono text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors cursor-pointer shadow-2xs"
                      >
                        <option value="" className="text-slate-400">-- SELECT FEATURE --</option>
                        {normalizedSchema.map((col, i) => (
                          <option key={i} value={col.column} className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-950">
                            {col.column}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Operator Select */}
                    <div className="w-full md:w-28">
                      <select
                        value={rule.operator}
                        onChange={(e) => onUpdateRule(idx, "operator", e.target.value)}
                        className="w-full h-9 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg px-2.5 text-xs font-bold font-mono text-center text-indigo-600 dark:text-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors cursor-pointer shadow-2xs"
                      >
                        <option value=">=">&gt;= (GTE)</option>
                        <option value="<=">&lt;= (LTE)</option>
                        <option value=">">&gt; (GT)</option>
                        <option value="<">&lt; (LT)</option>
                        <option value="==">== (Equal)</option>
                        <option value="!=">!= (Not Equal)</option>
                        <option value="is_null">is_null</option>
                        <option value="not_null">not_null</option>
                      </select>
                    </div>

                    {/* Value Input */}
                    <div className="w-full md:w-48">
                      <input
                        type="text"
                        placeholder={isNullCheck ? "Null check (no scalar)" : "Scalar Value"}
                        value={isNullCheck ? "" : rule.value}
                        disabled={isNullCheck}
                        onChange={(e) => onUpdateRule(idx, "value", e.target.value)}
                        className="w-full h-9 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-600 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400 rounded-lg px-3 text-xs font-mono text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden placeholder:text-slate-400 shadow-2xs"
                      />
                    </div>

                    {/* Severity Select */}
                    <div className="w-full md:w-40">
                      <select
                        value={rule.severity}
                        onChange={(e) => onUpdateRule(idx, "severity", e.target.value)}
                        className={`w-full h-9 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg px-3 text-[11px] font-bold uppercase tracking-wide focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors cursor-pointer shadow-2xs ${
                          rule.severity === 'high' 
                            ? 'text-rose-600 dark:text-rose-400 font-bold' 
                            : rule.severity === 'medium' 
                            ? 'text-amber-600 dark:text-amber-400 font-bold' 
                            : 'text-indigo-600 dark:text-indigo-400 font-bold'
                        }`}
                      >
                        <option value="low" className="text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-950">P3: Minor</option>
                        <option value="medium" className="text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-950">P2: Moderate</option>
                        <option value="high" className="text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-950">P1: Critical</option>
                      </select>
                    </div>

                    {/* Delete Trigger */}
                    <button 
                      type="button"
                      onClick={() => onRemoveRule(idx)} 
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all shrink-0 cursor-pointer"
                      title="Remove rule"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Run Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onRunValidation}
              data-testid="validation-run-btn"
              disabled={loading || rules.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-950 disabled:text-slate-400 dark:disabled:text-slate-600 border border-transparent disabled:border-slate-200 dark:disabled:border-slate-800 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider shadow-sm active:scale-95 transition-all font-mono cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" size={15} /> : <Play size={15} />}
              <span>{loading ? "EVALUATING CONSTRAINTS..." : "COMMIT BATCH VALIDATION"}</span>
            </button>
            <div className="flex justify-end mt-1">
              <InfoTooltip {...getTooltipContent('runValidation')} iconSize={12} className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* ===================================================== */}
        {/* 4. RESULTS SECTION (SCORECARDS & EXCEPTION LOG) */}
        {/* ===================================================== */}
        {result && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 space-y-6 animate-in fade-in duration-300">
            
            {/* SCORECARD GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  label: 'Rules Evaluated', 
                  val: result.total_rules ?? rules.length, 
                  color: 'text-slate-800 dark:text-slate-200', 
                  icon: ShieldCheck,
                  sub: 'Declarative checks'
                },
                { 
                  label: 'Total Violations', 
                  val: result.total_violations ?? 0, 
                  color: (result.total_violations ?? 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400', 
                  icon: AlertCircle,
                  sub: `${complianceRate}% compliant`
                },
                { 
                  label: 'P1 Critical', 
                  val: result.severity_counts?.high ?? 0, 
                  color: (result.severity_counts?.high ?? 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200', 
                  icon: AlertCircle,
                  sub: 'High severity flags'
                },
                { 
                  label: 'P2 Moderate', 
                  val: result.severity_counts?.medium ?? 0, 
                  color: (result.severity_counts?.medium ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200', 
                  icon: Info,
                  sub: 'Medium severity flags'
                },
              ].map((card, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider font-mono">
                      {card.label}
                    </span>
                    <card.icon size={14} className="text-slate-400" />
                  </div>
                  <h3 className={`text-2xl font-mono font-bold ${card.color}`}>
                    {(card.val ?? 0).toLocaleString()}
                  </h3>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    {card.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* EXCEPTION LOG TABLE */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <TableIcon size={15} className="text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                      Exception Log Output
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Detailed telemetry of individual row constraint violations
                    </p>
                  </div>
                  <InfoTooltip {...getTooltipContent('exceptionLog')} iconSize={12} className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  {violations.length} Flagged Incident{violations.length !== 1 ? 's' : ''}
                </span>
              </div>

              {violations.length === 0 ? (
                <div className="p-16 text-center bg-slate-50/30 dark:bg-slate-950/20">
                  <div className="inline-flex p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 mb-3 shadow-2xs">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="text-slate-900 dark:text-white font-bold font-mono uppercase tracking-wider text-sm">
                    Dataset 100% Consistent
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans leading-relaxed max-w-sm mx-auto">
                    All surveyed microdata records comply with the active declarative constraint specifications.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="px-5 py-3 font-bold border-r border-slate-200 dark:border-slate-800 last:border-0">Row Index</th>
                        <th className="px-5 py-3 font-bold border-r border-slate-200 dark:border-slate-800 last:border-0">Variable</th>
                        <th className="px-5 py-3 font-bold border-r border-slate-200 dark:border-slate-800 last:border-0">Observed Value</th>
                        <th className="px-5 py-3 font-bold border-r border-slate-200 dark:border-slate-800 last:border-0">Constraint Expectation</th>
                        <th className="px-5 py-3 font-bold last:border-0">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-[11px] divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                      {violations.map((v, idx) => (
                        <tr key={idx} className="hover:bg-rose-50/30 dark:hover:bg-rose-950/15 transition-colors">
                          <td className="px-5 py-2.5 font-mono text-slate-500 italic border-r border-slate-200 dark:border-slate-800 last:border-0">
                            #{v.row_index}
                          </td>
                          <td className="px-5 py-2.5 font-mono font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 last:border-0">
                            {v.column || v.target_column}
                          </td>
                          <td className="px-5 py-2.5 font-mono text-rose-600 dark:text-rose-400 font-bold border-r border-slate-200 dark:border-slate-800 last:border-0">
                            {String(v.actual_value)}
                          </td>
                          <td className="px-5 py-2.5 font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 italic text-[11px] border-r border-slate-200 dark:border-slate-800 last:border-0">
                            {v.expected}
                          </td>
                          <td className="px-5 py-2.5 last:border-0">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold font-mono tracking-wide border ${
                              v.severity === 'high' 
                                ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' 
                                : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                            }`}>
                              {v.severity === 'high' ? 'P1 Critical' : 'P2 Moderate'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex justify-center">
                    <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                      Showing head of deviant observations
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

export default RuleValidationPanel;
