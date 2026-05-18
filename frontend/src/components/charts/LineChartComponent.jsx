import React from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
  Label
} from "recharts";

/**
 * Technical Tooltip
 * High-density information display using monospaced fonts for scalar values.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-slate-800 shadow-2xl p-3 rounded-md backdrop-blur-md opacity-95 font-mono border-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-900 pb-1">
          Data Point Audit
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-8">
            <span className="text-xs text-slate-400 font-medium font-sans">Index:</span>
            <span className="text-xs font-mono font-bold text-slate-200 tracking-tight">{label}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-xs text-slate-400 font-medium font-sans">Magnitude:</span>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {payload[0].value.toLocaleString()}
            </span>
          </div>
        </div>
        <p className="text-[9px] text-slate-600 mt-2 font-mono uppercase tracking-wide">Stream Stabilized</p>
      </div>
    );
  }
  return null;
};

const LineChartComponent = ({ data, xKey = "index", yKey = "value", color = "#6366f1" }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-full min-h-[400px] p-0 bg-transparent rounded-none border-0 shadow-none relative group">
      
      {/* LAB OVERLAY METADATA */}
      <div className="absolute top-0 right-2 flex items-center gap-4 z-10 pointer-events-none">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider leading-none mb-1">Interpolation</span>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tight">MONOTONE_CUBIC</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        {/* FIXED: Using unified AreaChart container to manage area boundaries and precision strokes collectively */}
        <AreaChart data={data} margin={{ top: 25, right: 15, left: 15, bottom: 35 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.18} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Scientific Grid: Bi-directional dotted lines for better eyeball estimation */}
          <CartesianGrid 
            strokeDasharray="2 4" 
            vertical={true} 
            stroke="#1e293b" 
          />

          <XAxis 
            dataKey={xKey} 
            axisLine={{ stroke: '#334155', strokeWidth: 1 }} 
            tickLine={{ stroke: '#334155' }} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500, fontFamily: 'ui-monospace, monospace' }}
            dy={8}
            textAnchor="middle"
          >
            <Label 
              value="Temporal/Index Sequence" 
              offset={-20} 
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
            <Label 
              value="Scalar Magnitude" 
              angle={-90} 
              position="insideLeft" 
              offset={0} 
              style={{ textAnchor: 'middle' }} 
              className="text-[10px] font-bold uppercase tracking-wider fill-slate-500 font-sans" 
            />
          </YAxis>

          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }} 
            animationDuration={150}
          />

          {/* Shaded Area with Precise Integrated Stroke Framework */}
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={1.75}
            fill="url(#lineGradient)"
            activeDot={{ 
              r: 4, 
              stroke: color, 
              strokeWidth: 2, 
              fill: '#0f172a',
            }}
            animationBegin={0}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;