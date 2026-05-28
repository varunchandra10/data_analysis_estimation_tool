import React from "react";
import { useTheme } from "../../context/ThemeContext";

const DataGridBackground = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30 dark:opacity-[0.22] mix-blend-multiply dark:mix-blend-screen transition-all duration-500"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Expanded pattern canvas to handle a rich block of varied data columns and messy data entries seamlessly */}
          <pattern id="infinite-matrix-pattern" width="480" height="152" patternUnits="userSpaceOnUse">
            {/* Perfect structural grid mapping lines - Theme responsive stroke dynamics */}
            <path 
              d="M 480 0 L 0 0 0 152 M 120 0 L 120 152 M 240 0 L 240 152 M 360 0 L 360 152 M 0 38 L 480 38 M 0 76 L 480 76 M 0 114 L 480 114" 
              fill="none" 
              stroke={isDark ? "#334155" : "#cbd5e1"} 
              strokeWidth={isDark ? "1" : "1.2"} 
              className="transition-all duration-500"
            />
            
            {/* Matrix Text Engine - Utilizing precise theme-aware color sets */}
            <g 
              fill={isDark ? "#475569" : "#64748b"} 
              className="text-[10px] font-mono select-none transition-all duration-500"
            >
              {/* --- BLOCK SECTION 1 (0px - 120px Width) --- */}
              <text x="12" y="24" fill={isDark ? "#94a3b8" : "#334155"}>idx_001</text>
              <text x="12" y="62">4.1029</text>
              <text x="12" y="100" fill={isDark ? "#f87171" : "#b91c1c"} className="font-bold">NaN</text>
              <text x="12" y="138">"A_01"</text>

              {/* --- BLOCK SECTION 2 (120px - 240px Width) --- */}
              <text x="132" y="24" fill={isDark ? "#fbbf24" : "#a16207"} className="font-bold">NULL</text>
              <text x="132" y="62" fill={isDark ? "#60a5fa" : "#1d4ed8"} className="font-bold">0.0041</text>
              <text x="132" y="100">0.9200</text>
              <text x="132" y="138" fill={isDark ? "#f87171" : "#b91c1c"} className="font-bold">""</text>

              {/* --- BLOCK SECTION 3 (240px - 360px Width) --- */}
              <text x="252" y="24">"usr_91"</text>
              <text x="252" y="62" fill={isDark ? "#f87171" : "#b91c1c"} className="font-bold">9999.00</text>
              <text x="252" y="100" fill={isDark ? "#fbbf24" : "#a16207"} className="font-bold">"100.0%"</text>
              <text x="252" y="138">0.1268</text>

              {/* --- BLOCK SECTION 4 (360px - 480px Width) --- */}
              <text x="372" y="24" fill={isDark ? "#f87171" : "#b91c1c"} className="font-bold">NaN</text>
              <text x="372" y="62">0.0031</text>
              <text x="372" y="100" fill={isDark ? "#fbbf24" : "#a16207"} className="font-bold">INF</text>
              <text x="372" y="138" fill={isDark ? "#60a5fa" : "#1d4ed8"} className="font-bold">&lt;0.001</text>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#infinite-matrix-pattern)" />
      </svg>
    </div>
  );
};

export default DataGridBackground;