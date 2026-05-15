import React from "react";

const CorrelationHeatmap = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs font-bold uppercase tracking-widest">
        No correlation matrix data available
      </div>
    );
  }

  const variables = [
    ...new Set([
      ...data.map(d => d.x),
      ...data.map(d => d.y)
    ])
  ];

  const getValue = (x, y) => {
    const found = data.find(d => d.x === x && d.y === y);
    return found ? found.value : 0;
  };

  // ============================================
  // PROFESSIONAL DIVERGING COLOR SCALE
  // Indigo (Positive) -> Slate (Neutral) -> Rose (Negative)
  // ============================================
  const getColor = (value) => {
    // Perfect Correlation (Diagonal)
    if (value === 1) return "bg-indigo-600 text-white shadow-inner";
    
    // POSITIVE CORRELATIONS (INDIGO SCALE)
    if (value > 0.8) return "bg-indigo-500 text-white";
    if (value > 0.5) return "bg-indigo-400 text-white";
    if (value > 0.3) return "bg-indigo-200 text-indigo-900";
    if (value > 0.1) return "bg-indigo-50 text-indigo-800";

    // NEGATIVE CORRELATIONS (ROSE SCALE)
    if (value < -0.8) return "bg-rose-500 text-white";
    if (value < -0.5) return "bg-rose-400 text-white";
    if (value < -0.3) return "bg-rose-200 text-rose-900";
    if (value < -0.1) return "bg-rose-50 text-rose-800";

    // NEUTRAL / NO CORRELATION
    return "bg-slate-50 text-slate-400 dark:bg-slate-900/50";
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
      {/* HEADER CONTROLS */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
           <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Correlation Matrix: Pearson ρ</h3>
        </div>
        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter">Scale: [-1.0 : +1.0]</span>
      </div>

      <div className="overflow-auto custom-scrollbar">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="p-3 border-b border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 sticky left-0 top-0 z-30 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">
                Variables
              </th>
              {variables.map((variable, idx) => (
                <th
                  key={idx}
                  className="p-3 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold min-w-[100px] bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 sticky top-0 z-20 uppercase tracking-tighter"
                >
                  {variable}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variables.map((rowVar, rowIdx) => (
              <tr key={rowIdx} className="group">
                {/* ROW HEADER */}
                <td className="p-3 border-b border-r border-slate-200 dark:border-slate-800 font-bold text-[11px] bg-slate-100 dark:bg-slate-900 sticky left-0 z-10 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors">
                  {rowVar}
                </td>

                {/* CELLS */}
                {variables.map((colVar, colIdx) => {
                  const value = getValue(rowVar, colVar);
                  const isDiagonal = rowVar === colVar;

                  return (
                    <td
                      key={colIdx}
                      className={`
                        p-0 border-b border-r border-slate-100 dark:border-slate-800 
                        transition-all duration-200 relative group/cell
                        ${isDiagonal ? "opacity-100" : "hover:z-10 hover:scale-[1.02] hover:shadow-lg"}
                      `}
                    >
                      <div className={`
                        w-full h-full p-4 flex flex-col items-center justify-center font-mono text-[11px] font-bold leading-none
                        ${getColor(value)}
                        ${isDiagonal ? "ring-inset ring-2 ring-indigo-300/30" : ""}
                      `}>
                        {value.toFixed(2)}
                        
                        {/* SUBTLE INDICATOR FOR STRENGTH */}
                        <div className={`absolute bottom-1 right-1 h-1 w-1 rounded-full opacity-30 ${Math.abs(value) > 0.7 ? 'bg-white' : 'hidden'}`}></div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LEGEND / FOOTER */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded bg-rose-500"></div>
          <span className="text-[9px] font-bold text-slate-400 uppercase">Negative</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded bg-slate-200"></div>
          <span className="text-[9px] font-bold text-slate-400 uppercase">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded bg-indigo-500"></div>
          <span className="text-[9px] font-bold text-slate-400 uppercase">Positive</span>
        </div>
      </div>
    </div>
  );
};

export default CorrelationHeatmap;