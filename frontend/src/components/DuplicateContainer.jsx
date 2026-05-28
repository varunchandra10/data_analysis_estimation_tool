import React, { useState, useEffect } from "react";
import { useDataset } from "../hooks/useDataset";
import { useAIContext } from "../context/AIContext";
import DuplicatePanel from "./DuplicatePanel";

const DuplicateContainer = () => {
  const { datasetData, deduplicate, loading, duplicateResult } = useDataset();
  const { aiResults, setAIResults, setAIResultsSourcePath } = useAIContext();

  const [strategy, setStrategy] = useState("detect");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (duplicateResult && !result) {
      setResult(duplicateResult);
    }
  }, [duplicateResult]);

  const handleProcess = async () => {
    try {
      const response = await deduplicate(strategy);
      setResult(response);
      // Reset AI recommendations since dataset has changed
      setAIResults(null);
      setAIResultsSourcePath(null);
    } catch (err) {
      console.error("Deduplication error:", err);
    }
  };

  if (!datasetData) return null;

  return (
    <DuplicatePanel
      data={datasetData}
      aiInsights={aiResults?.duplicate_insights || []}
      strategy={strategy}
      setStrategy={setStrategy}
      result={result}
      loading={loading}
      onProcess={handleProcess}
    />
  );
};

export default DuplicateContainer;
