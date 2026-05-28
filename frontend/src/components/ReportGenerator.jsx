import React, { useState } from 'react';
import { Download, FileText, X, Loader2 } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const totalRecords = Number(reportData?.summary?.datasetOverview?.totalRecords ?? 0);

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

  const downloadAsJSON = () => {
    if (!reportData) return;
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = `DAET_Report_${reportData.metadata.datasetName}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadAsCSV = () => {
    if (!reportData) return;
    
    let csv = 'DAET Analysis Report\n';
    csv += `Generated: ${reportData.formattedAt}\n`;
    csv += `Dataset: ${reportData.metadata.datasetName}\n\n`;

    // Summary
    csv += 'DATASET OVERVIEW\n';
    csv += `Total Records,${reportData.summary.datasetOverview.totalRecords}\n`;
    csv += `Total Variables,${reportData.summary.datasetOverview.totalVariables}\n`;
    csv += `Columns with Missing Values,${reportData.summary.datasetOverview.columnsWithMissingValues}\n\n`;

    // Key Concerns
    csv += 'KEY CONCERNS\n';
    reportData.summary.keyConcerns.forEach((concern) => {
      csv += `"${concern.severity}","${concern.issue}","${concern.details}"\n`;
    });
    csv += '\n';

    // AI Recommendations
    csv += 'AI RECOMMENDATIONS\n';
    reportData.ai.recommendations.forEach((rec) => {
      csv += `"${rec.column}","${rec.suggestions.missing_value_method || 'review'}","${rec.statistics.missing_percent || 0}%"\n`;
    });

    const element = document.createElement('a');
    const file = new Blob([csv], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `DAET_Report_${reportData.metadata.datasetName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      {/* Report Button in Navbar */}
      <button
        onClick={handleGenerateReport}
        disabled={loading || !datasetData}
        className="inline-flex items-center gap-2 rounded-sm border border-slate-900/30 bg-slate-900/10 px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wide transition hover:bg-slate-900/30 hover:border-slate-900/60 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText size={12} />
            Report
          </>
        )}
      </button>

      {/* Report Modal */}
      {isOpen && reportData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Report Preview</h3>
                <p className="text-[10px] text-slate-400 mt-1">{reportData.metadata.datasetName}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-sm transition"
              >
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 text-slate-300">
              {/* Dataset Overview */}
              <section>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">
                  Dataset Overview
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/40 p-3 rounded border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase">Total Records</p>
                    <p className="text-lg font-mono font-bold text-white">
                      {Number.isFinite(totalRecords) ? totalRecords.toLocaleString() : '0'}
                    </p>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase">Variables</p>
                    <p className="text-lg font-mono font-bold text-white">
                      {reportData.summary.datasetOverview.totalVariables}
                    </p>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase">Missing Values</p>
                    <p className="text-lg font-mono font-bold text-amber-400">
                      {reportData.summary.datasetOverview.columnsWithMissingValues}
                    </p>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase">AI Recommendations</p>
                    <p className="text-lg font-mono font-bold text-blue-400">
                      {reportData.ai.totalRecommendations}
                    </p>
                  </div>
                </div>
              </section>

              {/* Key Concerns */}
              {reportData.summary.keyConcerns.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">
                    Key Concerns
                  </h4>
                  <div className="space-y-2">
                    {reportData.summary.keyConcerns.map((concern, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded border text-[11px] ${
                          concern.severity === 'high'
                            ? 'bg-red-950/20 border-red-800 text-red-300'
                            : 'bg-amber-950/20 border-amber-800 text-amber-300'
                        }`}
                      >
                        <p className="font-bold">{concern.issue}</p>
                        <p className="text-[10px] opacity-75">{concern.details}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Analysis Status */}
              <section>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">
                  Analysis Status
                </h4>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className={reportData.summary.qualityStatus.cleaningApplied ? 'text-emerald-400' : 'text-slate-500'}>
                      ✓ Cleaning Analysis
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={reportData.summary.qualityStatus.outliersDetected ? 'text-emerald-400' : 'text-slate-500'}>
                      ✓ Outlier Detection
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={reportData.summary.qualityStatus.duplicatesRemoved ? 'text-emerald-400' : 'text-slate-500'}>
                      ✓ Duplicate Detection
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={reportData.summary.qualityStatus.validationRun ? 'text-emerald-400' : 'text-slate-500'}>
                      ✓ Validation Analysis
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={reportData.summary.qualityStatus.aiRecommendationsGenerated ? 'text-emerald-400' : 'text-slate-500'}>
                      ✓ AI Recommendations
                    </span>
                  </div>
                </div>
              </section>

              {/* Top Recommendations */}
              {reportData.summary.recommendedActions.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">
                    Top Recommended Actions
                  </h4>
                  <div className="space-y-2 text-[11px]">
                    {reportData.summary.recommendedActions.map((action, idx) => (
                      <div key={idx} className="bg-blue-950/20 p-2 rounded border border-blue-800">
                        <p className="font-bold text-blue-300">{action.column}</p>
                        <p className="text-slate-400">{action.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Footer - Download Options */}
            <div className="sticky bottom-0 border-t border-slate-800 bg-slate-950 px-6 py-4 flex gap-3">
              <button
                onClick={downloadAsJSON}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded border border-blue-800 bg-blue-950/30 text-blue-300 hover:bg-blue-950/60 transition text-sm font-bold uppercase tracking-wider"
              >
                <Download size={14} />
                JSON
              </button>
              <button
                onClick={downloadAsCSV}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded border border-emerald-800 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/60 transition text-sm font-bold uppercase tracking-wider"
              >
                <Download size={14} />
                CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
