import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell
} from "recharts";

// Professional divergent & sequential palette for analytical clarity
const COLORS = [
  "#6366f1", "#4f46e5", "#4338ca", "#3730a3", 
  "#312e81", "#1e1b4b", "#4338ca", "#5850ec"
];

/**
 * Technical Tooltip
 * High-density information display using monospaced fonts for precision.
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 shadow-2xl p-3 rounded-md backdrop-blur-md opacity-95">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-800 pb-1">
          Categorical Audit
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-8">
            <span className="text-xs text-slate-400 font-medium">Dimension:</span>
            <span className="text-xs font-bold text-white tracking-tight">{payload[0].name}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-xs text-slate-400 font-medium">Magnitude:</span>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {payload[0].value.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const PieChartComponent = ({ data, nameKey = "label", dataKey = "count" }) => {
  if (!data || data.length === 0) return null;

  return (
    /* Removed fixed h-96, p-4, background, and rounded corners to make it fully dynamic */
    <div className="w-full h-full min-h-[250px] relative transition-all duration-300">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            nameKey={nameKey}
            dataKey={dataKey}
            cx="50%"
            cy="50%"
            innerRadius="65%"  // Percentage-based for dynamic container scaling
            outerRadius="90%"
            paddingAngle={2}    // Reduced for a more "continuous" statistical look
            stroke="#ffffff"    // Subtle separation for overlapping dark modes
            strokeWidth={1}
            animationBegin={0}
            animationDuration={800}
            className="outline-none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="hover:saturate-150 transition-all cursor-crosshair outline-none"
              />
            ))}
          </Pie>

          <Tooltip 
            content={<CustomTooltip />} 
            animationDuration={200}
          />
          
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="rect" // More professional "block" style than circle
            iconSize={10}
            formatter={(value) => (
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] ml-1">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;