import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell
} from "recharts";

// HIGH DIFFERENTIABILITY PALETTE
// index 0 = Missing Data (Rose/Crimson Warning)
// index 1 = Available Data (Clean Slate/Indigo Core)
const PALETTE_MAPPING = {
  "Missing": "#f43f5e",   // Rose 500
  "Available": "#3b82f6"  // Blue 500
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-slate-800 shadow-2xl p-3 rounded-sm backdrop-blur-md opacity-95 font-mono">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-900 pb-1">
          Categorical Audit
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-8">
            <span className="text-[11px] text-slate-400 font-sans font-medium">Dimension:</span>
            <span className="text-xs font-bold text-slate-200 tracking-tight">{payload[0].name}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-[11px] text-slate-400 font-sans font-medium">Magnitude:</span>
            <span className="text-xs font-bold font-mono text-slate-200">
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
    <div className="w-full h-full min-h-[250px] relative transition-all duration-300 flex flex-col justify-start items-start">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            nameKey={nameKey}
            dataKey={dataKey}
            cx="50%"
            cy="45%" 
            innerRadius="65%"  
            outerRadius="90%"
            paddingAngle={2} 
            stroke="#0f172a"   
            strokeWidth={2}
            animationBegin={0}
            animationDuration={400}
            className="outline-none"
          >
            {data.map((entry, index) => {
              const segmentName = entry[nameKey];
              // Fallback to palette sequence if name matching isn't explicitly found
              const sliceColor = PALETTE_MAPPING[segmentName] || (index === 0 ? "#f43f5e" : "#3b82f6");
              
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={sliceColor} 
                  className="hover:opacity-90 transition-all cursor-crosshair outline-none"
                />
              );
            })}
          </Pie>

          <Tooltip 
            content={<CustomTooltip />} 
            animationDuration={150}
          />
          
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="rect" 
            iconSize={8}
            wrapperStyle={{ bottom: 0, left: 0, width: '100%' }}
            formatter={(value) => (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 font-sans">
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