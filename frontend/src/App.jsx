import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Droplets, AlertTriangle, Copy, Settings,
  History, LogOut, ChevronRight, ShieldCheck, Scale,
  BarChart3, Sparkles, Menu, X, Database, Activity, FileSpreadsheet
} from 'lucide-react';

import MissingValuePanel from './components/MissingValuePanel';
import OutlierPanel from './components/OutlierPanel';
import DuplicatePanel from './components/DuplicatePanel';
import RuleValidationPanel from './components/ValidationPanel';
import CleaningLogsPanel from './components/CleaningLogsPanel';
import WeightEstimationPanel from './components/WeightEstimationPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AIEngine from './components/AIEngine';
import VersioningPanel from './components/VersioningPanel';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';

import Mainpage from './pages/Mainpage';
import IngestionPage from './pages/IngestionPage';
import DatasetExplorer from './pages/DatasetExplorer';
import NullAnalysis from './pages/NullAnalysis';
import WholeDatasetPage from './pages/WholeDatasetPage';
import AnomalyDetection from './pages/AnomalyDetection';
import Deduping from './pages/Deduping';
import LogicValidation from './pages/LogicValidation';
import WeightingEngine from './pages/WeightingEngine';
import StatisticalEngine from './pages/StatisticalEngine';
import VersionControl from './pages/VersionControl';
import AuditTrail from './pages/AuditTrail';

import './App.css';

