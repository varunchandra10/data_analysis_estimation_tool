import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Copy,
  Fingerprint,
  Upload,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";

import { useDataset } from "../hooks/useDataset";
import { useAIContext } from "../context/AIContext";
import DuplicatePanel from "./DuplicatePanel";
import { StatusBadge, FilterButtonGroup } from "./common";

/**
 * DuplicateContainer
 * Orchestrator component for the Survey Record Deduplication module.
 * Provides strategy selection (detect vs purge vs retain-first),
 * automated initial scanning, error boundaries, and empty-state fallbacks.
 */
const DuplicateContainer = () => {
  const navigate = useNavigate();
  const { datasetData, deduplicate, loading, duplicateResult } = useDataset();
  const { aiResults, setAIResults, setAIResultsSourcePath } = useAIContext();

  const [strategy, setStrategy] = useState("detect"); // 'detect' | 'remove' | 'keep_first'
  const [result, setResult] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Sync result from global context
  useEffect(() => {
    if (duplicateResult && !result) {
      setResult(duplicateResult);
    }
  }, [duplicateResult]);

  // Auto-run initial detection scan on mount if no previous result exists
  useEffect(() => {
    if (datasetData?.metadata?.file_path && !result && !duplicateResult && !loading) {
      handleProcess("detect");
    }
  }, [datasetData]);

  const handleProcess = async (overrideStrategy) => {
    const activeStrategy = overrideStrategy || strategy;
    setErrorMessage("");
    setSuccessToast(null);

    try {
      const response = await deduplicate(activeStrategy);
      setResult(response);

      // Invalidate AI cache since dataset structure may have updated
      if (setAIResults) setAIResults(null);
      if (setAIResultsSourcePath) setAIResultsSourcePath(null);

      const dupeCount = response?.duplicate_count ?? 0;
      const purgedCount = response?.removed_count ?? 0;

      if (activeStrategy === "detect") {
        setSuccessToast(
          `Redundancy scan complete: ${dupeCount} duplicate row${dupeCount === 1 ? "" : "s"} identified across the primary key matrix.`
        );
      } else {
        setSuccessToast(
          `Deduplication executed: ${purgedCount} redundant row${purgedCount === 1 ? "" : "s"} purged from active dataset buffer.`
        );
      }

      setTimeout(() => setSuccessToast(null), 6000);
    } catch (err) {
      console.error("Deduplication error:", err);
      setErrorMessage(
        err.response?.data?.detail || err.message || "Failed to process record deduplication."
      );
    }
  };

  const strategyOptions = [
    { id: "detect", label: "Scan & Flag (Non-destructive)", icon: Fingerprint },
    { id: "remove", label: "Purge All Duplicates", icon: Copy },
    { id: "keep_first", label: "Retain First Occurrence", icon: CheckCircle2 },
  ];

  // 1. Empty State Fallback (No active dataset loaded in session)
  if (!datasetData) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center font-sans animate-in fade-in duration-200">
        <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center shadow-sm">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/60 mb-5 shadow-2xs">
            <Copy size={28} />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Deduplication & Entropy Context
            </span>
            <StatusBadge variant="amber" size="xs">
              Buffer Empty
            </StatusBadge>
          </div>

          <h2 className="text-xl font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
            No Survey Dataset Active
          </h2>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Upload a survey microdata file (CSV, XLSX) or select an existing version to scan for
            row-level redundancies, exact record overlaps, and primary key collisions.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/ingestion")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-mono transition-all cursor-pointer shadow-sm"
            >
              <Upload size={14} />
              <span>Ingest Survey Data</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <Database size={14} className="text-slate-400" />
              <span>Go to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Strategy Selector Strip */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-2 pb-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              <SlidersHorizontal size={14} />
            </div>
            <div>
              <span className="text-xs font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
                Deduplication Strategy Mode:
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 hidden sm:inline">
                Choose whether to audit entropy non-destructively or purge redundant entries:
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FilterButtonGroup
              options={strategyOptions}
              activeId={strategy}
              onChange={(newStrat) => {
                setStrategy(newStrat);
                handleProcess(newStrat);
              }}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Execution Feedback Toasts */}
      {successToast && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pb-3">
          <div className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-mono shadow-xs animate-in slide-in-from-top-2 duration-200">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <div className="flex-1 font-semibold">{successToast}</div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pb-3">
          <div className="flex items-center justify-between gap-2.5 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs font-mono shadow-xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-rose-500 hover:text-rose-800 font-bold px-2 py-0.5 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Presentation View */}
      <DuplicatePanel
        data={datasetData}
        aiInsights={aiResults?.duplicate_insights || []}
        strategy={strategy}
        setStrategy={setStrategy}
        result={result}
        loading={loading}
        onProcess={() => handleProcess()}
      />
    </div>
  );
};

export default DuplicateContainer;
