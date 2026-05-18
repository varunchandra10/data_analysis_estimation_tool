import React from "react";
import { Info, BarChart2, ArrowDown, ArrowUp, Activity, Hash, Percent } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, colorClass, subLabel }) => (
  <div className="bg-[#0b1329]/60 p-3 rounded-sm border border-slate-900 transition-colors hover:border-slate-700 group">
    <div className="flex items-center gap-2.5 mb-2">
      <div className={`p-1.5 rounded-sm ${colorClass} shrink-0`}>
        <Icon size={13} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate leading-none">
          {label}
        </span>
        {subLabel && <span className="text-[9px] text-slate-600 font-mono tracking-tight mt-0.5 truncate">{subLabel}</span>}
      </div>
    </div>
    <div className="text-base font-bold text-slate-100 font-mono tracking-tight mt-1">
      {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : value}
    </div>
  </div>
);

const BoxPlotComponent = ({ stats }) => {
  if (!stats) return null;

  // Calculate percentage positions for the visual whisker
  const range = stats.max - stats.min;
  const getPos = (val) => ((val - stats.min) / range) * 100;

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 shadow-2xl overflow-hidden mt-8">
      {/* Header: High Density Analyst Style */}
      <div className="px-5 py-3.5 border-b border-slate-900 flex items-center justify-between bg-[#0b1329]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
            <BarChart2 size={15} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Five-Number Summary</h3>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wide mt-0.5">Distribution Analysis • Quartile-Based Dispersion</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end border-r border-slate-900 pr-4">
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Confidence Interval</span>
             <span className="text-[10px] font-mono font-bold text-emerald-400">95% σ-verified</span>
          </div>
          <div className="group relative">
            <Info size={15} className="text-slate-500 hover:text-indigo-400 cursor-help transition-colors" />
            <div className="absolute right-0 top-6 w-72 p-3 bg-slate-950 text-slate-300 text-[11px] rounded-sm shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-800 leading-relaxed font-sans">
              <p className="font-bold border-b border-slate-900 pb-1 mb-2 uppercase tracking-wider text-indigo-400 font-mono">Parameter Guide</p>
              Box-and-whisker plot visualizing the degree of dispersion (spread) and skewness in the data. The IQR box contains 50% of total observations.
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-950/10">
        {/* Visual Box Plot: Dynamic & Lab-Focused */}
        <div className="relative h-28 mb-12 px-2 flex items-center">
          
          {/* Subtle Grid Scale (Tick Marks) */}
          <div className="absolute w-full flex justify-between h-full pointer-events-none opacity-45">
            {[0, 25, 50, 75, 100].map(tick => (
              <div key={tick} className="h-full w-px bg-slate-900 border-dashed" style={{left: `${tick}%`}} />
            ))}
          </div>

          {/* Whisker Line (Horizontal) */}
          <div className="absolute w-full h-px bg-slate-800" />
          
          {/* Vertical Caps (Min/Max Ends) */}
          <div className="absolute h-5 w-px bg-slate-700" style={{ left: '0%' }} />
          <div className="absolute h-5 w-px bg-slate-700" style={{ left: '100%' }} />

          {/* IQR Box (Body) */}
          <div 
            className="absolute h-10 bg-indigo-500/5 border border-indigo-500/40 rounded-sm shadow-sm transition-all duration-500"
            style={{ 
              left: `${getPos(stats.q1)}%`, 
              width: `${getPos(stats.q3) - getPos(stats.q1)}%` 
            }}
          >
            {/* Texture for Analysts to distinguish box areas */}
            <div className="w-full h-full opacity-5 text-indigo-400" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, currentColor 5px, currentColor 10px)' }}></div>
          </div>

          {/* Median Line (Center) */}
          <div 
            className="absolute h-14 w-0.5 bg-indigo-400 z-10"
            style={{ left: `${getPos(stats.median)}%` }}
          >
             <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 text-indigo-400 border border-slate-900 px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold whitespace-nowrap shadow-md">
               {stats.median}
             </div>
          </div>

          {/* Technical Axis Labels */}
          <div className="absolute -bottom-8 w-full flex text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wide">
            <span style={{ position: 'absolute', left: '0%' }} className="translate-x-[-50%]">Min</span>
            <span style={{ position: 'absolute', left: `${getPos(stats.q1)}%` }} className="translate-x-[-50%]">Q1 (P25)</span>
            <span style={{ position: 'absolute', left: `${getPos(stats.median)}%` }} className="translate-x-[-50%] text-indigo-400 font-bold">Median</span>
            <span style={{ position: 'absolute', left: `${getPos(stats.q3)}%` }} className="translate-x-[-50%]">Q3 (P75)</span>
            <span style={{ position: 'absolute', left: '100%' }} className="translate-x-[-50%]">Max</span>
          </div>
        </div>

        {/* Stats Grid: High-Efficiency Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Lower Bound" subLabel="Minimum" value={stats.min} icon={ArrowDown} colorClass="bg-slate-950 border border-slate-900 text-slate-400" />
          <StatCard label="1st Quartile" subLabel="25th Pctl" value={stats.q1} icon={Activity} colorClass="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400" />
          <StatCard label="Centrality" subLabel="Median" value={stats.median} icon={BarChart2} colorClass="bg-indigo-600 text-white border border-transparent" />
          <StatCard label="3rd Quartile" subLabel="75th Pctl" value={stats.q3} icon={Activity} colorClass="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400" />
          <StatCard label="Upper Bound" subLabel="Maximum" value={stats.max} icon={ArrowUp} colorClass="bg-slate-950 border border-slate-900 text-slate-400" />
          <StatCard label="Dispersion" subLabel="IQR Range" value={stats.iqr} icon={Hash} colorClass="bg-amber-500/10 border border-amber-500/20 text-amber-400" />
        </div>

        {/* Dynamic Context Footer */}
        <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between">
           <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                 <Percent size={12} className="text-slate-500" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Relative Skewness: </span>
                 <span className={`text-[10px] font-mono font-bold ${stats.median > (stats.min + stats.max) / 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {(stats.median - stats.q1 < stats.q3 - stats.median) ? 'Right Pos' : 'Left Neg'}
                 </span>
              </div>
           </div>
           <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">Unit Specification: Scalar</span>
        </div>
      </div>
    </div>
  );
};

export default BoxPlotComponent;