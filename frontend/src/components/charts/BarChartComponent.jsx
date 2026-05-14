import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">{label}</p>
        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
          Value: <span className="font-mono">{payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

const BarChartComponent = ({ data, xKey, yKey, color = "#8b5cf6" }) => {
  // Check if data exists to prevent crashes
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-96 p-4 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          {/* Subtle Grid Lines */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#e5e7eb" 
            className="dark:stroke-gray-700" 
          />
          
          <XAxis 
            dataKey={xKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            dy={10}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
          />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} 
          />

          {/* Enhanced Bar with Rounded Corners and Gradient-like effect */}
          <Bar 
            dataKey={yKey} 
            fill={color} 
            radius={[6, 6, 0, 0]} 
            barSize={40}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fillOpacity={0.8} 
                className="hover:fill-opacity-100 transition-opacity duration-300 cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;