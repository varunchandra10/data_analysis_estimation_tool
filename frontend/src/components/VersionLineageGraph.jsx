import React, { useEffect, useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Scale, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  RotateCcw,
  Activity
} from 'lucide-react';
import { useVersioning } from '../hooks/useVersioning';
import InfoTooltip from './UI/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';

const STAGE_CONFIGS = {
  raw: {
    label: 'Intake',
    icon: Database,
    colorClass: 'text-blue-400 border-blue-500/20 bg-blue-500/5 hover:border-blue-500/60',
    dotColor: 'bg-blue-400',
    title: 'Raw Data Ingestion'
  },
  clean: {
    label: 'Cleaning',
    icon: Sparkles,
    colorClass: 'text-teal-400 border-teal-500/20 bg-teal-500/5 hover:border-teal-500/60',
    dotColor: 'bg-teal-400',
    title: 'Missing Value Imputation'
  },
  cleaned: {
    label: 'Cleaning',
    icon: Sparkles,
    colorClass: 'text-teal-400 border-teal-500/20 bg-teal-500/5 hover:border-teal-500/60',
    dotColor: 'bg-teal-400',
    title: 'Missing Value Imputation'
  },
  outlier: {
    label: 'Outliers',
    icon: AlertTriangle,
    colorClass: 'text-amber-400 border-amber-500/20 bg-amber-500/5 hover:border-amber-500/60',
    dotColor: 'bg-amber-400',
    title: 'Anomaly & Outlier Removal'
  },
  outliers: {
    label: 'Outliers',
    icon: AlertTriangle,
    colorClass: 'text-amber-400 border-amber-500/20 bg-amber-500/5 hover:border-amber-500/60',
    dotColor: 'bg-amber-400',
    title: 'Anomaly & Outlier Removal'
  },
  validation: {
    label: 'Validation',
    icon: ShieldCheck,
    colorClass: 'text-rose-400 border-rose-500/20 bg-rose-500/5 hover:border-rose-500/60',
    dotColor: 'bg-rose-400',
    title: 'Logic Constraint validation'
  },
  validated: {
    label: 'Validation',
    icon: ShieldCheck,
    colorClass: 'text-rose-400 border-rose-500/20 bg-rose-500/5 hover:border-rose-500/60',
    dotColor: 'bg-rose-400',
    title: 'Logic Constraint validation'
  },
  estimation: {
    label: 'Weighting',
    icon: Scale,
    colorClass: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/60',
    dotColor: 'bg-indigo-400',
    title: 'Survey Weight Estimation'
  },
  estimated: {
    label: 'Weighting',
    icon: Scale,
    colorClass: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/60',
    dotColor: 'bg-indigo-400',
    title: 'Survey Weight Estimation'
  }
};

