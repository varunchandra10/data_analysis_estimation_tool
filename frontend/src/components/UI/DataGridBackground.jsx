import React from "react";

const DataGridBackground = () => {
  return (
    /* Opacity explicitly configured to create clear distinction between structural lines and values */
    <div className="absolute inset-0 opacity-25 pointer-events-none mix-blend-screen z-0 overflow-hidden">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Expanded pattern canvas to handle a rich block of varied data columns and messy data entries seamlessly */}
          <pattern id="infinite-matrix-pattern" width="480" height="152" patternUnits="userSpaceOnUse">
            {/* Perfect structural grid mapping lines - Increased stroke weight/brightness contrast */}
            <path 
              d="M 480 0 L 0 0 0 152 M 120 0 L 120 152 M 240 0 L 240 152 M 360 0 L 360 152 M 0 38 L 480 38 M 0 76 L 480 76 M 0 114 L 480 114" 
              fill="none" 
              stroke="#64748b" 
              strokeWidth="1.2" 
            />
            
            {/* Matrix Text Engine - Softened text color properties to reduce raw word values visibility */}
            <g fill="#475569" className="text-[10px] font-mono select-none">
              {/* --- BLOCK SECTION 1 (0px - 120px Width) --- */}
              <text x="12" y="24" fill="#334155">idx_001</text>
              <text x="12" y="62">4.1029</text>
              <text x="12" y="100" fill="#991b1b" className="font-bold">NaN</text>
              <text x="12" y="138">"A_01"</text>

              {/* --- BLOCK SECTION 2 (120px - 240px Width) --- */}
              <text x="132" y="24" fill="#854d0e" className="font-bold">NULL</text>
              <text x="132" y="62" fill="#1e40af" className="font-bold">0.0041</text>
              <text x="132" y="100">0.9200</text>
              <text x="132" y="138" fill="#991b1b" className="font-bold">""</text>

              {/* --- BLOCK SECTION 3 (240px - 360px Width) --- */}
              <text x="252" y="24">"usr_91"</text>
              <text x="252" y="62" fill="#991b1b" className="font-bold">9999.00</text>
              <text x="252" y="100" fill="#854d0e" className="font-bold">"100.0%"</text>
              <text x="252" y="138">0.1268</text>

              {/* --- BLOCK SECTION 4 (360px - 480px Width) --- */}
              <text x="372" y="24" fill="#991b1b" className="font-bold">NaN</text>
              <text x="372" y="62">0.0031</text>
              <text x="372" y="100" fill="#854d0e" className="font-bold">INF</text>
              <text x="372" y="138" fill="#1e40af" className="font-bold">&lt;0.001</text>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#infinite-matrix-pattern)" />
      </svg>
    </div>
  );
};

export default DataGridBackground;