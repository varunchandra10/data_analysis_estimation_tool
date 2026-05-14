import React from "react";
import { Info, BarChart2, ArrowDown, ArrowUp, Activity } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon size={16} />
      </div>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
    <div className="text-xl font-bold text-gray-800 dark:text-gray-100 font-mono">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
  </div>
);

const BoxPlotComponent = ({ stats }) => {
  if (!stats) return null;

  // Calculate percentage positions for the visual whisker
  const range = stats.max - stats.min;
  const getPos = (val) => ((val - stats.min) / range) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mt-8">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-purple-600" size={20} />
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Statistical Distribution</h3>
        </div>
        <div className="group relative">
          <Info size={16} className="text-gray-400 cursor-help" />
          <div className="absolute right-0 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            Box plot showing the Five-Number Summary: Min, Q1, Median, Q3, and Max.
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Visual Box Plot Representation */}
        <div className="relative h-24 mb-12 flex items-center">
          {/* Main Whisker Line */}
          <div className="absolute w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
          
          {/* IQR Box */}
          <div 
            className="absolute h-8 bg-purple-500/20 border-2 border-purple-500 rounded-sm"
            style={{ 
              left: `${getPos(stats.q1)}%`, 
              width: `${getPos(stats.q3) - getPos(stats.q1)}%` 
            }}
          />

          {/* Median Line */}
          <div 
            className="absolute h-12 w-1 bg-purple-600 rounded-full z-10 shadow-[0_0_10px_rgba(147,51,234,0.5)]"
            style={{ left: `${getPos(stats.median)}%` }}
          />

          {/* Labels for Visuals */}
          <div className="absolute top-16 w-full flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            <span style={{ position: 'absolute', left: '0%' }}>Min</span>
            <span style={{ position: 'absolute', left: `${getPos(stats.q1)}%`, transform: 'translateX(-50%)' }}>Q1</span>
            <span style={{ position: 'absolute', left: `${getPos(stats.median)}%`, transform: 'translateX(-50%)' }} className="text-purple-600">Median</span>
            <span style={{ position: 'absolute', left: `${getPos(stats.q3)}%`, transform: 'translateX(-50%)' }}>Q3</span>
            <span style={{ position: 'absolute', left: '100%', transform: 'translateX(-100%)' }}>Max</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Minimum" value={stats.min} icon={ArrowDown} colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30" />
          <StatCard label="Q1 (25%)" value={stats.q1} icon={Activity} colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30" />
          <StatCard label="Median" value={stats.median} icon={BarChart2} colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30" />
          <StatCard label="Q3 (75%)" value={stats.q3} icon={Activity} colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30" />
          <StatCard label="Maximum" value={stats.max} icon={ArrowUp} colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30" />
          <StatCard label="IQR" value={stats.iqr} icon={BarChart2} colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30" />
        </div>
      </div>
    </div>
  );
};

export default BoxPlotComponent;