import { useState } from 'react';
import {
  LayoutDashboard, Droplets, AlertTriangle, Copy, Settings,
  History, LogOut, ChevronRight, ShieldCheck, Scale,
  BarChart3, Sparkles, Menu, X, Database, Activity, FileSpreadsheet
} from 'lucide-react';

import FileUpload from './components/FileUpload';
import DatasetPreview from './components/DatasetPreview';
import MissingValuePanel from './components/MissingValuePanel';
import OutlierPanel from './components/OutlierPanel';
import DuplicatePanel from './components/DuplicatePanel';
import RuleValidationPanel from './components/ValidationPanel';
import CleaningLogsPanel from './components/CleaningLogsPanel';
import WeightEstimationPanel from './components/WeightEstimationPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AIEngine from './components/AIEngine';

import './App.css';

function App() {
  const [datasetData, setDatasetData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [validationResult, setValidationResult] = useState(null);
  const [estimationResult, setEstimationResult] = useState(null);
  const [outlierResult, setOutlierResult] = useState(null);
  const [duplicateResult, setDuplicateResult] = useState(null);

  const [aiResults, setAIResults] = useState(null);
  const [aiLoading, setAILoading] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Dataset Explorer', icon: Database },
    { id: 'missing', label: 'Null Analysis', icon: Droplets },
    { id: 'outliers', label: 'Anomaly Detection', icon: AlertTriangle },
    { id: 'duplicates', label: 'Deduping', icon: Copy },
    { id: 'validation', label: 'Logic Validation', icon: ShieldCheck },
    { id: 'estimation', label: 'Weighting Engine', icon: Scale },
    { id: 'analytics', label: 'Statistical Insights', icon: BarChart3 },
    { id: 'logs', label: 'Audit Trail', icon: History }
  ];

  const handleTabChange = (id) => {
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
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30">

      {datasetData && (
        <AIEngine
          datasetData={datasetData}
          setAIResults={setAIResults}
          setAILoading={setAILoading}
        />
      )}

      {/* HEADER: Refined with tighter padding and sharper borders */}
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

            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 transition-all">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col w-full max-w-[1800px] mx-auto overflow-hidden">

        {!datasetData ? (
          <div className="flex-grow flex flex-col items-center justify-center px-6 py-12">
            <div className="text-center max-w-2xl mb-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800">
                  <FileSpreadsheet size={48} className="text-indigo-600" />
                </div>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-4">
                Statistically Sound <span className="text-indigo-600 font-light italic">Data Refinement</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                Professional toolkit for data validation, weight estimation, and anomaly detection.
                Optimized for high-fidelity survey analysis and enterprise reporting.
              </p>
            </div>

            <div className="w-full max-w-3xl border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-2 bg-white/50 dark:bg-slate-900/50">
              <FileUpload
                onUploadSuccess={(data) => {
                  setDatasetData(data);
                  setActiveTab('overview'); // Force view to explorer immediately
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row flex-grow overflow-hidden h-[calc(100vh-57px)]">

            {/* DESKTOP SIDEBAR: Industrial look */}
            <aside className="hidden lg:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 flex flex-col gap-6 shrink-0">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Analysis Pipeline</p>
                <nav className="flex flex-col gap-0.5">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded transition-all text-sm font-medium border-l-2 ${activeTab === item.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 border-indigo-600'
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 border-transparent'
                        }`}
                    >
                      <item.icon size={16} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                      {item.label}
                    </button>
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
                  <button
                    onClick={handleReset}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all"
                  >
                    <LogOut size={12} /> Terminate Session
                  </button>
                </div>
              </div>
            </aside>

            {/* MAIN WORKSPACE */}
            <section className="flex-grow overflow-y-auto bg-white dark:bg-[#020617] custom-scrollbar">
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
                      <p className="text-sm font-mono font-bold">{datasetData.metadata.rows?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="px-3 py-1 text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Variables</p>
                      <p className="text-sm font-mono font-bold">{Object.keys(datasetData.preview[0] || {}).length}</p>
                    </div>
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {activeTab === 'overview' && <DatasetPreview data={datasetData} aiResults={aiResults} />}

                  {activeTab === 'missing' && (
                    <MissingValuePanel
                      data={datasetData}
                      aiInsights={aiResults?.missing_value_insights || []}
                      onCleaningComplete={(result) => {
                        setDatasetData(prev => ({
                          ...prev,
                          preview: result.preview,
                          metadata: { ...prev.metadata, null_counts: result.null_counts }
                        }));
                      }}
                    />
                  )}

                  {activeTab === 'outliers' && (
                    <OutlierPanel data={datasetData} aiInsights={aiResults?.outlier_insights || []} onResult={(res) => setOutlierResult(res)} />
                  )}

                  {activeTab === 'duplicates' && (
                    <DuplicatePanel
                      data={datasetData}
                      aiInsights={aiResults?.duplicate_insights || []}
                      onProcessComplete={(result) => {
                        setDuplicateResult(result);
                        setDatasetData(prev => ({
                          ...prev,
                          preview: result.preview,
                          metadata: { ...prev.metadata, rows: result.final_rows }
                        }));
                      }}
                    />
                  )}

                  {activeTab === 'validation' && (
                    <RuleValidationPanel data={datasetData} aiInsights={aiResults?.validation_insights || []} onValidationComplete={(res) => setValidationResult(res)} />
                  )}

                  {activeTab === 'estimation' && (
                    <WeightEstimationPanel data={datasetData} aiInsights={aiResults?.weight_estimation_insights || []} onEstimationComplete={(res) => setEstimationResult(res)} />
                  )}

                  {activeTab === 'analytics' && (
                    <AnalyticsDashboard
                      datasetData={datasetData}
                      validationResult={validationResult}
                      estimationResult={estimationResult}
                      outlierResult={outlierResult}
                      duplicateResult={duplicateResult}
                      aiResults={aiResults}
                    />
                  )}

                  {activeTab === 'logs' && <CleaningLogsPanel data={datasetData} />}
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
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-500'
                    }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;