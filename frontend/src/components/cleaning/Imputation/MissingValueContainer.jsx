import { useDataset } from "../../../hooks/useDataset";
import { useAIContext } from "../../../context/AIContext";
import MissingValuePanel from "./MissingValuePanel";
import { Database, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MissingValueContainer = () => {
  const { datasetData, cleanMissing, loading } = useDataset();
  const { missingValueInsights, setAIResults, setAIResultsSourcePath } = useAIContext();
  const navigate = useNavigate();

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

  // Standby Empty State if no active dataset buffer is hydrated
  if (!datasetData) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm max-w-xl mx-auto my-12 font-sans">
        <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mb-4 shadow-2xs">
          <Database size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono uppercase tracking-tight">
          No Active Dataset Buffer
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
          Ingest a survey microdata file or select an active record in Dataset Explorer to run null value audits and neural imputation.
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
    <MissingValuePanel
      data={datasetData}
      aiInsights={missingValueInsights}
      onApplyCleaning={handleApplyCleaning}
      loading={loading}
    />
  );
};

export default MissingValueContainer;
