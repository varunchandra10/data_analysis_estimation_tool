import { useState, useEffect, useCallback } from 'react';
import {
  BrainCircuit,
  Sparkles,
  RefreshCw,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Database,
  Hash,
  Type,
  X,
  Trash2,
  Loader2,
  Sliders,
  Check,
} from 'lucide-react';
import { useDatasetContext } from '../context/DatasetContext';
import { useAIContext } from '../context/AIContext';
import { StatusBadge, MetricStatCard, SearchInput } from './common';

/**
 * Format raw strategy machine codes into professional typography
 */
const formatStrategyName = (strategy) => {
  if (!strategy) return 'None Required';
  const clean = String(strategy).toLowerCase().replace(/_/g, ' ');
  if (clean === 'most frequent') return 'Mode (Most Frequent)';
  if (clean === 'mean') return 'Mean Imputation';
  if (clean === 'median') return 'Median Imputation';
  if (clean === 'zscore') return 'Z-Score (3σ)';
  if (clean === 'iqr') return 'IQR Filtering';
  if (clean === 'review') return 'Manual Audit';
  if (clean === 'none') return 'None Required';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

const getConfVariant = (conf) => {
  const score = Number(conf) || 0;
  if (score >= 80) return 'emerald';
  if (score >= 70) return 'indigo';
  return 'amber';
};

/**
 * AIEngine Component
 * High-density interactive AI Engine Intelligence Console.
 * Displays Gemini telemetry, heuristic diagnostics, real-time column recommendation blueprints,
 * statistical explanations, and AI cache management.
 */
export default function AIEngine({
  isOpen = null,
  onClose = null,
  inline = false,
  className = '',
}) {
  const { datasetData } = useDatasetContext();
  const {
    aiResults,
    aiResultsSourcePath,
    aiLoading,
    aiError,
    fetchAIRecommendations,
    explanations,
    loadingExplanations,
    explanationsCacheUsed,
    fetchAIExplanations,
    resetAIExplanations,
  } = useAIContext();

  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' | 'explanations' | 'telemetry'
  const [filterSearch, setFilterSearch] = useState('');
  const [cacheFlushed, setCacheFlushed] = useState(false);
  const [localDrawerOpen, setLocalDrawerOpen] = useState(false);

  // Auto-fetch recommendations in background when new dataset is loaded
  useEffect(() => {
    if (!datasetData?.metadata?.file_path) return;
    if (aiResultsSourcePath && aiResultsSourcePath === datasetData.metadata.file_path) {
      return;
    }

    fetchAIRecommendations(
      datasetData.metadata.file_path,
      datasetData.schema,
      datasetData.metadata
    ).catch((err) => console.error('AIEngine background recommendation error:', err));
  }, [datasetData, aiResultsSourcePath, fetchAIRecommendations]);

  // Determine modal visibility
  const isModalControlled = isOpen !== null;
  const isVisible = isModalControlled ? isOpen : localDrawerOpen;
  const handleClose = useCallback(() => {
    if (isModalControlled && onClose) {
      onClose();
    } else {
      setLocalDrawerOpen(false);
    }
  }, [isModalControlled, onClose]);

  // Handle Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleClose]);

  const handleRefresh = async () => {
    if (!datasetData?.metadata?.file_path) return;
    try {
      await fetchAIRecommendations(
        datasetData.metadata.file_path,
        datasetData.schema,
        datasetData.metadata
      );
      if (fetchAIExplanations) {
        await fetchAIExplanations();
      }
    } catch (err) {
      console.error('Failed to refresh AI Engine:', err);
    }
  };

  const handleFlushCache = () => {
    if (resetAIExplanations) resetAIExplanations();
    setCacheFlushed(true);
    setTimeout(() => setCacheFlushed(false), 2000);
  };

  const recommendations = aiResults?.recommendations || [];
  const filename =
    datasetData?.metadata?.filename ||
    datasetData?.metadata?.dataset_name ||
    'dataset.csv';
  const totalColumns = datasetData?.schema?.length || recommendations.length || 0;

  // Filter recommendations by search
  const filteredRecs = recommendations.filter((r) => {
    if (!filterSearch.trim()) return true;
    const q = filterSearch.toLowerCase();
    return (
      r.column?.toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q) ||
      r.recommendations?.missing_value_method?.toLowerCase().includes(q) ||
      r.recommendations?.outlier_method?.toLowerCase().includes(q)
    );
  });

  // Calculate summary metrics
  const missingImputations = recommendations.filter(
    (r) => r.recommendations?.missing_value_method && r.recommendations?.missing_value_method !== 'none'
  ).length;

  // Inner Content of the AI Engine Console
  const renderEngineContent = () => (
    <div className="flex flex-col h-full font-sans text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900">
      
      {/* 1. Header & Engine Telemetry Bar */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shadow-2xs shrink-0">
            <BrainCircuit size={20} className={aiLoading ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Survey Intelligence Core
              </span>
              <StatusBadge
                variant={aiLoading ? 'amber' : 'emerald'}
                size="xs"
                dot
                pulse={aiLoading}
              >
                {aiLoading ? 'Analyzing' : 'Engine Ready'}
              </StatusBadge>
              <StatusBadge variant="indigo" size="xs">
                Gemini 2.0 Flash
              </StatusBadge>
            </div>
            <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5 tracking-tight">
              DAET AI Advisory Engine
            </h3>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={aiLoading || !datasetData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white shadow-xs transition-all cursor-pointer font-mono"
            title="Re-run deep heuristic & LLM diagnostics"
          >
            <RefreshCw size={12} className={aiLoading ? 'animate-spin' : ''} />
            <span>{aiLoading ? 'Synthesizing...' : 'Re-Run Analysis'}</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close AI Console"
            title="Close modal (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 2. Macro Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
        <MetricStatCard
          label="Active Target"
          value={filename.length > 15 ? `${filename.slice(0, 12)}...` : filename}
          icon={Database}
          subValue={`${totalColumns} Columns`}
          tooltip={`Ingested file: ${filename}`}
          truncateValue={true}
        />
        <MetricStatCard
          label="AI Blueprints"
          value={recommendations.length}
          icon={Sparkles}
          subValue="Synthesized Rules"
          badge="Ready"
          badgeVariant="emerald"
        />
        <MetricStatCard
          label="Imputations"
          value={missingImputations}
          icon={Sliders}
          subValue="Missing Handlers"
          badge="Heuristic"
          badgeVariant="blue"
        />
        <MetricStatCard
          label="Cache State"
          value={explanationsCacheUsed ? 'HIT' : 'LIVE'}
          icon={Cpu}
          subValue={explanationsCacheUsed ? 'In-Memory Cache' : 'Active Stream'}
          badge={explanationsCacheUsed ? 'Optimized' : 'Fresh'}
          badgeVariant={explanationsCacheUsed ? 'emerald' : 'slate'}
        />
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs font-semibold font-mono shrink-0">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('recommendations')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'recommendations'
                ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles size={13} />
            <span>Column Blueprint</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800">
              {recommendations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('explanations')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'explanations'
                ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={13} />
            <span>Survey Rationale</span>
            {loadingExplanations && <Loader2 size={11} className="animate-spin text-indigo-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'telemetry'
                ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Cpu size={13} />
            <span>Engine & Cache</span>
          </button>
        </div>

        {activeTab === 'recommendations' && (
          <SearchInput
            value={filterSearch}
            onChange={setFilterSearch}
            placeholder="Filter attributes..."
            className="w-48 py-1"
          />
        )}
      </div>

      {/* 4. Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50/20 dark:bg-slate-950/20">
        
        {/* TAB 1: COLUMN RECOMMENDATIONS BLUEPRINT */}
        {activeTab === 'recommendations' && (
          <div className="space-y-3">
            {aiError && (
              <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle size={15} className="text-rose-500 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {filteredRecs.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRecs.map((item, idx) => {
                  const rec = item.recommendations || {};
                  const isNumeric = item.type === 'Numerical';
                  const warnings = rec.warnings || [];
                  const confidence = rec.confidence ?? 85;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all font-mono"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 ${isNumeric ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'}`}>
                            {isNumeric ? <Hash size={13} /> : <Type size={13} />}
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={item.column}>
                            {item.column}
                          </span>
                        </div>
                        <StatusBadge variant={getConfVariant(confidence)} size="xs">
                          {confidence}% Conf
                        </StatusBadge>
                      </div>

                      {/* Rule Key-Values */}
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-400 font-sans">Imputation:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatStrategyName(rec.missing_value_method || (isNumeric ? 'mean' : 'most_frequent'))}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-400 font-sans">Outlier Rule:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatStrategyName(rec.outlier_method || (isNumeric ? 'zscore' : 'review'))}
                          </span>
                        </div>
                      </div>

                      {/* Warnings / Flags */}
                      {warnings.length > 0 && (
                        <div className="mt-2.5 text-[11px] font-sans font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg p-2 flex items-center gap-1.5">
                          <AlertTriangle size={13} className="shrink-0 text-amber-600 dark:text-amber-400" />
                          <span className="truncate">{warnings[0]}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                {aiLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-indigo-500" />
                    <span>Gemini AI is processing survey attributes...</span>
                  </div>
                ) : (
                  <span>No attributes match "{filterSearch}".</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SURVEY RATIONALE & STATISTICAL EXPLANATIONS */}
        {activeTab === 'explanations' && (
          <div className="space-y-4">
            {loadingExplanations ? (
              <div className="text-center py-12 text-slate-500 text-xs font-mono flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
                <span>Generating analytical explanations via Gemini 2.0...</span>
              </div>
            ) : explanations ? (
              <div className="space-y-3 font-sans">
                {/* Executive Summary Card */}
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 font-mono font-bold text-indigo-700 dark:text-indigo-400 uppercase text-[11px] mb-2">
                    <Sparkles size={14} />
                    <span>Executive AI Advisory</span>
                  </div>
                  <p>
                    {typeof explanations === 'string'
                      ? explanations
                      : explanations.executive_summary ||
                        explanations.explanation ||
                        'The loaded dataset has been analyzed. Statistical properties, distributions, and sampling balance align with standard survey calibration guidelines.'}
                  </p>
                </div>

                {/* Sub-Rationals if structured object */}
                {typeof explanations === 'object' && explanations.sections && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(explanations.sections).map(([title, content], sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      >
                        <h4 className="font-mono font-bold uppercase text-[11px] text-slate-900 dark:text-white mb-1">
                          {title.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                          {String(content)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                <p>No explanatory narrative generated yet.</p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold cursor-pointer hover:bg-indigo-700 transition"
                >
                  Generate Survey Narrative
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ENGINE TELEMETRY & CACHE CONTROLS */}
        {activeTab === 'telemetry' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Engine Architecture & Deployment
              </h4>
              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Primary Inference Model:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Google Gemini 2.0 Flash</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Secondary Fallback:</span>
                  <span className="font-bold">Heuristic Statistical Rules Engine</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Caching Strategy:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">SHA-256 Multi-Tier Signature Cache</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Context Source Path:</span>
                  <span className="font-bold truncate max-w-xs">{aiResultsSourcePath || 'None'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-900 dark:text-white">
                  Flush AI Intelligence Cache
                </h4>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Forces subsequent requests to recalculate without using cached responses.
                </p>
              </div>

              <button
                type="button"
                onClick={handleFlushCache}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-100 transition-colors cursor-pointer"
              >
                {cacheFlushed ? (
                  <>
                    <Check size={12} className="text-emerald-500" />
                    <span>Flushed!</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={12} />
                    <span>Clear Cache</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  // If rendered as an inline container on a page
  if (inline) {
    return (
      <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden ${className}`}>
        {renderEngineContent()}
      </div>
    );
  }

  // If controlled as a modal dialog
  if (isModalControlled) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={handleClose}
        />
        <div className="relative w-full max-w-4xl h-[85vh] max-h-[800px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
          {renderEngineContent()}
        </div>
      </div>
    );
  }

  // Persistent floating assistant trigger pill when mounted without modal props
  return (
    <>
      <button
        type="button"
        onClick={() => setLocalDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer font-mono text-xs font-bold"
        title="Open AI Engine Intelligence Console"
      >
        <BrainCircuit size={15} className={aiLoading ? 'animate-pulse text-indigo-500' : ''} />
        <span>AI Engine</span>
        <span
          className={`w-2 h-2 rounded-full ${
            aiLoading ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'
          }`}
        />
      </button>

      {localDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setLocalDrawerOpen(false)}
          />
          <div className="relative w-full max-w-4xl h-[85vh] max-h-[800px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            {renderEngineContent()}
          </div>
        </div>
      )}
    </>
  );
}
