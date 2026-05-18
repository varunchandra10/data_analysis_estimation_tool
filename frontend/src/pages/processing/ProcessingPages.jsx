import React, { useState } from 'react';
import { 
  Database, Droplets, AlertTriangle, Copy, ShieldCheck, 
  Scale, BarChart3, History, Terminal, LogOut, ChevronRight, 
  Layers, Activity, Globe, Box, Settings 
} from 'lucide-react';

// Sub-components
import DatasetPreview from '../components/DatasetPreview';
import MissingValuePanel from '../components/cleaning/Imputation/MissingValuePanel';
import OutlierPanel from '../components/cleaning/outlier_detection/OutlierPanel';
import DuplicatePanel from '../components/DuplicatePanel';
import RuleValidationPanel from '../components/cleaning/rule_validation/ValidationPanel';
import WeightEstimationPanel from '../components/cleaning/weight_estimation/WeightEstimationPanel';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import CleaningLogsPanel from '../components/cleaning/rule_validation/CleaningLogsPanel';

const WorkbenchPage = ({ datasetData, aiResults, onReset }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Dataset Explorer', icon: Database, group: 'SOURCE' },
    { id: 'missing', label: 'Null Analysis', icon: Droplets, group: 'QUALITY' },
    { id: 'outliers', label: 'Anomaly Detection', icon: AlertTriangle, group: 'QUALITY' },
    { id: 'duplicates', label: 'Record Deduplication', icon: Copy, group: 'QUALITY' },
    { id: 'validation', label: 'Logic Validation', icon: ShieldCheck, group: 'SCHEMA' },
    { id: 'estimation', label: 'Weighting Engine', icon: Scale, group: 'COMPUTE' },
    { id: 'analytics', label: 'Stat Summaries', icon: BarChart3, group: 'OUTPUT' },
    { id: 'logs', label: 'Audit Trail', icon: History, group: 'OUTPUT' }
  ];

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 antialiased">
      {/* HEADER */}
      <header className="h-11 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-3 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Box size={18} className="text-indigo-600" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">DAET<span className="text-slate-400 font-light">Laboratory</span></span>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border">
            BUFFER: {datasetData.metadata.filename}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Settings size={14} className="text-slate-400" />
        </div>
      </header>

      <main className="flex-grow flex overflow-hidden">
        {/* NAV NAVIGATOR */}
        <aside className="w-60 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigator</span>
            <Terminal size={12} className="text-slate-400" />
          </div>
          <div className="flex-grow overflow-y-auto py-2 px-2 space-y-4">
            {['SOURCE', 'QUALITY', 'SCHEMA', 'COMPUTE', 'OUTPUT'].map(group => (
              <div key={group}>
                <p className="text-[9px] font-bold text-slate-400/70 px-2 py-1 uppercase">{group}</p>
                {navItems.filter(i => i.group === group).map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded transition-all text-xs font-semibold ${activeTab === item.id ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <item.icon size={14} /> {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            <button onClick={onReset} className="w-full flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold uppercase text-slate-400 hover:text-red-500 rounded border border-transparent hover:border-red-100 transition-all">
              <LogOut size={12} /> Eject Session
            </button>
          </div>
        </aside>

        {/* WORKSPACE */}
        <div className="flex-grow flex flex-col min-w-0">
          <div className="h-9 bg-white dark:bg-slate-950 border-b border-slate-200 flex items-center px-4 gap-2">
             <Database size={12} className="text-slate-400" />
             <ChevronRight size={10} className="text-slate-300" />
             <span className="text-[10px] font-mono text-indigo-500 font-bold uppercase">{activeTab}</span>
          </div>

          <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-[1400px] mx-auto space-y-6">
              {/* Tab Rendering Logic goes here (MissingValuePanel, etc.) */}
              {activeTab === 'overview' && <DatasetPreview data={datasetData} aiResults={aiResults} />}
              {/* ... other tabs ... */}
            </div>
          </div>
        </div>
      </main>

      <footer className="h-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-3 text-[9px] font-mono text-slate-400">
         <span>ENV: PRODUCTION_NODE_A</span>
         <span className="text-indigo-500 font-bold">DAET CORE v2.4.0</span>
      </footer>
    </div>
  );
};

export default WorkbenchPage;