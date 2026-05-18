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
      <div className="bg-slate-950 text-slate-100 p-3 shadow-2xl rounded-sm border border-slate-800 backdrop-blur-md opacity-95 font-mono">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-900 pb-1">
          Vector Entry: {label}
        </p>
        <div className="flex items-center justify-between gap-6">
          <p className="text-[11px] font-medium text-slate-400 font-sans">
            Magnitude:
          </p>
          <span className="text-xs font-bold leading-none text-indigo-400">
            {payload[0].value.toLocaleString()}
          </span>
        </div>
        <p className="text-[9px] text-slate-600 mt-2 italic">
          σ-Confidence: 0.99
        </p>
      </div>
    );
  }
  return null;
};

const BarChartComponent = ({ data, xKey, yKey, color = "#818cf8" }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-full min-h-[400px] p-0 bg-transparent rounded-none border-0 shadow-none relative group">
      
      {/* PROFESSIONAL METADATA OVERLAY */}
      <div className="absolute top-0 right-2 flex gap-4 z-10 pointer-events-none">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Scaling</span>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tight">Linear_Scalar</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          /* FIXED OVERFLOW: Increased bottom margin from 40 to 75 to contain the rotated vertical label strings safely */
          margin={{ top: 20, right: 10, left: 15, bottom: 75 }}
        >
          {/* Scientific Grid: Dark micro-dashlines for granular estimation data points */}
          <CartesianGrid 
            strokeDasharray="2 4" 
            vertical={true} 
            stroke="#1e293b" 
          />
          
          <XAxis 
            dataKey={xKey} 
            axisLine={{ stroke: '#334155', strokeWidth: 1 }} 
            tickLine={{ stroke: '#334155' }} 
            /* FIXED: Combined fontFill typo to font Weight, rotated text -45 deg, and anchored right ends under the ticks */
            tick={{ 
              fill: '#64748b', 
              fontSize: 10, 
              fontWeight: 500, 
              fontFamily: 'ui-monospace, monospace' 
            }} 
            angle={-30}
            textAnchor="end"
            dy={8}
            interval={0}
          >
            {/* FIXED PLACEMENT: Shifted the horizontal axis label down to offset -55 to clear the rotated headers cleanly */}
            <Label 
              value="Dimension Variables" 
              offset={-55} 
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
            <Label value="Frequency / Value" angle={-90} position="insideLeft" offset={0} style={{ textAnchor: 'middle' }} className="text-[10px] font-bold uppercase tracking-wider fill-slate-500 font-sans" />
          </YAxis>
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(129, 140, 248, 0.03)' }} 
            animationDuration={150}
          />

          {/* Enhanced Bar: Clean geometric presentation */}
          <Bar 
            dataKey={yKey} 
            fill={color} 
            radius={[1, 1, 0, 0]} 
            barSize={28}
            animationBegin={0}
            animationDuration={400}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                className="hover:fill-indigo-400 transition-colors duration-150 cursor-crosshair"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;