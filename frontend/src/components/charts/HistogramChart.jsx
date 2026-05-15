import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Label
} from "recharts";

/**
 * Technical Tooltip: Prioritizes data density and scalar precision.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 shadow-2xl p-3 rounded backdrop-blur-md opacity-95">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-800 pb-1">
          Bin Interval Audit
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-8">
            <span className="text-xs text-slate-400 font-medium">Domain:</span>
            <span className="text-xs font-mono font-bold text-white tracking-tighter">{label}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-xs text-slate-400 font-medium">Frequency (ƒ):</span>
            <span className="text-xs font-mono font-bold text-blue-400">{payload[0].value.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const HistogramChart = ({ data, color = "#2563eb" }) => {
  if (!data || data.length === 0) return null;

  const values = data.filter((v) => typeof v === "number");
  if (values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const bins = 12; // Increased bin count for better distribution granularity
  const binSize = (max - min) / bins || 1;

  const histogram = Array.from({ length: bins }, (_, i) => {
    const start = min + i * binSize;
    const end = start + binSize;
    const count = values.filter((v) => 
      i === bins - 1 ? v >= start && v <= max : v >= start && v < end
    ).length;

    return {
      range: `${start.toFixed(2)} - ${end.toFixed(2)}`,
      count,
    };
  });

  return (
    <div className="w-full h-full min-h-[400px] p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative group">
      
      {/* LAB METADATA OVERLAY */}
      <div className="absolute top-4 right-6 flex items-center gap-4 z-10 pointer-events-none">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Normalization</span>
          <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">DENSITY_ESTIMATE</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={histogram} 
          margin={{ top: 25, right: 10, left: 10, bottom: 25 }}
          barCategoryGap={1} // Standard for Histograms: minimal gaps represent continuous data
        >
          {/* Scientific Grid: High granularity vertical lines help eyeball the distribution skew */}
          <CartesianGrid 
            strokeDasharray="1 4" 
            vertical={true} 
            stroke="#cbd5e1" 
            className="dark:stroke-slate-800" 
          />
          
          <XAxis 
            dataKey="range" 
            axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }} 
            tickLine={{ stroke: '#94a3b8' }} 
            tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}
            interval={1}
            angle={-30}
            textAnchor="end"
            height={60}
          >
            <Label value="Continuous Range Binning" offset={-20} position="insideBottom" className="text-[10px] font-black uppercase tracking-[0.2em] fill-slate-400" />
          </XAxis>
          
          <YAxis 
            axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }} 
            tickLine={{ stroke: '#94a3b8' }} 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}
          >
             <Label value="Frequency Count (n)" angle={-90} position="insideLeft" offset={0} style={{ textAnchor: 'middle' }} className="text-[10px] font-black uppercase tracking-[0.2em] fill-slate-400" />
          </YAxis>
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} 
            animationDuration={150}
          />

          <Bar 
            dataKey="count" 
            fill={color} 
            fillOpacity={0.6}
            animationBegin={0}
            animationDuration={1000}
          >
            {histogram.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                stroke={color} 
                strokeWidth={1} 
                className="hover:fill-opacity-100 hover:stroke-white transition-all duration-200 cursor-crosshair"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistogramChart;