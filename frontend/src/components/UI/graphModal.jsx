import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import InfoTooltip from "./InfoTooltip";

/**
 * GraphEnclosure - Reusable statistical visualization layout shell.
 * Theme-aware container supporting collapsible headers, info tooltips, and responsive layout.
 */
const GraphEnclosure = ({ 
  title = "Analytical Plot Matrix", 
  subtitle, 
  tooltip,
  hasData = false, 
  icon: Icon = null,
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (hasData) {
      setIsOpen(true);
    }
  }, [hasData]);

  if (!hasData) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-all duration-200">
      
      {/* HEADER CONTROL BLOCK */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 cursor-pointer select-none group/enclosure hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shrink-0">
              <Icon size={14} />
            </div>
          )}
          <div className="space-y-0.5 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium font-sans truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* ACTIONS & KEY TOGGLE BLOCK */}
        <div className="flex items-center gap-3 ml-4 shrink-0">
          {tooltip && (
            <InfoTooltip
              ariaLabel={`${title} information`}
              className="h-5 w-5"
              iconSize={13}
              {...tooltip}
            />
          )}
          
          <div className="p-1 text-slate-500 dark:text-slate-400 group-hover/enclosure:text-indigo-600 dark:group-hover/enclosure:text-indigo-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md transition-colors font-mono text-[10px] flex items-center gap-1.5 shadow-2xs">
            <span className="font-bold text-[9px] uppercase hidden sm:inline">
              {isOpen ? "Collapse" : "Expand"}
            </span>
            {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>
        </div>
      </div>

      {/* DISCLOSURE BODY CONTENT */}
      {isOpen && (
        <div className="p-5 bg-white dark:bg-slate-900/60 min-w-0 w-full overflow-hidden animate-in fade-in duration-150">
          {children}
        </div>
      )}
      
    </div>
  );
};

export default GraphEnclosure;
