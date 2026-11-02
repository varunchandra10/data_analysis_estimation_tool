import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../common';

/**
 * Reusable PipelineActionStrip component
 * Displays one-click actionable pipeline buttons guiding users through
 * Null Imputation, Anomaly Detection, Deduplication, Logic Rules, and IPF Weighting.
 */
export default function PipelineActionStrip({
  columnsWithNullsCount = 0,
  onNavigate = null,
  className = '',
}) {
  const defaultNavigate = useNavigate();
  const navigate = onNavigate || defaultNavigate;

  return (
    <div
      className={`p-3.5 bg-gradient-to-r from-indigo-50/60 via-slate-50 to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 rounded-xl border border-indigo-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-md bg-indigo-600 text-white shadow-xs">
          <Sparkles size={14} />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Recommended Next Pipeline Actions:
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 hidden md:inline">
            Step through cleaning, validation, and survey calibration:
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {columnsWithNullsCount > 0 && (
          <button
            onClick={() => navigate('/null-analysis')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
          >
            <span>Impute Missing</span>
            <StatusBadge variant="amber" size="xs">
              {columnsWithNullsCount}
            </StatusBadge>
            <ChevronRight size={13} />
          </button>
        )}

        <button
          onClick={() => navigate('/anomaly-detection')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer"
        >
          <span>Detect Outliers</span>
          <ChevronRight size={13} className="text-slate-400" />
        </button>

        <button
          onClick={() => navigate('/deduping')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer"
        >
          <span>Deduplicate</span>
          <ChevronRight size={13} className="text-slate-400" />
        </button>

        <button
          onClick={() => navigate('/logic-validation')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer"
        >
          <span>Rule Validation</span>
          <ChevronRight size={13} className="text-slate-400" />
        </button>

        <button
          onClick={() => navigate('/weighting-engine')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer"
        >
          <span>IPF Weighting</span>
          <ChevronRight size={13} className="text-indigo-500" />
        </button>
      </div>
    </div>
  );
}

