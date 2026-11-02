import { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  RefreshCw, 
  Cpu, 
  Award,
  Copy,
  Check,
  Zap,
  Bot
} from 'lucide-react';
import InfoTooltip from '../UI/InfoTooltip';
import { getTooltipContent } from '../../utils/tooltipContent';

// Helper: Lightweight formatter for bold markers and bullet lines
const renderFormattedExplanation = (text) => {
  if (!text || typeof text !== 'string') return null;

  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="space-y-2">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n').filter(Boolean);
        const isBulletList = lines.length > 1 && lines.every(line => /^\s*([•\-*]|\d+\.)\s+/.test(line));

        if (isBulletList) {
          return (
            <ul key={pIdx} className="space-y-1.5 list-none my-1.5 pl-0.5">
              {lines.map((line, lIdx) => {
                const cleaned = line.replace(/^\s*([•\-*]|\d+\.)\s+/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{parseBoldText(cleaned)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={pIdx} className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {parseBoldText(para)}
          </p>
        );
      })}
    </div>
  );
};

const parseBoldText = (str) => {
  if (!str.includes('**')) return str;
  const parts = str.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

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
  reasoning = "",
  model = "Gemini 2.0 Flash"
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const normalizedExplanation =
    typeof explanation === 'string' && explanation.toLowerCase().startsWith('ai explanation unavailable')
      ? ''
      : explanation;

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!normalizedExplanation && !recommendation && !reasoning) return;
    const fullText = [
      title ? `[${title}]` : '',
      normalizedExplanation,
      recommendation ? `Recommendation: ${recommendation}` : '',
      reasoning ? `Reasoning: ${reasoning}` : ''
    ].filter(Boolean).join('\n\n');

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfidenceStyle = (conf) => {
    const val = String(conf).toLowerCase();
    if (val.includes('high')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    }
    if (val.includes('med')) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    }
    if (val.includes('low')) {
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
    }
    return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
  };

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-indigo-200/90 dark:border-indigo-500/20 bg-white dark:bg-slate-900/95 shadow-xs transition-all duration-300">
      
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex items-center justify-between px-4 py-3 bg-indigo-50/70 hover:bg-indigo-100/60 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 cursor-pointer select-none transition-colors border-b border-indigo-100 dark:border-indigo-500/15"
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
            <BrainCircuit size={14} className={loading ? "animate-pulse" : ""} />
          </div>

          <span className="text-xs font-mono font-bold tracking-wider text-indigo-900 dark:text-indigo-300 uppercase truncate">
            {title}
          </span>

          {model && !loading && !error && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 px-1.5 py-0.5 rounded-md uppercase">
              <Bot size={10} /> {model}
            </span>
          )}

          {cacheUsed && !loading && !error && (
            <span className="text-[9px] font-mono font-bold bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 px-1.5 py-0.5 rounded-md uppercase">
              Cached
            </span>
          )}

          {confidence && !loading && !error && (
            <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold border px-1.5 py-0.5 rounded-md uppercase ${getConfidenceStyle(confidence)}`}>
              <Award size={9} /> {confidence}
              <InfoTooltip {...getTooltipContent('aiConfidence')} iconSize={10} className="h-3.5 w-3.5" />
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Copy Button */}
          {normalizedExplanation && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy explanation"
              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            </button>
          )}

          {/* Refresh Action */}
          {onRefresh && !loading && (
            <div className="flex items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
                title="Regenerate explanation"
                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hover:rotate-180 duration-500 cursor-pointer"
              >
                <RefreshCw size={13} />
              </button>
              <InfoTooltip {...getTooltipContent('refreshExplanation')} iconSize={10} className="h-4 w-4" />
            </div>
          )}

          {/* Expand/Collapse Toggle */}
          <div className="p-1 text-slate-400 dark:text-slate-500">
            {isExpanded ? (
              <ChevronUp size={14} className="text-indigo-600 dark:text-indigo-400" />
            ) : (
              <ChevronDown size={14} className="text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="p-4 bg-white dark:bg-slate-950/40 animate-in fade-in duration-200">
          
          {/* Loading Shimmer State */}
          {loading ? (
            <div className="space-y-3 py-1 animate-pulse">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-semibold">
                <RefreshCw size={13} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                <span>Synthesizing neural rationales with {model}...</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-indigo-100/60 dark:bg-indigo-950/40 rounded-full w-5/6" />
                <div className="h-3 bg-indigo-100/40 dark:bg-indigo-950/30 rounded-full w-4/6" />
              </div>
            </div>
          ) : error ? (
            <div className="flex items-start gap-2.5 text-rose-600 dark:text-rose-400 py-1 font-mono text-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <div className="space-y-1">
                <span className="font-semibold">{error}</span>
                {onRefresh && (
                  <button 
                    type="button"
                    onClick={onRefresh} 
                    className="ml-2 text-xs font-bold underline hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    Retry Analysis
                  </button>
                )}
              </div>
            </div>
          ) : normalizedExplanation ? (
            <div className="space-y-3">
              
              {/* Primary Formatted Explanation Body */}
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                  <Sparkles size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  {renderFormattedExplanation(normalizedExplanation)}
                </div>
              </div>
              
              {/* Optional Structured Recommendation */}
              {recommendation && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-3 flex items-start gap-2.5 bg-indigo-50/40 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100/70 dark:border-indigo-900/40">
                  <Cpu size={14} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-indigo-900 dark:text-indigo-300 font-mono tracking-wider">
                        Actionable Recommendation
                      </span>
                      <InfoTooltip {...getTooltipContent('aiRecommendation')} iconSize={10} className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                      {recommendation}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Optional Formal Reasoning */}
              {reasoning && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-start gap-2.5 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Zap size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 font-mono tracking-wider">
                        Statistical Rationale
                      </span>
                      <InfoTooltip {...getTooltipContent('aiReasoning')} iconSize={10} className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {reasoning}
                    </p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex items-center justify-between py-1 text-slate-400 text-xs font-mono">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0 text-slate-400" />
                <span>{emptyMessage}</span>
              </div>
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <Sparkles size={11} />
                  <span>Generate AI Insight</span>
                </button>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
