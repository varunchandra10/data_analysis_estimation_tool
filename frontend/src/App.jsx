import { useState, useMemo } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import {
  ChevronRight,
  Database,
  FileSpreadsheet,
  Droplets,
  AlertTriangle,
  Copy,
  ShieldCheck,
  Scale,
  BarChart3,
  Layers,
  FileText,
  History,
} from 'lucide-react';

import AIEngine from './components/AIEngine';
import Navbar from './components/UI/Navbar';
import Sidebar from './components/UI/Sidebar';
import InfoTooltip from './components/UI/InfoTooltip';
import AllRoutes from './allroutes';
import LoginModal from './components/auth/LoginModal';

import { useDatasetContext } from './context/DatasetContext';
import { useAIContext } from './context/AIContext';
import { useAuthContext } from './context/AuthContext';
import { getTooltipContent } from './utils/tooltipContent';

const NAV_ITEMS = [
  { id: 'overview', label: 'Dataset Explorer', icon: Database, path: '/dataset-explorer' },
  { id: 'whole_dataset', label: 'Whole Dataset', icon: FileSpreadsheet, path: '/whole-dataset' },
  { id: 'missing', label: 'Null Analysis', icon: Droplets, path: '/null-analysis' },
  { id: 'outliers', label: 'Outlier Detection', icon: AlertTriangle, path: '/anomaly-detection' },
  { id: 'duplicates', label: 'Deduping', icon: Copy, path: '/deduping' },
  { id: 'validation', label: 'Rule Validation', icon: ShieldCheck, path: '/logic-validation' },
  { id: 'estimation', label: 'Weighting Engine', icon: Scale, path: '/weighting-engine' },
  { id: 'analytics', label: 'Dashboard', icon: BarChart3, path: '/statistical-engine' },
  { id: 'versioning', label: 'Version Control', icon: Layers, path: '/version-control' },
  { id: 'reports', label: 'Report Center', icon: FileText, path: '/report-center' },
  { id: 'logs', label: 'Audit Trail', icon: History, path: '/audit-trail' },
];

function formatRowCount(value) {
  if (Array.isArray(value)) return value.length.toLocaleString();
  if (typeof value === 'number') return value.toLocaleString();
  if (value && typeof value === 'object') {
    const numericValue = Number(value.rows ?? value.total_rows ?? value.count);
    return Number.isFinite(numericValue) ? numericValue.toLocaleString() : '0';
  }
  return '0';
}

/**
 * WorkspaceLayout Inner Component
 * Synchronizes active breadcrumbs and route telemetry with browser history.
 */
function WorkspaceLayout({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const location = useLocation();

  const {
    datasetData,
    activeTab,
    setActiveTab,
    analyticsViewData,
    setAnalyticsViewData,
  } = useDatasetContext();

  const currentNavItem = useMemo(() => {
    return (
      NAV_ITEMS.find((item) => item.path === location.pathname) ||
      NAV_ITEMS.find((item) => item.id === activeTab) ||
      NAV_ITEMS[0]
    );
  }, [location.pathname, activeTab]);

  const handleTabChange = (id) => {
    if (id !== 'analytics') {
      setAnalyticsViewData(null);
    }
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const activeAnalyticsData = analyticsViewData || datasetData;

  const totalRowCount = formatRowCount(
    (currentNavItem.id === 'analytics' ? activeAnalyticsData : datasetData)?.metadata?.rows ??
    datasetData?.metadata?.rows ??
    datasetData?.rows
  );

  const totalColCount = Number(
    datasetData?.metadata?.columns ??
    datasetData?.columns?.length ??
    Object.keys(datasetData?.preview?.[0] || {}).length ??
    0
  );

  return (
    <div className="flex flex-col lg:flex-row flex-1 h-full overflow-hidden relative">
      <Sidebar
        datasetData={datasetData}
        navItems={NAV_ITEMS}
        activeTab={currentNavItem.id}
        onTabChange={handleTabChange}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Core Workspace Board */}
      <section className="flex-1 h-full min-h-0 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="p-5 lg:p-6 max-w-[1550px] mx-auto">
          
          {/* Dynamic Breadcrumb & Runtime Telemetry Strip */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 font-mono select-none">
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">WORKSPACE</span>
                <ChevronRight size={11} className="text-slate-400 dark:text-slate-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {currentNavItem.label}
                </span>
              </div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                {currentNavItem.label}
              </h2>
            </div>

            {/* Observation & Dimension Stat Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-2xs">
                <div className="px-3 py-1 text-right bg-slate-50/80 dark:bg-slate-950/40 border-r border-slate-200 dark:border-slate-800 rounded-l-lg">
                  <div className="flex items-center justify-end gap-1">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">OBSERVATIONS</p>
                    <InfoTooltip {...getTooltipContent('workspaceSamples')} iconSize={11} className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                    {totalRowCount}
                  </p>
                </div>
                <div className="px-3 py-1 text-right bg-slate-50/80 dark:bg-slate-950/40 rounded-r-lg">
                  <div className="flex items-center justify-end gap-1">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">FEATURES</p>
                    <InfoTooltip {...getTooltipContent('workspaceVariables')} iconSize={11} className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                    {totalColCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Router Viewport */}
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-200 min-h-0">
            <AllRoutes />
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Root Application Component
 */
function App() {
  const {
    datasetData,
    analyticsViewData,
    validationResult,
    estimationResult,
    outlierResult,
    duplicateResult,
    resetSession,
  } = useDatasetContext();

  const { aiResults, aiLoading } = useAIContext();
  const { isBootstrapping, isLoginModalOpen, closeLoginModal } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Session Bootstrapping Screen
  if (isBootstrapping) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 dark:border-indigo-500 border-t-transparent" />
          <p className="text-xs uppercase tracking-widest font-bold">
            INITIALIZING DAET SESSION...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 antialiased transition-colors duration-200">
        
        {/* Background AI Telemetry Console */}
        {datasetData && <AIEngine />}

        {/* Global Executive Navbar */}
        {datasetData && (
          <Navbar
            datasetData={datasetData}
            aiLoading={aiLoading}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onReset={resetSession}
            aiResults={aiResults}
            validationResult={validationResult}
            estimationResult={estimationResult}
            outlierResult={outlierResult}
            duplicateResult={duplicateResult}
            analyticsViewData={analyticsViewData}
          />
        )}

        {/* System Main Viewport Scope */}
        <main className="flex-1 min-h-0 flex flex-col w-full max-w-[1800px] mx-auto overflow-hidden">
          {!datasetData ? (
            <AllRoutes />
          ) : (
            <WorkspaceLayout
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
          )}
        </main>

        {/* Global Dual-Mode Login/Register Modal */}
        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      </div>
    </Router>
  );
}

export default App;
