import React, { useState } from 'react';
import { BrainCircuit, Sparkles, ChevronDown, ChevronUp, AlertCircle, RefreshCw, Cpu, Award } from 'lucide-react';
import InfoTooltip from '../UI/InfoTooltip';
import { getTooltipContent } from '../../utils/tooltipContent';

export default function AIInsightCard({
  title = "AI Insight",
  explanation,
  loading = false,
  error = null,
  cacheUsed = false,
  onRefresh = null,
  emptyMessage = "AI explanation unavailable.",
  confidence = "High",
  recommendation = "",
  reasoning = ""
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const normalizedExplanation =
    typeof explanation === 'string' && explanation.toLowerCase().startsWith('ai explanation unavailable')
      ? ''
      : explanation;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-indigo-500/20 bg-indigo-950/15 transition-all duration-300 shadow-sm shadow-indigo-950/10">
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex items-center justify-between px-4 py-3 bg-indigo-950/45 cursor-pointer select-none hover:bg-indigo-950/60 transition-colors border-b border-indigo-500/10"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-indigo-500/10 rounded text-indigo-400">
            <BrainCircuit size={13} className="animate-pulse" />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-wider text-indigo-300 uppercase">
            {title}
          </span>
          {cacheUsed && !loading && !error && (
            <span className="text-[8px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1 py-0.5 rounded uppercase">
              Cached
            </span>
          )}
          {confidence && !loading && !error && (
            <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded uppercase">
              <Award size={8} /> Confidence: {confidence}
              <InfoTooltip {...getTooltipContent('aiConfidence')} iconSize={10} className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && !loading && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              title="Refresh Explanation"
              className="p-1 text-indigo-400 hover:text-indigo-300 transition-colors hover:rotate-180 duration-500"
            >
              <RefreshCw size={10} />
            </button>
          )}
          {onRefresh && !loading && <InfoTooltip {...getTooltipContent('refreshExplanation')} iconSize={10} className="h-4 w-4" />}
          {isExpanded ? (
            <ChevronUp size={12} className="text-indigo-400" />
          ) : (
            <ChevronDown size={12} className="text-indigo-400" />
          )}
        </div>
      </div>

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="p-4 text-xs leading-relaxed text-slate-300 bg-slate-950/40 border-t border-indigo-500/5 animate-in fade-in duration-200">
          {loading ? (
            <div className="flex items-center gap-2.5 text-indigo-400 py-1 font-mono text-[10px]">
              <RefreshCw size={12} className="animate-spin text-indigo-400" />
              <span>Analyzing recommendations...</span>
            </div>
          ) : error ? (
            <div className="flex items-start gap-2 text-rose-400 py-1 font-mono text-[10px]">
              <AlertCircle size={12} className="shrink-0 mt-0.5" />
              <div>
                <span>{error}</span>
                {onRefresh && (
                  <button 
                    onClick={onRefresh} 
                    className="ml-2 underline hover:text-rose-300 transition-colors"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          ) : normalizedExplanation ? (
            <div className="space-y-3 font-sans text-slate-300 text-[11px] leading-relaxed">
              <div className="flex items-start gap-2.5">
                <Sparkles size={13} className="text-indigo-400 mt-0.5 shrink-0" />
                <p className="font-medium text-slate-200">
                  {normalizedExplanation}
                </p>
              </div>
              
              {/* Optional dynamic recommendation layout support */}
              {recommendation && (
                <div className="border-t border-indigo-500/10 pt-2 mt-2 flex items-start gap-2">
                  <Cpu size={12} className="text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">AI Recommendation</span>
                      <InfoTooltip {...getTooltipContent('aiRecommendation')} iconSize={10} className="h-4 w-4" />
                    </div>
                    <p className="text-slate-300 mt-0.5">{recommendation}</p>
                  </div>
                </div>
              )}
              
              {reasoning && (
                <div className="border-t border-indigo-500/10 pt-2 flex items-start gap-2">
                  <BrainCircuit size={12} className="text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">AI Reasoning</span>
                      <InfoTooltip {...getTooltipContent('aiReasoning')} iconSize={10} className="h-4 w-4" />
                    </div>
                    <p className="text-slate-400 mt-0.5">{reasoning}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2 text-slate-500 py-1 font-mono text-[10px]">
              <AlertCircle size={12} className="shrink-0 mt-0.5" />
              <span>{emptyMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
