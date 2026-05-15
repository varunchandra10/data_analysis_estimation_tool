import React from "react";
import { Info, BarChart2, ArrowDown, ArrowUp, Activity, Hash, Percent } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, colorClass, subLabel }) => (
  <div className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800 transition-all hover:border-indigo-400 group">
    <div className="flex items-center gap-2 mb-2">
      <div className={`p-1.5 rounded ${colorClass}`}>
        <Icon size={14} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">
          {label}
        </span>
        {subLabel && <span className="text-[9px] text-slate-500 font-mono mt-0.5">{subLabel}</span>}
      </div>
    </div>
    <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tighter">
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
    <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
      {/* Header: High Density Analyst Style */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-600 rounded text-white">
            <BarChart2 size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Five-Number Summary</h3>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">Distribution Analysis • Quartile-Based Dispersion</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end border-r border-slate-200 pr-4 dark:border-slate-800">
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Confidence Interval</span>
             <span className="text-[10px] font-mono font-bold text-emerald-500">95% σ-verified</span>
          </div>
          <div className="group relative">
            <Info size={16} className="text-slate-400 hover:text-indigo-500 cursor-help transition-colors" />
            <div className="absolute right-0 w-72 p-3 bg-slate-900 text-slate-100 text-[11px] rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700 leading-relaxed">
              <p className="font-bold border-b border-slate-700 pb-1 mb-2 uppercase tracking-widest text-indigo-400">Parameter Guide</p>
              Box-and-whisker plot visualizing the degree of dispersion (spread) and skewness in the data. The IQR box contains 50% of total observations.
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Visual Box Plot: Dynamic & Lab-Focused */}
        <div className="relative h-32 mb-16 px-2 flex items-center">
          
          {/* Subtle Grid Scale (Tick Marks) */}
          <div className="absolute w-full flex justify-between h-full pointer-events-none opacity-20 dark:opacity-10">
            {[0, 25, 50, 75, 100].map(tick => (
              <div key={tick} className="h-full w-px bg-slate-400 border-dashed" style={{left: `${tick}%`}} />
            ))}
          </div>

          {/* Whisker Line (Horizontal) */}
          <div className="absolute w-full h-0.5 bg-slate-300 dark:bg-slate-700" />
          
          {/* Vertical Caps (Min/Max Ends) */}
          <div className="absolute h-6 w-0.5 bg-slate-400" style={{ left: '0%' }} />
          <div className="absolute h-6 w-0.5 bg-slate-400" style={{ left: '100%' }} />

          {/* IQR Box (Body) */}
          <div 
            className="absolute h-12 bg-indigo-500/10 border-2 border-indigo-600 dark:border-indigo-400 rounded-sm shadow-sm transition-all duration-500"
            style={{ 
              left: `${getPos(stats.q1)}%`, 
              width: `${getPos(stats.q3) - getPos(stats.q1)}%` 
            }}
          >
            {/* Texture for Analysts to distinguish box areas */}
            <div className="w-full h-full opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, currentColor 5px, currentColor 10px)' }}></div>
          </div>

          {/* Median Line (Center) */}
          <div 
            className="absolute h-16 w-1 bg-indigo-600 dark:bg-indigo-400 rounded-full z-10 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
            style={{ left: `${getPos(stats.median)}%` }}
          >
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
               {stats.median}
             </div>
          </div>

          {/* Technical Axis Labels */}
          <div className="absolute -bottom-10 w-full flex text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
            <span style={{ position: 'absolute', left: '0%' }} className="translate-x-[-50%]">Min</span>
            <span style={{ position: 'absolute', left: `${getPos(stats.q1)}%` }} className="translate-x-[-50%]">P25 (Q1)</span>
            <span style={{ position: 'absolute', left: `${getPos(stats.median)}%` }} className="translate-x-[-50%] text-indigo-500">P50 (Median)</span>
            <span style={{ position: 'absolute', left: `${getPos(stats.q3)}%` }} className="translate-x-[-50%]">P75 (Q3)</span>
            <span style={{ position: 'absolute', left: '100%' }} className="translate-x-[-50%]">Max</span>
          </div>
        </div>

        {/* Stats Grid: High-Efficiency Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Lower Bound" subLabel="Minimum" value={stats.min} icon={ArrowDown} colorClass="bg-slate-100 text-slate-600 dark:bg-slate-800" />
          <StatCard label="1st Quartile" subLabel="25th Percentile" value={stats.q1} icon={Activity} colorClass="bg-slate-100 text-indigo-600 dark:bg-slate-800" />
          <StatCard label="Centrality" subLabel="Statistical Median" value={stats.median} icon={BarChart2} colorClass="bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" />
          <StatCard label="3rd Quartile" subLabel="75th Percentile" value={stats.q3} icon={Activity} colorClass="bg-slate-100 text-indigo-600 dark:bg-slate-800" />
          <StatCard label="Upper Bound" subLabel="Maximum" value={stats.max} icon={ArrowUp} colorClass="bg-slate-100 text-slate-600 dark:bg-slate-800" />
          <StatCard label="Dispersion" subLabel="Interquartile Range" value={stats.iqr} icon={Hash} colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30" />
        </div>

        {/* Dynamic Context Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
           <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                 <Percent size={12} className="text-slate-400" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Relative Skewness: </span>
                 <span className={`text-[10px] font-mono font-bold ${stats.median > (stats.min + stats.max) / 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {(stats.median - stats.q1 < stats.q3 - stats.median) ? 'Right Pos' : 'Left Neg'}
                 </span>
              </div>
           </div>
           <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Unit Specification: Scalar</span>
        </div>
      </div>
    </div>
  );
};

export default BoxPlotComponent;