import React, { useEffect, useState } from 'react';
import {
  Droplets, AlertTriangle, Copy, Settings,
  History, ChevronRight, ShieldCheck, Scale,
  BarChart3, Database, FileSpreadsheet, Cpu, FileText
} from 'lucide-react';

import MissingValuePanel from './components/cleaning/Imputation/MissingValuePanel';
import OutlierPanel from './components/cleaning/outlier_detection/OutlierPanel';
import DuplicatePanel from './components/DuplicatePanel';
import RuleValidationPanel from './components/cleaning/rule_validation/ValidationPanel';
import CleaningLogsPanel from './components/cleaning/rule_validation/CleaningLogsPanel';
import WeightEstimationPanel from './components/cleaning/weight_estimation/WeightEstimationPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AIEngine from './components/AIEngine';
import VersioningPanel from './components/VersioningPanel';
import Navbar from './components/UI/Navbar';
import Sidebar from './components/UI/Sidebar';
import { BrowserRouter as Router } from 'react-router-dom';
import AllRoutes from './allroutes';
import { useDAETSession } from './utils/useDAETSession';

import './App.css';

function App() {
  const {
    datasetData, setDatasetData,
    activeTab, setActiveTab,
    analyticsViewData, setAnalyticsViewData,
    aiResults, setAIResults,
    aiResultsSourcePath, setAIResultsSourcePath,
    resetSession
  } = useDAETSession();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [validationResult, setValidationResult] = useState(null);
  const [estimationResult, setEstimationResult] = useState(null);
  const [outlierResult, setOutlierResult] = useState(null);
  const [duplicateResult, setDuplicateResult] = useState(null);

  const [aiLoading, setAILoading] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Dataset Explorer', icon: Database, path: '/dataset-explorer' },
    { id: 'whole_dataset', label: 'Whole Dataset', icon: FileSpreadsheet, path: '/whole-dataset' },
    { id: 'missing', label: 'Null Analysis', icon: Droplets, path: '/null-analysis' },
    { id: 'outliers', label: 'Anomaly Detection', icon: AlertTriangle, path: '/anomaly-detection' },
    { id: 'duplicates', label: 'Deduping', icon: Copy, path: '/deduping' },
    { id: 'validation', label: 'Logic Validation', icon: ShieldCheck, path: '/logic-validation' },
    { id: 'estimation', label: 'Weighting Engine', icon: Scale, path: '/weighting-engine' },
    { id: 'analytics', label: 'Statistical Insights', icon: BarChart3, path: '/statistical-engine' },
    { id: 'versioning', label: 'Version Control', icon: FileSpreadsheet, path: '/version-control' },
    { id: 'reports', label: 'Report Center', icon: FileText, path: '/report-center' },
    { id: 'logs', label: 'Audit Trail', icon: History, path: '/audit-trail' }
  ];

  const aiRecommendations = aiResults?.recommendations || [];
  const missingValueInsights = aiRecommendations.map((item) => {
    const recommendation = item.recommendations || {};
    const reasonParts = [];

    if (item.statistics?.missing_percent !== undefined) {
      reasonParts.push(`Missing ${item.statistics.missing_percent}%`);
    }

    if (Array.isArray(recommendation.reason_codes) && recommendation.reason_codes.length > 0) {
      reasonParts.push(recommendation.reason_codes.join(', '));
    }

    return {
      column: item.column,
      recommended_method: recommendation.missing_value_method || 'review',
      reason: reasonParts.join(' • ') || 'Backend AI recommendation available',
      warning: recommendation.warnings?.[0] || null,
    };
  });

  const outlierInsights = aiRecommendations.map((item) => {
    const recommendation = item.recommendations || {};

    return {
      column: item.column,
      recommended_method: recommendation.outlier_method || 'iqr',
      reason: recommendation.warnings?.[0] || recommendation.reason_codes?.[0] || 'Backend AI recommendation available',
      warning: recommendation.warnings?.[0] || null,
    };
  });

  const validationInsights = aiRecommendations.map((item) => {
    const recommendation = item.recommendations || {};

    return {
      column: item.column,
      operator: '==',
      value: recommendation.missing_value_method || recommendation.outlier_method || 'review',
      severity: recommendation.validation_priority || 'low',
    };
  });

  const handleTabChange = (id) => {
    if (id !== 'analytics') {
      setAnalyticsViewData(null);
    }
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const handleReset = () => {
    setValidationResult(null);
    setEstimationResult(null);
    setOutlierResult(null);
    setDuplicateResult(null);
    setIsMobileMenuOpen(false);
    resetSession();
  };

  const activeAnalyticsData = analyticsViewData || datasetData;

  return (
    <Router>
      <div className="h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 antialiased">

      {datasetData && (
        <AIEngine
          datasetData={datasetData}
          setAIResults={setAIResults}
          aiResultsSourcePath={aiResultsSourcePath}
          setAIResultsSourcePath={setAIResultsSourcePath}
          setAILoading={setAILoading}
        />
      )}

      {/* HEADER BLOCK */}
      {datasetData && (
        <Navbar
          datasetData={datasetData}
          aiLoading={aiLoading}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onReset={handleReset}
          aiResults={aiResults}
          validationResult={validationResult}
          estimationResult={estimationResult}
          outlierResult={outlierResult}
          duplicateResult={duplicateResult}
          analyticsViewData={analyticsViewData}
        />
      )}

      {/* SYSTEM MAIN CONTROLLER SCOPE */}
      <main className="flex-1 min-h-0 flex flex-col w-full max-w-[1800px] mx-auto overflow-hidden">
        {!datasetData ? (
          <AllRoutes
            datasetData={datasetData}
            setDatasetData={setDatasetData}
            aiResults={aiResults}
            aiResultsSourcePath={aiResultsSourcePath}
            setAIResults={setAIResults}
            setAIResultsSourcePath={setAIResultsSourcePath}
            setActiveTab={setActiveTab}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            setAnalyticsViewData={setAnalyticsViewData}
            analyticsViewData={analyticsViewData}
            validationResult={validationResult}
            setValidationResult={setValidationResult}
            estimationResult={estimationResult}
            setEstimationResult={setEstimationResult}
            outlierResult={outlierResult}
            setOutlierResult={setOutlierResult}
            duplicateResult={duplicateResult}
            setDuplicateResult={setDuplicateResult}
            activeAnalyticsData={activeAnalyticsData}
            missingValueInsights={missingValueInsights}
            outlierInsights={outlierInsights}
            validationInsights={validationInsights}
          />
        ) : (
          <div className="flex flex-col lg:flex-row flex-1 h-full overflow-hidden relative">
            <Sidebar
              datasetData={datasetData}
              navItems={navItems}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {/* MAIN CORE WORKSPACE BOARD */}
            <section className="flex-1 h-full min-h-0 overflow-y-auto bg-slate-950 border-slate-900/40">
              <div className="p-5 lg:p-6 max-w-[1500px]">

                {/* HIGH-DENSITY RUNTIME METRIC CONTROLS */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 border-b border-slate-900 pb-4 font-mono select-none">
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">WORKSPACE</span>
                      <ChevronRight size={11} className="text-slate-700" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                        {activeTab}
                      </span>
                    </div>
                    <h2 className="text-base font-bold tracking-tight text-white uppercase">
                      {navItems.find(n => n.id === activeTab)?.label}
                    </h2>
                  </div>

                  {/* RIGID MATHEMATICAL STAT METADATA CHIPS */}
                  <div className="flex gap-1 bg-slate-950 border border-slate-900 p-1 rounded-sm">
                    <div className="px-3 py-1 text-right bg-slate-900/40 border-r border-slate-900">
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">SAMPLES</p>
                      <p className="text-xs font-bold text-slate-200">
                        {(activeTab === 'analytics' ? activeAnalyticsData : datasetData)?.metadata?.rows?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="px-3 py-1 text-right bg-slate-900/40">
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">VARIABLES</p>
                      <p className="text-xs font-bold text-slate-200">
                        {Object.keys((activeTab === 'analytics' ? activeAnalyticsData : datasetData)?.preview?.[0] || {}).length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* APP PIPELINE ROUTER TARGET BLOCK */}
                <div className="animate-in fade-in slide-in-from-bottom-1 duration-200 min-h-0">
                  <AllRoutes
                    datasetData={datasetData}
                    setDatasetData={setDatasetData}
                    aiResults={aiResults}
                    aiResultsSourcePath={aiResultsSourcePath}
                    setAIResults={setAIResults}
                    setAIResultsSourcePath={setAIResultsSourcePath}
                    setActiveTab={setActiveTab}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    setAnalyticsViewData={setAnalyticsViewData}
                    analyticsViewData={analyticsViewData}
                    validationResult={validationResult}
                    setValidationResult={setValidationResult}
                    estimationResult={estimationResult}
                    setEstimationResult={setEstimationResult}
                    outlierResult={outlierResult}
                    setOutlierResult={setOutlierResult}
                    duplicateResult={duplicateResult}
                    setDuplicateResult={setDuplicateResult}
                    activeAnalyticsData={activeAnalyticsData}
                    missingValueInsights={missingValueInsights}
                    outlierInsights={outlierInsights}
                    validationInsights={validationInsights}
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      </div>
    </Router>
  );
}

export default App;