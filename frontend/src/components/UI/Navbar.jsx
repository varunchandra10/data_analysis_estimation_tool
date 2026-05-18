import React from 'react';
import { Menu, Activity, Sparkles, LogOut } from 'lucide-react';
import ReportGenerator from '../ReportGenerator';

export default function Navbar({
  datasetData,
  aiLoading,
  onOpenMobileMenu,
  onReset,
  aiResults,
  validationResult,
  estimationResult,
  outlierResult,
  duplicateResult,
  analyticsViewData,
}) {
  if (!datasetData) return null;

  return (
    <header className="border-b border-slate-900 bg-slate-950 sticky top-0 z-[60] w-full select-none">
      <div className="max-w-[1800px] mx-auto px-4 py-2 flex items-center justify-between font-mono">
        {/* LEFT REGION */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-sm transition-all"
          >
            <Menu size={16} />
          </button>
          <div className="flex items-center gap-3 pr-2">
            <div className="w-7 h-7 bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center rounded-sm">
              <Activity size={15} />
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xs font-black tracking-wider text-white uppercase">
                DAET <span className="font-light text-slate-500 font-sans tracking-normal lowercase">workbench</span>
              </h1>
            </div>
          </div>
        </div>
        {/* RIGHT REGION */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-sm border border-slate-900 bg-slate-950">
            <Sparkles 
              size={12} 
              className={aiLoading ? 'text-blue-400 animate-spin' : 'text-slate-500'} 
            />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${aiLoading ? 'text-blue-400' : 'text-slate-400'}`}>
              {aiLoading ? 'NEURAL_ENGINE_ACTIVE' : 'MODEL_READY'}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-900 hidden md:block" />
          <ReportGenerator
            datasetData={datasetData}
            aiResults={aiResults}
            validationResult={validationResult}
            estimationResult={estimationResult}
            outlierResult={outlierResult}
            duplicateResult={duplicateResult}
            analyticsViewData={analyticsViewData}
          />
          <div className="h-4 w-px bg-slate-900" />
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-sm border border-red-900/30 bg-red-950/10 px-3 py-1 text-[11px] font-bold text-red-400 uppercase tracking-wide transition hover:bg-red-950/30 hover:border-red-900/60 active:scale-[0.98]"
          >
            <LogOut size={13} className="text-red-400" />
            Terminate
          </button>
        </div>
      </div>
    </header>
  );
}