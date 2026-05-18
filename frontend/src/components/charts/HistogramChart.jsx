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
      <div className="bg-slate-950 border border-slate-800 shadow-2xl p-3 rounded-md backdrop-blur-md opacity-95 font-mono border-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-900 pb-1">
          Bin Interval Audit
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-8">
            <span className="text-xs text-slate-400 font-medium font-sans">Domain:</span>
            <span className="text-xs font-mono font-bold text-slate-200 tracking-tight">{label}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-xs text-slate-400 font-medium font-sans">Frequency (ƒ):</span>
            <span className="text-xs font-mono font-bold text-indigo-400">{payload[0].value.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-[9px] text-slate-600 mt-2 font-mono uppercase tracking-wide">Residual Verified</p>
      </div>
    );
  }
  return null;
};

const HistogramChart = ({ data, color = "#818cf8" }) => {
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
    <div className="w-full h-full min-h-[400px] p-0 bg-transparent rounded-none border-0 shadow-none relative group">
      
      {/* LAB METADATA OVERLAY */}
      <div className="absolute top-0 right-2 flex items-center gap-4 z-10 pointer-events-none">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Normalization</span>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tight">DENSITY_ESTIMATE</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={histogram} 
          /* FIXED CLIPPING: Expanded bottom padding boundary from 25 to 50 to clear multi-digit intervals */
          margin={{ top: 25, right: 10, left: 15, bottom: 50 }}
          barCategoryGap={1} // Standard for Histograms: minimal gaps represent continuous data
        >
          {/* Scientific Grid: High granularity vertical lines help eyeball the distribution skew */}
          <CartesianGrid 
            strokeDasharray="2 4" 
            vertical={true} 
            stroke="#1e293b" 
          />
          
          <XAxis 
            dataKey="range" 
            axisLine={{ stroke: '#334155', strokeWidth: 1 }} 
            tickLine={{ stroke: '#334155' }} 
            tick={{ fill: '#64748b', fontSize: 9, fontWeight: 500, fontFamily: 'ui-monospace, monospace' }}
            interval={0}
            /* Swiveled to clockwise 45 degrees to perfectly align string starting points with the ticks */
            angle={45}
            textAnchor="start"
            height={65}
            dy={8}
          >
            {/* FIXED PLACEMENT: Set deep -45 offset calculation to keep axis labels fully separated from step data lines */}
            <Label 
              value="Continuous Range Binning" 
              offset={-45} 
              position="insideBottom" 
              className="text-[10px] font-bold uppercase tracking-wider fill-slate-500 font-sans" 
            />
          </XAxis>
          
          <YAxis 
            axisLine={{ stroke: '#334155', strokeWidth: 1 }} 
            tickLine={{ stroke: '#334155' }} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500, fontFamily: 'ui-monospace, monospace' }}
            dx={-5}
          >
             <Label value="Frequency Count (n)" angle={-90} position="insideLeft" offset={0} style={{ textAnchor: 'middle' }} className="text-[10px] font-bold uppercase tracking-wider fill-slate-500 font-sans" />
          </YAxis>
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(129, 140, 248, 0.02)' }} 
            animationDuration={150}
          />

          <Bar 
            dataKey="count" 
            fill={color} 
            /* Light transparency backdrop mimics high-end probability charts */
            fillOpacity={0.25}
            animationBegin={0}
            animationDuration={400}
          >
            {histogram.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                stroke={color} 
                strokeWidth={1} 
                className="hover:fill-opacity-80 hover:stroke-slate-200 transition-all duration-150 cursor-crosshair"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistogramChart;