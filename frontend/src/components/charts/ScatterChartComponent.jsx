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
      <div className="bg-slate-950 border border-slate-800 shadow-2xl p-3 rounded-md backdrop-blur-md opacity-95 font-mono border-2">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-900 pb-1">
            Coordinate Audit
          </p>
          <div className="flex justify-between gap-8">
            <span className="text-xs text-slate-400 font-medium font-sans">Abscissa (X):</span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-xs text-slate-400 font-medium font-sans">Ordinate (Y):</span>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {payload[1].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <p className="text-[9px] text-slate-600 mt-1 font-mono uppercase tracking-wide">Residual Tracked</p>
      </div>
    );
  }
  return null;
};

const ScatterChartComponent = ({ data, xKey = "x", yKey = "y", color = "#6366f1" }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-full min-h-[400px] p-0 bg-transparent rounded-none border-0 shadow-none relative group">
      
      {/* PROFESSIONAL METADATA OVERLAY */}
      <div className="absolute top-0 right-2 flex gap-4 z-10 pointer-events-none">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider leading-none mb-1">Scale Type</span>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tight">LINEAR_BIVARIATE</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        {/* FIXED BOUNDS: Increased horizontal and bottom margin padding to support dense scientific coordinate scales */}
        <ScatterChart margin={{ top: 25, right: 20, bottom: 35, left: 15 }}>
          {/* Scientific Grid: Full cross-hatching for easier eyeballing of values */}
          <CartesianGrid 
            strokeDasharray="2 4" 
            stroke="#1e293b" 
          />
          
          <XAxis 
            type="number" 
            dataKey={xKey} 
            name="Independent Variable" 
            axisLine={{ stroke: '#334155', strokeWidth: 1 }}
            tickLine={{ stroke: '#334155' }}
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500, fontFamily: 'ui-monospace, monospace' }}
            dy={8}
          >
            <Label 
              value="Explanatory Dimension (X)" 
              offset={-20} 
              position="insideBottom" 
              className="text-[10px] font-bold uppercase tracking-wider fill-slate-500 font-sans" 
            />
          </XAxis>
          
          <YAxis 
            type="number" 
            dataKey={yKey} 
            name="Dependent Variable" 
            axisLine={{ stroke: '#334155', strokeWidth: 1 }}
            tickLine={{ stroke: '#334155' }}
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500, fontFamily: 'ui-monospace, monospace' }}
            dx={-5}
          >
            <Label 
              value="Response Magnitude (Y)" 
              angle={-90} 
              position="insideLeft" 
              offset={0} 
              style={{ textAnchor: 'middle' }} 
              className="text-[10px] font-bold uppercase tracking-wider fill-slate-500 font-sans" 
            />
          </YAxis>

          <ZAxis type="number" range={[60, 200]} />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ strokeDasharray: '4 4', stroke: '#334155', strokeWidth: 1 }} 
            animationDuration={150}
          />
          
          <Scatter 
            name="Observed Values" 
            data={data} 
            fill={color}
            line={false}
            animationBegin={0}
            animationDuration={400}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                /* Low transparency opacity reveals variance patterns across high-density clusters */
                fillOpacity={0.25}
                stroke={color}
                strokeWidth={1}
                className="hover:fill-opacity-80 hover:stroke-slate-200 transition-all duration-150 cursor-crosshair"
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterChartComponent;