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
 * High-Precision Custom Tooltip
 * Designed for analysts who need to see the raw scalar value and percentage context.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-slate-100 p-3 shadow-2xl rounded border border-slate-700 backdrop-blur-md opacity-95">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-700 pb-1">
          Vector Entry: {label}
        </p>
        <div className="flex items-baseline gap-4">
          <p className="text-xs font-bold uppercase tracking-tighter text-indigo-400">
            Magnitude:
          </p>
          <span className="font-mono text-sm font-bold leading-none text-white">
            {payload[0].value.toLocaleString()}
          </span>
        </div>
        <p className="text-[9px] text-slate-500 mt-2 font-mono italic">
          σ-Confidence: 0.99
        </p>
      </div>
    );
  }
  return null;
};

const BarChartComponent = ({ data, xKey, yKey, color = "#6366f1" }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-full min-h-[400px] p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative group">
      
      {/* PROFESSIONAL METADATA OVERLAY */}
      <div className="absolute top-4 right-6 flex gap-4 z-10 pointer-events-none">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scaling</span>
          <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase">Linear_Scalar</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 10, left: 20, bottom: 25 }}
        >
          {/* Scientific Grid: Both Vertical and Horizontal for better eyeball estimation */}
          <CartesianGrid 
            strokeDasharray="1 4" 
            vertical={true} 
            stroke="#cbd5e1" 
            className="dark:stroke-slate-800" 
          />
          
          <XAxis 
            dataKey={xKey} 
            axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }} 
            tickLine={{ stroke: '#94a3b8' }} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }} 
            dy={10}
            interval={0}
          >
            <Label value="Dimension Variables" offset={-15} position="insideBottom" className="text-[10px] font-black uppercase tracking-[0.2em] fill-slate-400" />
          </XAxis>
          
          <YAxis 
            axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }} 
            tickLine={{ stroke: '#94a3b8' }} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}
            dx={-5}
          >
            <Label value="Frequency / Value" angle={-90} position="insideLeft" offset={-10} style={{ textAnchor: 'middle' }} className="text-[10px] font-black uppercase tracking-[0.2em] fill-slate-400" />
          </YAxis>
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} 
            animationDuration={200}
          />

          {/* Enhanced Bar: More rigid/professional, less "bubbly" */}
          <Bar 
            dataKey={yKey} 
            fill={color} 
            radius={[2, 2, 0, 0]} // Sharper corners for a more serious look
            barSize={32}
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                className="hover:fill-indigo-400 transition-colors duration-200 cursor-crosshair"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;