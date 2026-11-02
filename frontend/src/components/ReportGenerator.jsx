import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  ExternalLink,
  AlertTriangle,
  Database,
  Columns,
  Droplets,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { collectReportData, formatReportForDisplay } from '../utils/reportGenerator';

export default function ReportGenerator({
  datasetData,
  aiResults,
  validationResult,
  estimationResult,
  outlierResult,
  duplicateResult,
  analyticsViewData,
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleGenerateReport = () => {
    setLoading(true);
    try {
      const payload = collectReportData({
        datasetData,
        aiResults,
        validationResult,
        estimationResult,
        outlierResult,
        duplicateResult,
        analyticsViewData,
      });
      setReportData(formatReportForDisplay(payload));
      setIsOpen(true);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToReportCenter = () => {
    setIsOpen(false);
    navigate('/report-center');
  };

  const downloadAsJSON = () => {
    if (!reportData) return;
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    element.href = URL.createObjectURL(file);
    const datasetName = reportData?.metadata?.datasetName || 'dataset';
    element.download = `DAET_Report_${datasetName}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const downloadAsCSV = () => {
    if (!reportData) return;

    let csv = 'DAET Analysis Report\n';
    csv += `Generated: ${reportData.formattedAt}\n`;
    csv += `Dataset: ${reportData.metadata?.datasetName || 'Unknown'}\n\n`;

    // Summary
    csv += 'DATASET OVERVIEW\n';
    csv += `Total Records,${reportData.summary?.datasetOverview?.totalRecords ?? 0}\n`;
    csv += `Total Variables,${reportData.summary?.datasetOverview?.totalVariables ?? 0}\n`;
    csv += `Columns with Missing Values,${reportData.summary?.datasetOverview?.columnsWithMissingValues ?? 0}\n\n`;

    // Key Concerns
    csv += 'KEY CONCERNS\n';
    (reportData.summary?.keyConcerns || []).forEach((concern) => {
      csv += `"${concern.severity}","${concern.issue}","${concern.details}"\n`;
    });
    csv += '\n';

    // AI Recommendations
    csv += 'AI RECOMMENDATIONS\n';
    (reportData.ai?.recommendations || []).forEach((rec) => {
      csv += `"${rec.column}","${rec.suggestions?.missing_value_method || 'review'}","${rec.statistics?.missing_percent || 0}%"\n`;
    });

    const element = document.createElement('a');
    const file = new Blob([csv], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    const datasetName = reportData?.metadata?.datasetName || 'dataset';
    element.download = `DAET_Report_${datasetName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const totalRecords = Number(reportData?.summary?.datasetOverview?.totalRecords ?? 0);
  const totalVariables = Number(reportData?.summary?.datasetOverview?.totalVariables ?? 0);
  const missingCols = Number(reportData?.summary?.datasetOverview?.columnsWithMissingValues ?? 0);
  const aiCount = Number(reportData?.ai?.totalRecommendations ?? reportData?.summary?.recommendedActions?.length ?? 0);

  const statusItems = [
    {
      id: 'cleaning',
      label: 'Cleaning Analysis',
      active: !!reportData?.summary?.qualityStatus?.cleaningApplied,
    },
    {
      id: 'outliers',
      label: 'Outlier Detection',
      active: !!reportData?.summary?.qualityStatus?.outliersDetected,
    },
    {
      id: 'duplicates',
      label: 'Duplicate Detection',
      active: !!reportData?.summary?.qualityStatus?.duplicatesRemoved,
    },
    {
      id: 'validation',
      label: 'Validation Analysis',
      active: !!reportData?.summary?.qualityStatus?.validationRun,
    },
    {
      id: 'ai',
      label: 'AI Recommendations',
      active: !!reportData?.summary?.qualityStatus?.aiRecommendationsGenerated,
    },
  ];

  return (
    <>
      {/* Report Button in Navbar */}
      <button
        type="button"
        onClick={handleGenerateReport}
        disabled={loading || !datasetData}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs transition hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
        title="Generate snapshot analysis summary"
      >
        {loading ? (
          <>
            <Loader2 size={12} className="animate-spin text-indigo-500" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <FileText size={12} className="text-slate-500 dark:text-slate-400" />
            <span>Report</span>
          </>
        )}
      </button>

      {/* Enterprise Executive Report Modal via Portal */}
      {isOpen && reportData && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[86vh] overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* 1. Modal Sticky Header */}
            <div className="shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shadow-2xs">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                      Analysis Report Brief
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-semibold">
                      Live Snapshot
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
                    {reportData.metadata?.datasetName || 'Dataset'} • {reportData.formattedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleNavigateToReportCenter}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer shadow-2xs"
                  title="Open full interactive report builder"
                >
                  <span>Full Report Center</span>
                  <ExternalLink size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  title="Close report modal (Esc)"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* 2. Scrollable Body Content */}
            <div className="overflow-y-auto custom-scrollbar flex-1 p-6 space-y-6 font-sans text-slate-800 dark:text-slate-200">
              
              {/* Dataset Overview Metrics Scorecard */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Database size={13} className="text-indigo-500" />
                    <span>Dataset Macro Metrics</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">Validated In-Memory</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Database size={12} />
                      <p className="text-[10px] uppercase font-bold tracking-wider">Observations</p>
                    </div>
                    <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                      {Number.isFinite(totalRecords) ? totalRecords.toLocaleString() : '0'}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Columns size={12} />
                      <p className="text-[10px] uppercase font-bold tracking-wider">Variables</p>
                    </div>
                    <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                      {totalVariables}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Droplets size={12} />
                      <p className="text-[10px] uppercase font-bold tracking-wider">Void Columns</p>
                    </div>
                    <p className={`text-lg font-mono font-bold ${missingCols > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {missingCols}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Sparkles size={12} />
                      <p className="text-[10px] uppercase font-bold tracking-wider">AI Actions</p>
                    </div>
                    <p className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {aiCount}
                    </p>
                  </div>
                </div>
              </section>

              {/* Analysis Status Matrix */}
              <section>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  <span>Pipeline Audit Status</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {statusItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-colors ${
                        item.active
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-slate-900 dark:text-slate-100'
                          : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-medium">
                        {item.active ? (
                          <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Clock size={15} className="text-slate-400 shrink-0" />
                        )}
                        <span>{item.label}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        item.active
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {item.active ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Key Concerns Warning Callout */}
              {reportData.summary?.keyConcerns && reportData.summary.keyConcerns.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-amber-500" />
                    <span>Quality Flags & Concerns</span>
                  </h4>
                  <div className="space-y-2">
                    {reportData.summary.keyConcerns.map((concern, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                          concern.severity === 'high'
                            ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                        }`}
                      >
                        <AlertTriangle size={16} className={concern.severity === 'high' ? 'text-rose-500 shrink-0 mt-0.5' : 'text-amber-500 shrink-0 mt-0.5'} />
                        <div className="space-y-0.5">
                          <p className="font-bold tracking-tight">{concern.issue}</p>
                          <p className="text-[11px] opacity-80 font-mono">{concern.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Top Recommended Actions */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Sparkles size={13} className="text-indigo-500" />
                    <span>Top Recommended Actions</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">Heuristic Engine</span>
                </div>

                {reportData.summary?.recommendedActions && reportData.summary.recommendedActions.length > 0 ? (
                  <div className="space-y-2">
                    {reportData.summary.recommendedActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 truncate">
                            {action.column}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                            Suggested strategy: <strong className="font-semibold text-slate-900 dark:text-white capitalize">{action.recommendation}</strong>
                          </span>
                        </div>
                        <span className="shrink-0 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          Ready
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-center text-xs text-slate-400 font-mono">
                    No urgent column remediation actions flagged by heuristic engine.
                  </div>
                )}
              </section>
            </div>

            {/* 3. Modal Sticky Footer Toolbar */}
            <div className="shrink-0 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleNavigateToReportCenter}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer shadow-2xs"
              >
                <span>Navigate to Full Report Center</span>
                <ArrowRight size={13} />
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={downloadAsJSON}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition text-xs font-semibold shadow-2xs cursor-pointer active:scale-[0.98]"
                  title="Download telemetry payload as JSON"
                >
                  <Download size={13} className="text-slate-500 dark:text-slate-400" />
                  <span>Download JSON</span>
                </button>

                <button
                  type="button"
                  onClick={downloadAsCSV}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition text-xs font-semibold shadow-2xs cursor-pointer active:scale-[0.98]"
                  title="Download structured executive summary as CSV"
                >
                  <Download size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
