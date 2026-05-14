import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
  Defs,
  LinearGradient,
  Stop
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 shadow-xl rounded-lg">
        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Index: {label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
            Value: <span className="font-mono">{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const LineChartComponent = ({ data, xKey = "index", yKey = "value", color = "#6366f1" }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-96 p-4 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          {/* Defined Gradient for the Line/Area fill */}
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

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
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '5 5' }} 
          />

          {/* Area Fill for a more modern "Glass" look */}
          <Area
            type="monotone"
            dataKey={yKey}
            stroke="none"
            fill="url(#lineGradient)"
            animationDuration={1500}
          />

          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={3}
            dot={false}
            activeDot={{ 
              r: 6, 
              stroke: '#fff', 
              strokeWidth: 2, 
              fill: color,
              className: "shadow-lg" 
            }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;