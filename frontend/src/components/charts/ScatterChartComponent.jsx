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
  Cell
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data Point</p>
          <div className="flex justify-between gap-8">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">X-Value:</span>
            <span className="text-sm font-mono font-bold text-gray-800 dark:text-gray-100">
              {payload[0].value.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Y-Value:</span>
            <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">
              {payload[1].value.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ScatterChartComponent = ({ data, xKey = "x", yKey = "y", color = "#8b5cf6" }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-96 p-4 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            className="dark:stroke-gray-700" 
          />
          
          <XAxis 
            type="number" 
            dataKey={xKey} 
            name="X Value" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            unit="" 
          />
          
          <YAxis 
            type="number" 
            dataKey={yKey} 
            name="Y Value" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />

          {/* ZAxis controls the range of the dot sizes */}
          <ZAxis type="number" range={[50, 400]} />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ strokeDasharray: '3 3', stroke: '#9ca3af' }} 
          />
          
          <Scatter 
            name="Dataset" 
            data={data} 
            fill={color}
            line={false}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fillOpacity={0.6}
                stroke={color}
                strokeWidth={1}
                className="hover:fill-opacity-100 hover:stroke-width-2 transition-all duration-200 cursor-crosshair"
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterChartComponent;