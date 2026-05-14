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
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 shadow-xl rounded-lg">
        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Range</p>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Frequency: <span className="font-mono font-bold">{payload[0].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const HistogramChart = ({ data, color = "#3b82f6" }) => {
  if (!data || data.length === 0) return null;

  // Optimized Binning Logic
  const values = data.filter((v) => typeof v === "number");
  if (values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const bins = 10;
  const binSize = (max - min) / bins || 1; // Avoid division by zero

  const histogram = Array.from({ length: bins }, (_, i) => {
    const start = min + i * binSize;
    const end = start + binSize;
    const count = values.filter((v) => 
      i === bins - 1 ? v >= start && v <= max : v >= start && v < end
    ).length;

    return {
      range: `${start.toFixed(1)} - ${end.toFixed(1)}`,
      count,
    };
  });

  return (
    <div className="w-full h-96 p-4 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={histogram} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#e5e7eb" 
            className="dark:stroke-gray-700" 
          />
          
          <XAxis 
            dataKey="range" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={50}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />

          <Bar 
            dataKey="count" 
            fill="url(#barGradient)" 
            radius={[4, 4, 0, 0]}
            barSize={60}
          >
            {histogram.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                stroke={color} 
                strokeWidth={1} 
                fillOpacity={0.8}
                className="hover:fill-opacity-100 transition-opacity duration-300 cursor-crosshair"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistogramChart;