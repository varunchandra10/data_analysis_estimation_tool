import { useState } from 'react';
import {
  LayoutDashboard,
  Droplets,
  AlertTriangle,
  Copy,
  Settings,
  History,
  LogOut,
  ChevronRight,
  ShieldCheck, // New Icon for Validation
  Menu,
  X
} from 'lucide-react';

import FileUpload from './components/FileUpload';
import DatasetPreview from './components/DatasetPreview';
import MissingValuePanel from './components/MissingValuePanel';
import OutlierPanel from './components/OutlierPanel';
import DuplicatePanel from './components/DuplicatePanel';
import RuleValidationPanel from './components/ValidationPanel';
import CleaningLogsPanel from './components/CleaningLogsPanel';

import './App.css';

function App() {
  const [datasetData, setDatasetData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // UPDATED: Added Validation to navItems
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'missing', label: 'Missing', icon: Droplets },
    { id: 'outliers', label: 'Outliers', icon: AlertTriangle },
    { id: 'duplicates', label: 'Duplicates', icon: Copy },
    { id: 'validation', label: 'Rules', icon: ShieldCheck }, // Added this section
    { id: 'logs', label: 'Audit', icon: History },
  ];

  const handleTabChange = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#08060d] text-gray-900 dark:text-gray-100 flex flex-col font-sans overflow-x-hidden">
      {/* HEADER */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50 w-full">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-purple-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <span className="font-black text-lg sm:text-xl">D</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight leading-none">DAET Platform</h1>
              <span className="hidden sm:inline-block text-[10px] text-purple-500 font-bold uppercase tracking-widest">Enterprise Analytics</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="hidden lg:flex gap-1">
              <button className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Documentation</button>
            </nav>
            <div className="hidden sm:block h-6 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1" />
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <Settings size={20} className="text-gray-500" />
            </button>
            {datasetData && (
              <button
                onClick={() => { setDatasetData(null); setActiveTab('overview'); }}
                className="lg:hidden p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col w-full max-w-[1600px] mx-auto overflow-hidden">
        {!datasetData ? (
          <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 animate-in fade-in zoom-in duration-1000">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-[10px] sm:text-xs font-bold mb-4 sm:mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                v2.0 Clean Engine is Live
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-8 leading-tight">
                Precision Data <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500">
                  Refining Pipeline
                </span>
              </h2>
              <p className="text-sm sm:text-lg lg:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
                Automated schema detection, outlier removal, and redundancy processing for complex survey datasets.
              </p>
            </div>
            <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both px-2 sm:px-4">
              <FileUpload onUploadSuccess={(data) => setDatasetData(data)} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row flex-grow overflow-hidden h-[calc(100vh-61px)] lg:h-[calc(100vh-65px)]">
            <aside className="hidden lg:flex w-72 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 flex flex-col gap-8 shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Analysis Suite</p>
                <button
                  onClick={() => { setDatasetData(null); setActiveTab('overview'); }}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm group ${activeTab === item.id
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        {item.label}
                      </div>
                      <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === item.id ? 'hidden' : ''}`} />
                    </button>
                  );
                })}
              </nav>
              <div className="mt-auto p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Active File</p>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate mb-1">
                  {datasetData.metadata.filename}
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <p className="text-[10px] text-gray-500">Ready for processing</p>
                </div>
              </div>
            </aside>

            {/* MOBILE TAB BAR */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center py-2 px-1 z-50 backdrop-blur-lg bg-opacity-90">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all ${activeTab === item.id ? 'text-purple-600' : 'text-gray-400'}`}
                  >
                    <Icon size={20} />
                    <span className="text-[10px] font-bold uppercase">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <section className="flex-grow overflow-y-auto bg-[#f8f9fc] dark:bg-[#08060d] p-4 sm:p-6 lg:p-8 custom-scrollbar pb-20 lg:pb-8">
              <div className="max-w-5xl mx-auto">
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white capitalize flex items-center gap-2">
                    <span className="lg:hidden">
                      {(() => {
                        const ActiveIcon = navItems.find(n => n.id === activeTab)?.icon;
                        return ActiveIcon ? <ActiveIcon size={24} className="text-purple-600" /> : null;
                      })()}
                    </span>
                    {navItems.find(n => n.id === activeTab)?.label}
                  </h2>
                  <div className="h-1 w-10 sm:w-12 bg-purple-600 rounded-full mt-2" />
                </div>

                <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full overflow-hidden">
                  {activeTab === 'overview' && <DatasetPreview data={datasetData} />}
                  {activeTab === 'missing' && (
                    <MissingValuePanel
                      data={datasetData}
                      onCleaningComplete={(result) => {
                        setDatasetData(prev => ({
                          ...prev,
                          preview: result.preview,
                          metadata: { ...prev.metadata, null_counts: result.null_counts }
                        }));
                      }}
                    />
                  )}
                  {activeTab === 'outliers' && <OutlierPanel data={datasetData} />}
                  {activeTab === 'duplicates' && (
                    <DuplicatePanel
                      data={datasetData}
                      onProcessComplete={(result) => {
                        setDatasetData(prev => ({
                          ...prev,
                          preview: result.preview,
                          metadata: { ...prev.metadata, rows: result.final_rows }
                        }));
                      }}
                    />
                  )}
                  {/* UPDATED: Matches ID 'validation' from navItems */}
                  {activeTab === 'validation' && (
                    <RuleValidationPanel data={datasetData} />
                  )}
                  
                  {activeTab === 'logs' && <CleaningLogsPanel data={datasetData} />}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {!datasetData && (
        <footer className="border-t border-gray-100 dark:border-gray-800 py-6 sm:py-10">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-4">
            <div className="flex gap-4 sm:gap-8 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">
              <a href="#" className="hover:text-purple-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-purple-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-purple-500 transition-colors">Support</a>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 font-medium text-center">
              © 2026 MOSPI DAET Platform. <br className="sm:hidden" /> Engineered for Data Integrity.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;