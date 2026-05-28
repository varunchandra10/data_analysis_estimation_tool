import React, { useState, useEffect } from "react";
import { useDataset } from "../../../hooks/useDataset";
import { useAIContext } from "../../../context/AIContext";
import OutlierPanel from "./OutlierPanel";

const OutlierContainer = () => {
  const { 
    datasetData, 
    runOutliersDetection, 
    commitOutliersFilter, 
    loading: datasetLoading,
    outlierResult
  } = useDataset();

  const { outlierInsights, setAIResults, setAIResultsSourcePath } = useAIContext();

  const [selectedColumn, setSelectedColumn] = useState("");
  const [method, setMethod] = useState("iqr");
  const [result, setResult] = useState(null);
  const [detectLoading, setDetectLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  // Sync with context outlierResult if needed, or manage locally
  useEffect(() => {
    if (outlierResult && !result) {
      setResult(outlierResult);
    }
  }, [outlierResult]);

  const handleDetect = async () => {
    if (!selectedColumn) return;
    setDetectLoading(true);
    try {
      const response = await runOutliersDetection(selectedColumn, method);
      setResult({
        ...response,
        column: selectedColumn,
        method: method
      });
    } catch (err) {
      console.error("Outlier detection error:", err);
    } finally {
      setDetectLoading(false);
    }
  };

  const handleApply = async () => {
    if (!result) return;
    setApplyLoading(true);
    try {
      const response = await commitOutliersFilter(selectedColumn, method);
      setResult((r) => ({
        ...r,
        applied: true,
        file_path: response.file_path,
        preview: response.preview,
        applied_preview: undefined
      }));
      // Reset AI recommendations since dataset has changed
      setAIResults(null);
      setAIResultsSourcePath(null);
    } catch (err) {
      console.error("Applying outlier filter error:", err);
    } finally {
      setApplyLoading(false);
    }
  };

  if (!datasetData) return null;

  return (
    <OutlierPanel
      data={datasetData}
      aiInsights={outlierInsights}
      selectedColumn={selectedColumn}
      setSelectedColumn={setSelectedColumn}
      method={method}
      setMethod={setMethod}
      result={result}
      loading={detectLoading}
      applyLoading={applyLoading}
      onDetect={handleDetect}
      onApply={handleApply}
    />
  );
};

export default OutlierContainer;
