import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell
} from "recharts";

// Modern color palette for categorical data
const COLORS = [
  "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", 
  "#ef4444", "#ec4899", "#06b6d4", "#84cc16"
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 shadow-xl rounded-lg">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
          {payload[0].name}
        </p>
        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
          Value: <span className="font-mono">{payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

const PieChartComponent = ({ data, nameKey = "label", dataKey = "count" }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-96 p-4 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            nameKey={nameKey}
            dataKey={dataKey}
            cx="50%"
            cy="50%"
            innerRadius={70}  // Makes it a Donut Chart
            outerRadius={100}
            paddingAngle={5}  // Spacing between segments
            stroke="none"     // Removes white borders
            animationBegin={0}
            animationDuration={1200}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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