export default function VersionLineageGraph({
  datasetFiles = [],
  selectedFile,
  onSelectFile,
  activeVersionName,
  datasetName,
  onRollbackComplete
}) {
  const { getQuality, rollback } = useVersioning();
  const [qualities, setQualities] = useState({});
  const [rollbackLoading, setRollbackLoading] = useState(null);

  // Fetch quality scores for files in lineage
  useEffect(() => {
    if (!datasetName || datasetFiles.length === 0) return;
    
    datasetFiles.forEach(async (file) => {
      const vName = file.version || file.stage;
      try {
        const res = await getQuality(datasetName, vName);
        if (res && res.score != null) {
          setQualities(prev => ({ ...prev, [file.file_name]: res.score }));
        }
      } catch (err) {
        // Fallback or ignore
      }
    });
  }, [datasetFiles, datasetName, getQuality]);

  const handleNodeRollback = async (e, file) => {
    e.stopPropagation();
    const vName = file.version || file.stage;
    if (window.confirm(`Are you sure you want to rollback to ${vName}?`)) {
      setRollbackLoading(file.file_name);
      try {
        await rollback(datasetName, vName);
        if (onRollbackComplete) {
          onRollbackComplete(vName);
        }
      } catch (err) {
        alert(err.message || 'Rollback failed.');
      } finally {
        setRollbackLoading(null);
      }
    }
  };

  // Ensure stages sequence is clean
  const stagesList = ['raw', 'cleaned', 'outliers', 'validated', 'estimated'];

  return (
    <div className="w-full min-w-0 rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Pipeline Version Lineage Flow
            </h3>
            <InfoTooltip {...getTooltipContent('versionLineage')} iconSize={12} className="h-4 w-4" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Visual progression of data states from Raw ingestion to final weighted outputs. Click nodes to inspect.
          </p>
        </div>
        <div className="text-[10px] font-mono bg-slate-950 px-2 py-1 rounded border border-slate-900">
          <span className="text-slate-500 uppercase">Active Workspace State:</span>{' '}
          <InfoTooltip {...getTooltipContent('activeVersion')} iconSize={12} className="mr-1 inline-flex h-4 w-4 align-middle" />
          <span className="text-emerald-400 font-bold">{activeVersionName || 'N/A'}</span>
        </div>
      </div>

      <div className="relative flex min-w-0 flex-wrap items-center justify-center gap-4 overflow-x-hidden py-6 px-4 lg:flex-nowrap lg:justify-start lg:gap-3 xl:gap-4 lg:overflow-x-auto custom-scrollbar">
        {stagesList.map((stageName, idx) => {
          // Find matching file in datasetFiles
          const matchingFile = datasetFiles.find(
            f => (f.stage || f.file_name.split('_', 1)[0]) === stageName || 
                 (stageName === 'cleaned' && f.stage === 'clean') ||
                 (stageName === 'estimated' && f.stage === 'estimation') ||
                 (stageName === 'validated' && f.stage === 'validation') ||
                 (stageName === 'outliers' && f.stage === 'outlier')
          );
          
          const stepConfig = STAGE_CONFIGS[stageName] || STAGE_CONFIGS.raw;
          const Icon = stepConfig.icon;
          const isSelected = matchingFile && selectedFile === matchingFile.file_name;
          const isActive = matchingFile && activeVersionName === matchingFile.file_name.replace(/\.[^.]+$/, '');
          const score = matchingFile ? qualities[matchingFile.file_name] : null;

          return (
            <React.Fragment key={stageName}>
              {/* Node Card */}
              <div 
                onClick={() => matchingFile && onSelectFile(matchingFile)}
                className={`relative flex w-[min(100%,14rem)] flex-col items-center justify-between border rounded-xl p-4 transition-all duration-200 select-none cursor-pointer lg:w-44 lg:shrink-0 ${
                  matchingFile 
                    ? isSelected 
                      ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-lg shadow-indigo-500/10' 
                      : `${stepConfig.colorClass}`
                    : 'border-slate-800 bg-slate-900/10 opacity-40 cursor-not-allowed'
                }`}
              >
                {/* Active Indicator Pin */}
                {isActive && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-slate-950 items-center justify-center">
                      <CheckCircle2 size={9} className="text-white" />
                    </span>
                  </span>
                )}

                <div className="flex flex-col items-center gap-1.5 text-center">
                  <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                    <Icon size={16} />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {stepConfig.label}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-200 truncate w-36 max-w-full font-mono">
                    {matchingFile ? matchingFile.file_name : 'Pending Stage'}
                  </div>
                </div>

                {matchingFile && (
                  <div className="mt-3 w-full border-t border-slate-900 pt-2.5 flex items-center justify-between">
                    <div className="flex flex-col items-start">
                      <span className="inline-flex items-center gap-1 text-[8px] uppercase tracking-wide text-slate-500">Quality<InfoTooltip {...getTooltipContent('versionQuality')} iconSize={10} className="h-3.5 w-3.5" /></span>
                      <span className={`text-[10px] font-bold font-mono ${score != null && score >= 75 ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {score != null ? `${score}/100` : '--/100'}
                      </span>
                    </div>

                    {/* Rollback action */}
                    {!isActive && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleNodeRollback(e, matchingFile)}
                          disabled={rollbackLoading != null}
                          aria-label="Rollback active workspace to this state"
                          className="p-1 rounded text-slate-500 hover:text-amber-400 hover:bg-slate-950/60 border border-transparent hover:border-slate-800 transition-colors"
                        >
                          <RotateCcw size={11} className={rollbackLoading === matchingFile.file_name ? 'animate-spin' : ''} />
                        </button>
                        <InfoTooltip {...getTooltipContent('rollback')} iconSize={11} className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Connecting Line */}
              {idx < stagesList.length - 1 && (
                <div className="relative hidden h-0.5 w-10 shrink-0 bg-slate-800 lg:block self-center">
                  {matchingFile && (
                    <div className={`absolute inset-0 ${stepConfig.dotColor} opacity-20`} />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
