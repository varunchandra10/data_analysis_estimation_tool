import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Database, ArrowRight } from "lucide-react";
import { useDataset } from "../../../hooks/useDataset";
import { useAIContext } from "../../../context/AIContext";
import OutlierPanel from "./OutlierPanel";

const OutlierContainer = () => {
  const navigate = useNavigate();
  const { 
    datasetData, 
    runOutliersDetection, 
    commitOutliersFilter, 
    loading: datasetLoading,
    outlierResult
  } = useDataset();

  const { outlierInsights, setAIResults, setAIResultsSourcePath } = useAIContext();

  const [localColumn, setLocalColumn] = useState("");
  const [method, setMethod] = useState("iqr");
  const [localResult, setLocalResult] = useState(null);
  const [detectLoading, setDetectLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  // Derive active result from local run or context
  const result = localResult ?? outlierResult;

  // Extract numerical columns safely
  const numericColumns = useMemo(() => {
    if (!datasetData?.schema || !Array.isArray(datasetData.schema)) return [];
    return datasetData.schema.filter(
      (col) => col.type === "Numerical" || col.type === "numeric" || col.type === "Integer" || col.type === "Float"
    );
  }, [datasetData]);

  // Derive preferred initial column (AI recommended or first numeric)
  const defaultColumn = useMemo(() => {
    if (numericColumns.length === 0) return "";
    const aiRec = outlierInsights?.find(i => numericColumns.some(nc => nc.column === i.column));
    return aiRec ? aiRec.column : numericColumns[0].column;
  }, [numericColumns, outlierInsights]);

  const selectedColumn = localColumn || defaultColumn;

  const handleDetect = async (colToUse, methodToUse) => {
    const col = colToUse || selectedColumn;
    const m = methodToUse || method;
    if (!col) return;
    setDetectLoading(true);
    try {
      const response = await runOutliersDetection(col, m);
      setLocalResult({
        ...response,
        column: col,
        method: m
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
      setLocalResult((r) => ({
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

  // Standby Empty State if no active dataset buffer is hydrated
  if (!datasetData) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm max-w-xl mx-auto my-12 font-sans">
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 mb-4 shadow-2xs">
          <Database size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono uppercase tracking-tight">
          No Active Dataset Buffer
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm leading-relaxed">
          Ingest a microdata dataset or select an active file in Dataset Explorer to run outlier vector analysis and dispersion scans.
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
    <OutlierPanel
      data={datasetData}
      numericColumns={numericColumns}
      aiInsights={outlierInsights}
      selectedColumn={selectedColumn}
      setSelectedColumn={setLocalColumn}
      method={method}
      setMethod={setMethod}
      result={result}
      loading={detectLoading || datasetLoading}
      applyLoading={applyLoading}
      onDetect={handleDetect}
      onApply={handleApply}
    />
  );
};

export default OutlierContainer;
