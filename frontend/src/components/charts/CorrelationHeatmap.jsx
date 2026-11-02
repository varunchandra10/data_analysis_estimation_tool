import { useState, useMemo } from "react";
import { Grid, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Enhanced CorrelationHeatmap Component
 * Enterprise Pearson Rho correlation matrix with O(1) map indexing,
 * dynamic theme diverging gradients, interactive hover inspection, and strength filters.
 */
const CorrelationHeatmap = ({ data, title = "Correlation Matrix: Pearson ρ", className = "" }) => {
  const { isDark = true } = useTheme();
  const [hoveredCell, setHoveredCell] = useState(null);
  const [onlySignificant, setOnlySignificant] = useState(false);

  // Extract variables list
  const variables = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const set = new Set();
    data.forEach((d) => {
      if (d.x) set.add(d.x);
      if (d.y) set.add(d.y);
    });
    return Array.from(set);
  }, [data]);

  // Fast O(1) lookup dictionary for correlation pairs
  const lookupMap = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return new Map();
    const map = new Map();
    data.forEach((d) => {
      map.set(`${d.x}::${d.y}`, Number(d.value ?? 0));
    });
    return map;
  }, [data]);

  const getValue = (x, y) => {
    if (x === y) return 1.0;
    return lookupMap.get(`${x}::${y}`) ?? lookupMap.get(`${y}::${x}`) ?? 0;
  };

  // Interpretation helper
  const getInterpretation = (val) => {
    const abs = Math.abs(val);
    if (val === 1) return { label: 'Perfect Collinearity', grade: 'Identity' };
    if (abs >= 0.8) return { label: val > 0 ? 'Very Strong Positive' : 'Very Strong Inverse', grade: 'Strong' };
    if (abs >= 0.5) return { label: val > 0 ? 'Moderate Positive' : 'Moderate Inverse', grade: 'Moderate' };
    if (abs >= 0.3) return { label: val > 0 ? 'Weak Positive' : 'Weak Inverse', grade: 'Weak' };
    if (abs >= 0.1) return { label: 'Slight Association', grade: 'Negligible' };
    return { label: 'Orthogonal (Uncorrelated)', grade: 'Independent' };
  };

  // Diverging color mapping (Indigo positive <-> Slate neutral <-> Rose negative)
  const getCellStyling = (value, isDiagonal) => {
    if (isDiagonal) {
      return isDark
        ? 'bg-indigo-600 text-white ring-inset ring-2 ring-indigo-400/50 shadow-inner'
        : 'bg-indigo-600 text-white ring-inset ring-2 ring-indigo-300 shadow-sm';
    }

    const abs = Math.abs(value);
    const dimmed = onlySignificant && abs < 0.5;
    const dimClass = dimmed ? 'opacity-25 grayscale' : 'opacity-100';

    if (value > 0.8) {
      return `${dimClass} ${isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'}`;
    }
    if (value > 0.5) {
      return `${dimClass} ${isDark ? 'bg-indigo-600/70 text-indigo-100 border border-indigo-500/30' : 'bg-indigo-500/80 text-white border border-indigo-400/40'}`;
    }
    if (value > 0.3) {
      return `${dimClass} ${isDark ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/20' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'}`;
    }
    if (value > 0.1) {
      return `${dimClass} ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50/80 text-indigo-700 border border-indigo-100'}`;
    }

    // Negative Correlations
    if (value < -0.8) {
      return `${dimClass} ${isDark ? 'bg-rose-600 text-white' : 'bg-rose-600 text-white'}`;
    }
    if (value < -0.5) {
      return `${dimClass} ${isDark ? 'bg-rose-600/70 text-rose-100 border border-rose-500/30' : 'bg-rose-500/80 text-white border border-rose-400/40'}`;
    }
    if (value < -0.3) {
      return `${dimClass} ${isDark ? 'bg-rose-500/30 text-rose-300 border border-rose-500/20' : 'bg-rose-100 text-rose-800 border border-rose-200'}`;
    }
    if (value < -0.1) {
      return `${dimClass} ${isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50/80 text-rose-700 border border-rose-100'}`;
    }

    // Neutral / Independent
    return `${dimClass} ${isDark ? 'bg-slate-900/60 text-slate-500 border border-slate-800/40' : 'bg-slate-50 text-slate-400 border border-slate-200/60'}`;
  };

  // Empty State Guard
  if (!data || data.length === 0 || variables.length === 0) {
    return (
      <div className={`p-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-center font-mono text-xs select-none ${className}`}>
        <Grid size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2 stroke-[1.5]" />
        <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
          No Correlation Matrix Data
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
          Requires pairwise numerical vector attributes for bivariate covariance
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden font-sans ${className}`}>
      
      {/* 1. Matrix Header Toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shadow-2xs">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                {title}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                {variables.length} × {variables.length} Matrix
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wide mt-0.5">
              Bivariate Pearson Metric: ρ ∈ [-1.0, +1.0]
            </p>
          </div>
        </div>

        {/* Significance Toggle Filter */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlySignificant((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition cursor-pointer ${
              onlySignificant
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
            title="Dim weak correlations (|ρ| < 0.5) to isolate high-magnitude associations"
          >
            <Filter size={12} />
            <span>Significant Only (|ρ| ≥ 0.5)</span>
            {onlySignificant && <CheckCircle2 size={12} className="text-indigo-500" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive Matrix Viewport */}
      <div className="overflow-auto custom-scrollbar bg-slate-50/20 dark:bg-slate-950/20 max-h-[550px]">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="p-3.5 border-b border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 sticky left-0 top-0 z-30 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left font-mono">
                Variables
              </th>
              {variables.map((variable, idx) => (
                <th
                  key={idx}
                  className="p-3 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold min-w-[100px] bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 sticky top-0 z-20 uppercase tracking-wider font-mono text-center truncate"
                  title={variable}
                >
                  {variable}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variables.map((rowVar, rowIdx) => (
              <tr key={rowIdx} className="group">
                {/* Sticky Left Row Header */}
                <td className="p-3 border-b border-r border-slate-200 dark:border-slate-800 font-bold text-xs bg-slate-50 dark:bg-slate-950 sticky left-0 z-10 text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-mono truncate max-w-[160px]" title={rowVar}>
                  {rowVar}
                </td>

                {/* Data Cells */}
                {variables.map((colVar, colIdx) => {
                  const value = getValue(rowVar, colVar);
                  const isDiagonal = rowVar === colVar;
                  const isHovered = hoveredCell?.x === colVar && hoveredCell?.y === rowVar;

                  return (
                    <td
                      key={colIdx}
                      onMouseEnter={() => setHoveredCell({ x: colVar, y: rowVar, value })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`
                        p-0 border-b border-r border-slate-200/80 dark:border-slate-800/60
                        transition-transform duration-100 relative
                        ${isDiagonal ? 'opacity-100' : 'hover:scale-[1.04] hover:z-20 hover:shadow-lg'}
                      `}
                    >
                      <div
                        className={`
                          w-full h-12 p-2 flex flex-col items-center justify-center font-mono text-xs font-bold leading-none cursor-pointer transition-all
                          ${getCellStyling(value, isDiagonal)}
                          ${isHovered ? 'ring-2 ring-indigo-400 dark:ring-indigo-300 shadow-md' : ''}
                        `}
                      >
                        <span>{value.toFixed(2)}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Live Inspector & Legend Footer */}
      <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        
        {/* Dynamic Hover Inspector */}
        <div className="flex items-center gap-2 min-w-0">
          {hoveredCell ? (
            <div className="flex items-center gap-2 text-xs truncate animate-in fade-in duration-100">
              <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                {hoveredCell.y} × {hoveredCell.x}:
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                ρ = {hoveredCell.value.toFixed(3)}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-sans font-semibold">
                {getInterpretation(hoveredCell.value).label}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 font-sans">
              Hover across cells to inspect pairwise bivariate statistics
            </span>
          )}
        </div>

        {/* Diverging Color Scale Legend */}
        <div className="flex items-center gap-4 text-[10px] shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-2xs" />
            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">Inverse (-1.0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">Neutral (0.0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 shadow-2xs" />
            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">Covariant (+1.0)</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CorrelationHeatmap;