function App() {
  const [datasetData, setDatasetData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [analyticsViewData, setAnalyticsViewData] = useState(null);

  const [validationResult, setValidationResult] = useState(null);
  const [estimationResult, setEstimationResult] = useState(null);
  const [outlierResult, setOutlierResult] = useState(null);
  const [duplicateResult, setDuplicateResult] = useState(null);

  const [aiResults, setAIResults] = useState(null);
  const [aiResultsSourcePath, setAIResultsSourcePath] = useState(null);
  const [aiLoading, setAILoading] = useState(false);

  const storageKey = 'daet_frontend_state_v1';

  useEffect(() => {
    try {
      const rawState = window.localStorage.getItem(storageKey);

      if (!rawState) return;

      const savedState = JSON.parse(rawState);

      if (savedState.datasetData) setDatasetData(savedState.datasetData);
      if (savedState.activeTab) setActiveTab(savedState.activeTab);
      if (savedState.analyticsViewData) setAnalyticsViewData(savedState.analyticsViewData);
      if (savedState.aiResults) setAIResults(savedState.aiResults);
      if (savedState.aiResultsSourcePath) {
        setAIResultsSourcePath(savedState.aiResultsSourcePath);
      }
    } catch (error) {
      console.warn('Failed to restore DAET session:', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (!datasetData && !aiResults) {
        window.localStorage.removeItem(storageKey);
        return;
      }

      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          datasetData,
          activeTab,
          analyticsViewData,
          aiResults,
          aiResultsSourcePath,
        })
      );
    } catch (error) {
      console.warn('Failed to persist DAET session:', error);
    }
  }, [datasetData, activeTab, analyticsViewData, aiResults, aiResultsSourcePath]);

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
    setDatasetData(null);
    setActiveTab('overview');
    setValidationResult(null);
    setEstimationResult(null);
    setOutlierResult(null);
    setDuplicateResult(null);
    setAIResults(null);
    setAIResultsSourcePath(null);
    setAnalyticsViewData(null);
    setIsMobileMenuOpen(false);
    window.localStorage.removeItem(storageKey);
  };

  const activeAnalyticsData = analyticsViewData || datasetData;

  return (
    <Router>
      <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30">

      {datasetData && (
        <AIEngine
          datasetData={datasetData}
          setAIResults={setAIResults}
          aiResultsSourcePath={aiResultsSourcePath}
          setAIResultsSourcePath={setAIResultsSourcePath}
          setAILoading={setAILoading}
        />
      )}

      {/* HEADER: Refined with tighter padding and sharper borders */}
      {datasetData && (
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-[60] w-full shadow-sm">
          <div className="max-w-[1800px] mx-auto px-4 py-2.5 flex items-center justify-between">

          <div className="flex items-center gap-4">
            {datasetData && (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                <Menu size={18} />
              </button>
            )}

            {/* BRANDING: More minimalist and corporate */}
            <div className="flex items-center gap-3 border-r border-slate-200 dark:border-slate-800 pr-4">
              <div className="w-8 h-8 rounded bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900">
                <Activity size={18} />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight uppercase leading-none">DAET <span className="font-light text-slate-500">Workbench</span></h1>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">v2.4.0-Stable</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {datasetData && (
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className={aiLoading ? "text-indigo-500 animate-pulse" : "text-slate-400"} />
                  <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                    {aiLoading ? 'Neural Engine Active' : 'Model Ready'}
                  </span>
                </div>
              </div>
            )}

            <div className="h-6 w-px bg-slate-200 dark:border-slate-800 mx-1" />

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <LogOut size={16} />
              Terminate
            </button>
          </div>
          </div>
        </header>
      )}

      <main className="flex-1 min-h-0 flex flex-col w-full max-w-[1800px] mx-auto overflow-visible">

        {!datasetData ? (
          <Routes>
            <Route path="/" element={<Mainpage />} />
            <Route
              path="/ingestion"
              element={
                <IngestionPage
                  onUploadSuccess={(data) => {
                    setDatasetData(data);
                    setAnalyticsViewData(null);
                    setActiveTab('overview');
                    try {
                      window.history.pushState({}, '', '/dataset-explorer');
                    } catch (e) {
                      window.location.hash = '/dataset-explorer';
                    }
                    setAIResults(null);
                    setAIResultsSourcePath(null);
                  }}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">

            {/* DESKTOP SIDEBAR: Industrial look */}
            <aside className="hidden lg:flex w-64 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 flex flex-col gap-6 shrink-0 overflow-y-auto">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Analysis Pipeline</p>
                <nav className="flex flex-col gap-0.5">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={() => handleTabChange(item.id)}
                      className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded transition-all text-sm font-medium border-l-2 ${isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 border-indigo-600'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 border-transparent'
                      }`}
                    >
                      <item.icon size={16} strokeWidth={2} />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="mt-auto">
                <div className="p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">System Status</p>
                  </div>
                  <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate font-mono">{datasetData.metadata.filename}</p>
                </div>
              </div>
            </aside>

            {/* MAIN WORKSPACE */}
            <section className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-[#020617] custom-scrollbar">
              <div className="p-6 lg:p-8 max-w-[1400px]">

                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-tighter">Workspace</span>
                      <ChevronRight size={10} />
                      <span className="text-[10px] font-mono uppercase tracking-tighter text-indigo-500">
                        {activeTab}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
                      {navItems.find(n => n.id === activeTab)?.label}
                    </h2>
                  </div>

                  {/* METRIC CHIPS: Quick context for statisticians */}
                  <div className="flex gap-4">
                    <div className="px-3 py-1 border-r border-slate-200 dark:border-slate-800 text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Samples</p>
                      <p className="text-sm font-mono font-bold">{(activeTab === 'analytics' ? activeAnalyticsData : datasetData)?.metadata?.rows?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="px-3 py-1 text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Variables</p>
                      <p className="text-sm font-mono font-bold">{Object.keys((activeTab === 'analytics' ? activeAnalyticsData : datasetData)?.preview?.[0] || {}).length}</p>
                    </div>
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Routes>
                    <Route path="/ingestion" element={<Navigate to="/dataset-explorer" replace />} />
                    <Route path="/" element={<DatasetExplorer datasetData={datasetData} aiResults={aiResults} />} />
                    <Route path="/dataset-explorer" element={<DatasetExplorer datasetData={datasetData} aiResults={aiResults} />} />
                    <Route path="/whole-dataset" element={<WholeDatasetPage datasetData={datasetData} onBack={() => {
                      handleTabChange('overview');
                      window.history.pushState({}, '', '/dataset-explorer');
                    }} />} />

                    <Route path="/null-analysis" element={<NullAnalysis data={datasetData} aiInsights={missingValueInsights} onCleaningComplete={(result) => {
                      setAIResults(null);
                      setAIResultsSourcePath(null);
                      setAnalyticsViewData(null);
                      setDatasetData(prev => ({
                        ...prev,
                        preview: result.preview,
                        metadata: {
                          ...prev.metadata,
                          file_path: result.file_path,
                          dataset_name: prev.metadata.dataset_name || prev.metadata.filename,
                          null_counts: result.null_counts
                        }
                      }));
                    }} />} />

                    <Route path="/anomaly-detection" element={<AnomalyDetection data={datasetData} aiInsights={outlierInsights} onResult={(res) => {
                      setOutlierResult(res);
                      if (res?.file_path) {
                        setAnalyticsViewData(null);
                        setDatasetData(prev => ({
                          ...prev,
                          preview: res.preview || prev.preview,
                          metadata: { ...prev.metadata, file_path: res.file_path }
                        }));
                      }
                    }} />} />

                    <Route path="/deduping" element={<Deduping data={datasetData} aiInsights={aiResults?.duplicate_insights || []} onProcessComplete={(result) => {
                      setDuplicateResult(result);
                      setAIResults(null);
                      setAIResultsSourcePath(null);
                      setAnalyticsViewData(null);
                      setDatasetData(prev => ({
                        ...prev,
                        preview: result.preview,
                        metadata: {
                          ...prev.metadata,
                          file_path: result.file_path,
                          rows: result.final_rows
                        }
                      }));
                    }} />} />

                    <Route path="/logic-validation" element={<LogicValidation data={datasetData} aiInsights={validationInsights} onValidationComplete={(res) => {
                      setValidationResult(res);
                      if (res?.file_path) {
                        setAIResults(null);
                        setAIResultsSourcePath(null);
                        setAnalyticsViewData(null);
                        setDatasetData(prev => ({
                          ...prev,
                          preview: res.preview || prev.preview,
                          metadata: { ...prev.metadata, file_path: res.file_path }
                        }));
                      }
                    }} />} />

                    <Route path="/weighting-engine" element={<WeightingEngine data={datasetData} aiInsights={aiResults?.weight_estimation_insights || []} onEstimationComplete={(res) => setEstimationResult(res)} />} />

                    <Route path="/statistical-engine" element={<StatisticalEngine datasetData={activeAnalyticsData} validationResult={validationResult} estimationResult={estimationResult} outlierResult={outlierResult} duplicateResult={duplicateResult} aiResults={aiResults} />} />

                    <Route path="/version-control" element={<VersionControl data={datasetData} onViewAnalytics={(analyticsDataset) => {
                      setAnalyticsViewData(analyticsDataset);
                      setActiveTab('analytics');
                      setIsMobileMenuOpen(false);
                    }} />} />

                    <Route path="/audit-trail" element={<AuditTrail data={datasetData} />} />
                  </Routes>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* MOBILE DRAWER: Updated for consistency */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-950 shadow-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Navigation</h3>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                <X size={18} />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => { handleTabChange(item.id); setIsMobileMenuOpen(false); }}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
      </div>
    </Router>
  );
}

export default App;
