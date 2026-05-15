import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Label
} from "recharts";

/**
 * Technical Tooltip
 * High-density information display using monospaced fonts for coordinate precision.
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 shadow-2xl p-3 rounded-md backdrop-blur-md opacity-95">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-1">
            Coordinate Audit
          </p>
          <div className="flex justify-between gap-8">
            <span className="text-xs text-slate-400 font-medium tracking-tight">Abscissa (X):</span>
            <span className="text-xs font-mono font-bold text-white">
              {payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-xs text-slate-400 font-medium tracking-tight">Ordinate (Y):</span>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {payload[1].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ScatterChartComponent = ({ data, xKey = "x", yKey = "y", color = "#6366f1" }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-full min-h-[400px] p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative group">
      
      {/* PROFESSIONAL METADATA OVERLAY */}
      <div className="absolute top-4 right-6 flex gap-4 z-10 pointer-events-none">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Scale Type</span>
          <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">LINEAR_BIVARIATE</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 25, right: 20, bottom: 20, left: 10 }}>
          {/* Scientific Grid: Full cross-hatching for easier eyeballing of values */}
          <CartesianGrid 
            strokeDasharray="1 4" 
            stroke="#cbd5e1" 
            className="dark:stroke-slate-800" 
          />
          
          <XAxis 
            type="number" 
            dataKey={xKey} 
            name="Independent Variable" 
            axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
            tickLine={{ stroke: '#94a3b8' }}
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}
            dy={10}
          >
            <Label 
              value="Explanatory Dimension (X)" 
              offset={-15} 
              position="insideBottom" 
              className="text-[10px] font-black uppercase tracking-[0.2em] fill-slate-400" 
            />
          </XAxis>
          
          <YAxis 
            type="number" 
            dataKey={yKey} 
            name="Dependent Variable" 
            axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
            tickLine={{ stroke: '#94a3b8' }}
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}
          >
            <Label 
              value="Response Magnitude (Y)" 
              angle={-90} 
              position="insideLeft" 
              offset={-5} 
              style={{ textAnchor: 'middle' }} 
              className="text-[10px] font-black uppercase tracking-[0.2em] fill-slate-400" 
            />
          </YAxis>

          <ZAxis type="number" range={[60, 200]} />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ strokeDasharray: '4 4', stroke: '#6366f1', strokeWidth: 1 }} 
            animationDuration={200}
          />
          
          <Scatter 
            name="Observed Values" 
            data={data} 
            fill={color}
            line={false}
            animationDuration={1200}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fillOpacity={0.4}
                stroke={color}
                strokeWidth={1.5}
                className="hover:fill-opacity-100 hover:stroke-indigo-400 transition-all duration-200 cursor-crosshair"
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterChartComponent;