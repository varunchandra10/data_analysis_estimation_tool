import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useDataset } from '../../../hooks/useDataset';
import { useValidation } from '../../../hooks/useValidation';
import { useAI } from '../../../hooks/useAI';
import RuleValidationPanel from './ValidationPanel';

export default function ValidationContainer() {
  const navigate = useNavigate();
  const { datasetData } = useDataset();
  const {
    validationResult,
    runValidationRules,
    getSuggestedRules,
    loading,
    isSuggesting,
    error: validationError
  } = useValidation();
  const { validationInsights, fetchAIExplanations } = useAI();

  const [rules, setRules] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionError, setSuggestionError] = useState('');

  // Reset rules and suggestions when active dataset file changes
  const filePath = datasetData?.metadata?.file_path;
  const [prevFilePath, setPrevFilePath] = useState(filePath);
  if (filePath !== prevFilePath) {
    setPrevFilePath(filePath);
    setSuggestions([]);
    setSuggestionError('');
    setRules([]);
  }

  const addSimpleRule = (initialValues = {}) => {
    const defaultCol = datasetData?.schema?.[0]?.column || "";
    setRules(prev => ([
      ...prev,
      {
        type: "simple",
        column: initialValues.column || defaultCol,
        operator: initialValues.operator || ">=",
        value: initialValues.value !== undefined ? String(initialValues.value) : "",
        severity: initialValues.severity || "medium"
      }
    ]));
  };

  const removeRule = (index) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const updateRule = (index, field, value) => {
    setRules(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const clearAllRules = () => {
    setRules([]);
  };

  const applyAllSuggestions = (suggestionsList) => {
    const listToApply = suggestionsList || suggestions;
    const newRules = listToApply
      .filter(s => s.operator && s.column)
      .map(s => ({
        type: "simple",
        column: s.column,
        operator: s.operator,
        value: s.value !== undefined ? String(s.value) : "",
        severity: s.severity || "medium"
      }));

    if (newRules.length > 0) {
      setRules(prev => [...prev, ...newRules]);
    }
  };

  const handleRunValidation = async () => {
    try {
      const res = await runValidationRules(rules);
      if (res) {
        await fetchAIExplanations({
          validation_summary: {
            column: 'dataset',
            rule_type: 'dsl_rules',
            total_violations: res.failed_rules || res.total_violations || 0
          }
        });
      }
    } catch (err) {
      console.error("Validation Run Error:", err);
    }
  };

  const handleSuggestRules = async () => {
    setSuggestionError('');
    try {
      const suggested = await getSuggestedRules();
      setSuggestions(suggested);
    } catch (err) {
      setSuggestionError(err.message || 'Failed to suggest validation rules');
    }
  };

  // Standby Empty State if no active dataset buffer is hydrated
  if (!datasetData) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm max-w-xl mx-auto my-12 font-sans">
        <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mb-4 shadow-2xs">
          <ShieldCheck size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono uppercase tracking-tight">
          No Active Dataset Buffer
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm leading-relaxed">
          Ingest a microdata dataset or select an active file in Dataset Explorer to define deterministic logic and cross-field validation rules.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dataset-explorer')}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer font-mono"
        >
          <span>Open Dataset Explorer</span>
          <ArrowRight size={13} />
        </button>
      </div>
    );
  }

  return (
    <RuleValidationPanel
      key={filePath || 'empty'}
      data={datasetData}
      aiInsights={validationInsights || []}
      rules={rules}
      result={validationResult?.data || validationResult}
      loading={loading}
      suggestions={suggestions}
      suggestionLoading={isSuggesting}
      suggestionError={suggestionError || validationError}
      onAddSimpleRule={addSimpleRule}
      onRemoveRule={removeRule}
      onUpdateRule={updateRule}
      onClearRules={clearAllRules}
      onApplyAllSuggestions={applyAllSuggestions}
      onRunValidation={handleRunValidation}
      onSuggestRules={handleSuggestRules}
    />
  );
}
