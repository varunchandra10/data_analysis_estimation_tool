import React from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
  Line,
  Label
} from "recharts";

/**
 * Technical Tooltip
 * High-density information display using monospaced fonts for scalar values.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 shadow-2xl p-3 rounded-md backdrop-blur-md opacity-95">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-800 pb-1">
          Data Point Audit
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-8">
            <span className="text-xs text-slate-400 font-medium">Index:</span>
            <span className="text-xs font-mono font-bold text-white tracking-tighter">{label}</span>
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

const LineChartComponent = ({ data, xKey = "index", yKey = "value", color = "#6366f1" }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-full min-h-[400px] p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative group">
      
      {/* LAB OVERLAY METADATA */}
      <div className="absolute top-4 right-6 flex items-center gap-4 z-10 pointer-events-none">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Interpolation</span>
          <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">MONOTONE_CUBIC</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 25, right: 10, left: 15, bottom: 20 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Scientific Grid: Bi-directional dotted lines for better eyeball estimation */}
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
          >
            <Label 
              value="Temporal/Index Sequence" 
              offset={-15} 
              position="insideBottom" 
              className="text-[10px] font-black uppercase tracking-[0.2em] fill-slate-400" 
            />
          </XAxis>

          <YAxis 
            axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }} 
            tickLine={{ stroke: '#94a3b8' }} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}
            dx={-5}
          >
            <Label 
              value="Scalar Magnitude" 
              angle={-90} 
              position="insideLeft" 
              offset={-10} 
              style={{ textAnchor: 'middle' }} 
              className="text-[10px] font-black uppercase tracking-[0.2em] fill-slate-400" 
            />
          </YAxis>

          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }} 
            animationDuration={200}
          />

          {/* Shaded Area: Lower opacity for professional subtlety */}
          <Area
            type="monotone"
            dataKey={yKey}
            stroke="none"
            fill="url(#lineGradient)"
            animationDuration={1500}
          />

          {/* Precise Line Component */}
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2} // Slightly thinner for "precision" feel
            dot={false}
            activeDot={{ 
              r: 4, 
              stroke: color, 
              strokeWidth: 2, 
              fill: '#fff',
              className: "shadow-md" 
            }}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;