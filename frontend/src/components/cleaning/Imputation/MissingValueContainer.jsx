import React from "react";
import { useDataset } from "../../../hooks/useDataset";
import { useAIContext } from "../../../context/AIContext";
import MissingValuePanel from "./MissingValuePanel";

const MissingValueContainer = () => {
  const { datasetData, cleanMissing, loading } = useDataset();
  const { missingValueInsights, setAIResults, setAIResultsSourcePath } = useAIContext();

  const handleApplyCleaning = async (strategies) => {
    try {
      await cleanMissing(strategies);
      // Reset AI recommendations since dataset has changed
      setAIResults(null);
      setAIResultsSourcePath(null);
    } catch (err) {
      console.error("Failed to clean missing values:", err);
    }
  };

  if (!datasetData) return null;

  return (
    <MissingValuePanel
      data={datasetData}
      aiInsights={missingValueInsights}
      onApplyCleaning={handleApplyCleaning}
      loading={loading}
    />
  );
};

export default MissingValueContainer;
