import { useState } from 'react';
import {
  Droplets, AlertTriangle, Copy,
  History, ChevronRight, ShieldCheck, Scale,
  BarChart3, Database, FileSpreadsheet, FileText
} from 'lucide-react';

import AIEngine from './components/AIEngine';
import Navbar from './components/UI/Navbar';
import Sidebar from './components/UI/Sidebar';
import InfoTooltip from './components/UI/InfoTooltip';
import { BrowserRouter as Router } from 'react-router-dom';
import AllRoutes from './allroutes';

import { useDatasetContext } from './context/DatasetContext';
import { useAIContext } from './context/AIContext';
import { useAuthContext } from './context/AuthContext';
import { getTooltipContent } from './utils/tooltipContent';

function App() {
  const {
    datasetData,
    activeTab,
    setActiveTab,
    analyticsViewData,
    setAnalyticsViewData,
    validationResult,
    estimationResult,
    outlierResult,
    duplicateResult,
    resetSession
  } = useDatasetContext();

  const {
    aiResults,
    aiLoading
  } = useAIContext();
  const {
    isBootstrapping,
    isAuthenticated,
    username,
    authError,
    login,
    logout
  } = useAuthContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authForm, setAuthForm] = useState({ username: 'testuser', password: 'testpassword' });
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  const navItems = [
    { id: 'overview', label: 'Dataset Explorer', icon: Database, path: '/dataset-explorer' },
    { id: 'whole_dataset', label: 'Whole Dataset', icon: FileSpreadsheet, path: '/whole-dataset' },
    { id: 'missing', label: 'Null Analysis', icon: Droplets, path: '/null-analysis' },
    { id: 'outliers', label: 'Outlier Detection', icon: AlertTriangle, path: '/anomaly-detection' },
    { id: 'duplicates', label: 'Deduping', icon: Copy, path: '/deduping' },
    { id: 'validation', label: 'Rule Validation', icon: ShieldCheck, path: '/logic-validation' },
    { id: 'estimation', label: 'Weighting Engine', icon: Scale, path: '/weighting-engine' },
    { id: 'analytics', label: 'Dashboard', icon: BarChart3, path: '/statistical-engine' },
    { id: 'versioning', label: 'Version Control', icon: FileSpreadsheet, path: '/version-control' },
    { id: 'reports', label: 'Report Center', icon: FileText, path: '/report-center' },
    { id: 'logs', label: 'Audit Trail', icon: History, path: '/audit-trail' }
  ];

  const handleTabChange = (id) => {
    if (id !== 'analytics') {
      setAnalyticsViewData(null);
    }
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const handleReset = () => {
    setIsMobileMenuOpen(false);
    resetSession();
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setAuthSubmitting(true);
    setAuthMessage('');
    try {
      await login(authForm.username, authForm.password);
    } catch (error) {
      setAuthMessage(error.message || 'Login failed.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const activeAnalyticsData = analyticsViewData || datasetData;

  const formatRowCount = (value) => {
    if (Array.isArray(value)) return value.length.toLocaleString();
    if (typeof value === 'number') return value.toLocaleString();
    if (value && typeof value === 'object') {
      const numericValue = Number(value.rows ?? value.total_rows ?? value.count);
      return Number.isFinite(numericValue) ? numericValue.toLocaleString() : '0';
    }
    return '0';
  };

  if (isBootstrapping) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-mono tracking-wider">INITIALIZING SESSION...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 antialiased">

      {datasetData && (
        <AIEngine />
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
          <>
            {!isAuthenticated && (
              <div className="mx-auto mt-6 w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-slate-100 shadow-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Authentication</p>
                    <h2 className="mt-1 text-lg font-semibold text-white">Frontend session sign-in is available</h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                      Protected actions like report generation, export, rollback, and version management use this session token.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-sm border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 hover:border-slate-500 hover:text-white"
                  >
                    Clear Session
                  </button>
                </div>
                <form onSubmit={handleLoginSubmit} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={authForm.username}
                    onChange={(event) => setAuthForm((prev) => ({ ...prev, username: event.target.value }))}
                    className="rounded-sm border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    placeholder="Username"
                  />
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
                    className="rounded-sm border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    placeholder="Password"
                  />
                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                  >
                    {authSubmitting ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
                <p className="mt-3 text-xs text-slate-500">
                  Demo session: `testuser` / `testpassword`
                </p>
                {(authMessage || authError) && (
                  <p className="mt-2 text-sm text-amber-300">{authMessage || authError}</p>
                )}
              </div>
            )}
            <AllRoutes />
          </>
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
            <section className="flex-1 h-full min-h-0 overflow-y-auto custom-scrollbar bg-slate-950 border-slate-900/40">
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
                      <div className="flex items-center justify-end gap-1">
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">SAMPLES</p>
                        <InfoTooltip {...getTooltipContent('workspaceSamples')} iconSize={12} className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-bold text-slate-200">
                        {formatRowCount((activeTab === 'analytics' ? activeAnalyticsData : datasetData)?.metadata?.rows)}
                      </p>
                    </div>
                    <div className="px-3 py-1 text-right bg-slate-900/40">
                      <div className="flex items-center justify-end gap-1">
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">VARIABLES</p>
                        <InfoTooltip {...getTooltipContent('workspaceVariables')} iconSize={12} className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-bold text-slate-200">
                        {Object.keys((activeTab === 'analytics' ? activeAnalyticsData : datasetData)?.preview?.[0] || {}).length}
                      </p>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center gap-2 rounded-sm border border-slate-900 bg-slate-900/40 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    <span className={`h-2 w-2 rounded-full ${isAuthenticated ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span>{isAuthenticated ? `Authenticated: ${username}` : 'Authentication required'}</span>
                  </div>
                </div>

                {/* APP PIPELINE ROUTER TARGET BLOCK */}
                <div className="animate-in fade-in slide-in-from-bottom-1 duration-200 min-h-0">
                  <AllRoutes />
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
