import React from "react";
import { Info } from "lucide-react"; // Import for system design continuity

const CorrelationHeatmap = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-800 bg-[#0b1329]/40 rounded-xl text-slate-500 text-xs font-bold uppercase tracking-wider font-mono">
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

  // ========================================================
  // PROFESSIONAL DIVERGING COLOR SCALE (DARK METRIC OPTIMIZED)
  // Indigo (Positive) -> Slate (Neutral) -> Rose (Negative)
  // ========================================================
  const getColor = (value) => {
    // Perfect Correlation (Diagonal Identity)
    if (value === 1) return "bg-indigo-600 text-white shadow-inner";
    
    // POSITIVE CORRELATIONS (INDIGO WORKBENCH COHESION)
    if (value > 0.8) return "bg-indigo-500 text-white";
    if (value > 0.5) return "bg-indigo-600/70 text-indigo-100 border border-indigo-500/20";
    if (value > 0.3) return "bg-indigo-500/30 text-indigo-300 border border-indigo-500/10";
    if (value > 0.1) return "bg-indigo-500/10 text-indigo-400/80";

    // NEGATIVE CORRELATIONS (ROSE ANOMALY HIGHLIGHTS)
    if (value < -0.8) return "bg-rose-500 text-white";
    if (value < -0.5) return "bg-rose-600/70 text-rose-100 border border-rose-500/20";
    if (value < -0.3) return "bg-rose-500/30 text-rose-300 border border-rose-500/10";
    if (value < -0.1) return "bg-rose-500/10 text-rose-400/80";

    // NEUTRAL / STATISTICAL INDEPENDENCE
    return "bg-[#111c35] text-slate-500";
  };

  return (
    <div className="rounded-xl border-2 border-slate-800/80 bg-[#0f172a] overflow-hidden shadow-2xl">
      
      {/* HEADER CONTROLS */}
      <div className="px-5 py-3.5 border-b border-slate-900 flex items-center justify-between bg-[#0b1329] text-white">
        <div className="flex items-center gap-2.5">
           <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
           <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">
             Correlation Matrix: Pearson ρ
           </h3>
        </div>
        <span className="text-[10px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900 text-slate-500 uppercase tracking-wide">
          Scale: [-1.0 : +1.0]
        </span>
      </div>

      {/* MATRIX FRAME GRID VIEWPORT */}
      <div className="overflow-auto custom-scrollbar bg-slate-950/20">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="p-3.5 border-b border-r border-slate-900 bg-[#0b1329] sticky left-0 top-0 z-30 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left font-mono">
                Variables
              </th>
              {variables.map((variable, idx) => (
                <th
                  key={idx}
                  className="p-3.5 border-b border-slate-900 text-[10px] font-bold min-w-[110px] bg-[#0b1329] text-slate-400 sticky top-0 z-20 uppercase tracking-wider font-mono text-center"
                >
                  {variable}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variables.map((rowVar, rowIdx) => (
              <tr key={rowIdx} className="group">
                {/* ROW HEADER MATRIX LEADER */}
                <td className="p-3.5 border-b border-r border-slate-900 font-bold text-[11px] bg-[#0b1329] sticky left-0 z-10 text-slate-300 group-hover:bg-[#14203e] transition-colors font-mono italic">
                  {rowVar}
                </td>

                {/* CELLS FLUID DATA MAP */}
                {variables.map((colVar, colIdx) => {
                  const value = getValue(rowVar, colVar);
                  const isDiagonal = rowVar === colVar;

                  return (
                    <td
                      key={colIdx}
                      className={`
                        p-0 border-b border-r border-slate-900/60 
                        transition-all duration-150 relative group/cell
                        ${isDiagonal ? "opacity-100" : "hover:z-10 hover:scale-[1.03] hover:shadow-2xl"}
                      `}
                    >
                      <div className={`
                        w-full h-full p-4 flex flex-col items-center justify-center font-mono text-xs font-bold leading-none select-all cursor-crosshair h-[52px]
                        ${getColor(value)}
                        ${isDiagonal ? "ring-inset ring-2 ring-indigo-500/40" : ""}
                      `}>
                        {value.toFixed(2)}
                        
                        {/* SUBTLE INDICATOR FOR STRENGTH */}
                        <div className={`absolute bottom-1 right-1 h-1 w-1 rounded-full opacity-40 ${Math.abs(value) > 0.7 ? 'bg-white' : 'hidden'}`}></div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LEGEND / FOOTER TERMINAL BANNER */}
      <div className="p-3 bg-[#0b1329] border-t border-slate-900 flex items-center justify-center gap-8 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-rose-500 shadow-sm"></div>
          <span className="font-bold text-slate-500 uppercase tracking-wide">Inverse (-1.0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-[#111c35] border border-slate-800"></div>
          <span className="font-bold text-slate-500 uppercase tracking-wide">Orthogonal (0.0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-indigo-500 shadow-sm"></div>
          <span className="font-bold text-slate-500 uppercase tracking-wide">Covariant (+1.0)</span>
        </div>
      </div>
      
    </div>
  );
};

export default CorrelationHeatmap;