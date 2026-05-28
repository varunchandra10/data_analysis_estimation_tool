import React, { useState, useEffect } from 'react';
import { useDataset } from '../../../hooks/useDataset';
import { useValidation } from '../../../hooks/useValidation';
import { useAI } from '../../../hooks/useAI';
import RuleValidationPanel from './ValidationPanel';

export default function ValidationContainer() {
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

  useEffect(() => {
    setSuggestions([]);
    setSuggestionError('');
    setRules([]);
  }, [datasetData?.metadata?.file_path]);

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

  return (
    <RuleValidationPanel
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
      onRunValidation={handleRunValidation}
      onSuggestRules={handleSuggestRules}
    />
  );
}
