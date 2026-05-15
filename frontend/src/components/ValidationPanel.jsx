import React, { useState } from "react";
import axios from "axios";
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
  Database,
  ArrowRight
} from "lucide-react";

const RuleValidationPanel = ({ data, aiInsights = [] }) => {
  if (!data) return null;

  const { metadata, schema } = data;
  const [rules, setRules] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const addSimpleRule = (initialValues = {}) => {
    setRules(prev => ([
      ...prev,
      {
        type: "simple",
        column: initialValues.column || "",
        operator: initialValues.operator || ">=",
        value: initialValues.value || "",
        severity: initialValues.severity || "medium"
      }
    ]));
  };

  const removeRule = (index) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const updateRule = (index, field, value) => {
    const updated = [...rules];
    updated[index][field] = value;
    setRules(updated);
  };

  const runValidation = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/validation/run", {
        file_path: metadata.file_path,
        rules
      });
      setResult(response.data);
    } catch (err) {
      console.error("Validation Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 antialiased text-slate-900 dark:text-slate-100">
      {/* ===================================================== */}
      {/* PROFESSIONAL AI INTELLIGENCE HEADER */}
      {/* ===================================================== */}
      <div className={`rounded-xl border transition-all duration-300 ${
        aiInsights && aiInsights.length > 0 
        ? "bg-slate-900 border-slate-800 text-white shadow-2xl shadow-indigo-500/10" 
        : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500"
      }`}>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-lg border ${aiInsights && aiInsights.length > 0 ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}`}>
              <BrainCircuit size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight uppercase italic opacity-90">Heuristic Rule Engine</h3>
                {aiInsights?.length > 0 && <span className="bg-indigo-500 text-[10px] px-1.5 py-0.5 rounded font-black animate-pulse text-white">AUTOGEN_READY</span>}
              </div>
              <p className={`text-xs mt-0.5 font-medium ${aiInsights && aiInsights.length > 0 ? "text-slate-400" : "text-slate-500"}`}>
                {aiInsights && aiInsights.length > 0 
                  ? "ML models have inferred semantic constraints based on column distribution and headers." 
                  : "Manual Constraint Definition: Specify deterministic logic for cross-field validation."}
              </p>
            </div>
          </div>
          {aiInsights && aiInsights.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
              <Bot size={14} /> {aiInsights.length} suggestions found
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="p-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Validation Workbench</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 uppercase tracking-tighter">Module: Logic_Guard_v3</span>
                <ChevronRight size={12} className="text-slate-300" />
                <p className="text-xs text-slate-500 font-medium italic">Declarative constraint enforcement for structural integrity</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => addSimpleRule()}
            className="flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-md active:translate-y-px"
          >
            <Plus size={16} /> Add Logic
          </button>
        </div>

        {/* ===================================================== */}
        {/* AI SUGGESTIONS SECTION (REFINED) */}
        {/* ===================================================== */}
        {aiInsights && aiInsights.length > 0 && rules.length === 0 && (
          <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-2 mb-4">
                <Bot size={14} className="text-indigo-500" />
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Statistical Recommendations</h4>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {aiInsights.slice(0, 4).map((suggestion, i) => (
                <div key={i} className="flex flex-col justify-between p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-sm">
                    <div className="mb-3">
                      <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{suggestion.column}</p>
                      <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">{suggestion.operator} {suggestion.value}</p>
                    </div>
                    <button 
                      onClick={() => addSimpleRule(suggestion)}
                      className="w-full text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-600 hover:text-white py-2 rounded transition-all"
                    >
                      Apply Suggestion
                    </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RULES LIST (WORKBENCH STYLE) */}
        <div className="p-8 space-y-4">
          <div className="flex items-center gap-2 mb-2">
              <Settings size={14} className="text-slate-400" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Constraints</h4>
          </div>
          
          {rules.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
              <Database size={32} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Buffer Empty: Awaiting Input Definition</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
                  <div className="w-full md:flex-1">
                    <select
                      value={rule.column}
                      onChange={(e) => updateRule(idx, "column", e.target.value)}
                      className="w-full h-10 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded px-3 text-[11px] font-bold font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">-- FEATURE --</option>
                      {schema.map((col, i) => <option key={i} value={col.column}>{col.column}</option>)}
                    </select>
                  </div>
                  <div className="w-full md:w-24">
                    <select
                      value={rule.operator}
                      onChange={(e) => updateRule(idx, "operator", e.target.value)}
                      className="w-full h-10 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded px-3 text-[11px] font-black font-mono text-center focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      {["==", "!=", ">", "<", ">=", "<="].map(op => <option key={op} value={op}>{op}</option>)}
                    </select>
                  </div>
                  <div className="w-full md:w-48">
                    <input
                      type="text"
                      placeholder="Scalar Value"
                      value={rule.value}
                      onChange={(e) => updateRule(idx, "value", e.target.value)}
                      className="w-full h-10 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded px-3 text-[11px] font-mono focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-500"
                    />
                  </div>
                  <div className="w-full md:w-40">
                    <select
                      value={rule.severity}
                      onChange={(e) => updateRule(idx, "severity", e.target.value)}
                      className={`w-full h-10 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded px-3 text-[10px] font-black uppercase tracking-tighter focus:ring-1 focus:ring-indigo-500 outline-none ${
                        rule.severity === 'high' ? 'text-rose-500' : rule.severity === 'medium' ? 'text-amber-500' : 'text-indigo-500'
                      }`}
                    >
                      <option value="low">P3: Minor</option>
                      <option value="medium">P2: Moderate</option>
                      <option value="high">P1: Critical</option>
                    </select>
                  </div>
                  <button onClick={() => removeRule(idx)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={runValidation}
            disabled={loading || rules.length === 0}
            className="mt-10 w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white py-4 rounded-lg text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 transition-all active:translate-y-px"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
            {loading ? "Computing Deviants..." : "Commit Batch Validation"}
          </button>
        </div>

        {/* RESULTS SECTION (DASHBOARD STYLE) */}
        {result && (
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              {[
                { label: 'Active Rules', val: result.total_rules, color: 'text-slate-900 dark:text-white', icon: ShieldCheck },
                { label: 'Violations', val: result.total_violations, color: 'text-rose-600', icon: AlertCircle },
                { label: 'P1 Critical', val: result.severity_counts.high, color: 'text-rose-600', icon: Info },
                { label: 'P2 Moderate', val: result.severity_counts.medium, color: 'text-amber-600', icon: Info },
              ].map((card, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-6">
                  <div className="flex items-center gap-2 mb-2 text-slate-400 uppercase text-[9px] font-black tracking-widest">
                    <card.icon size={10} /> {card.label}
                  </div>
                  <h3 className={`text-2xl font-mono font-bold ${card.color}`}>{card.val.toLocaleString()}</h3>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TableIcon size={14} className="text-slate-400" />
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Exception Log Output</h3>
                </div>
              </div>

              {result.violations.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="inline-flex p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 mb-4 border border-emerald-100 dark:border-emerald-800/50">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-sm font-bold dark:text-white uppercase tracking-tight">Dataset Consistent</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">All observations comply with defined declarative logic.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[9px] font-bold tracking-widest border-b border-slate-200 dark:border-slate-800">
                        <th className="px-6 py-4 font-black">Index</th>
                        <th className="px-6 py-4 font-black">Variable</th>
                        <th className="px-6 py-4 font-black">Scalar Value</th>
                        <th className="px-6 py-4 font-black">Constraint Expectation</th>
                        <th className="px-6 py-4 font-black">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {result.violations.map((v, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="px-6 py-3 font-mono text-slate-400 italic">#{v.row_index}</td>
                          <td className="px-6 py-3 font-mono font-bold text-slate-800 dark:text-slate-100">{v.column || v.target_column}</td>
                          <td className="px-6 py-3 font-mono text-rose-500 font-bold">{String(v.actual_value)}</td>
                          <td className="px-6 py-3 font-mono text-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10 italic text-[10px]">{v.expected}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                              v.severity === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {v.severity === 'high' ? 'P1' : 'P2'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Showing head of deviant observations...</p>
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

const Settings = ({ size, className }) => <Database size={size} className={className} />; // Placeholder icon

export default RuleValidationPanel;