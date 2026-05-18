import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

/**
 * GraphEnclosure - A premium, reusable statistical visualization layout shell.
 * Dynamically handles section titles, visibility states, and toggle closures.
 */
const GraphEnclosure = ({ 
  title = "Analytical Plot Matrix", 
  subtitle, 
  tooltipText, 
  hasData = false, 
  icon: Icon = null,
  children 
}) => {
  // Section defaults to closed state. Automatically expands via downstream effects when data arrives.
  const [isOpen, setIsOpen] = useState(false);

  // Synchronizes container state to open automatically when dynamic data mounts
  useEffect(() => {
    if (hasData) {
      setIsOpen(true);
    }
  }, [hasData]);

  // Structural Guard: Structural panel outline unmounts completely if no active graph is displayable
  if (!hasData) return null;

  return (
    <div className="bg-[#0f172a] border-2 border-slate-800/80 rounded-xl overflow-hidden shadow-xl transition-all duration-300">
      
      {/* HEADER CONTROL BLOCK */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3.5 border-b border-slate-900 flex items-center justify-between bg-[#0b1329] text-white cursor-pointer select-none group/enclosure"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && <Icon size={14} className="text-indigo-400 shrink-0" />}
          <div className="space-y-0.5 min-w-0">
            {/* Dynamic Title String Header Element */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono truncate">
              {title}
            </h3>
            {/* Dynamic Subtitle String Element */}
            {subtitle && (
              <p className="text-[11px] text-slate-500 font-medium font-sans truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* ACTIONS & KEY TOGGLE BLOCK FAR RIGHT LAYOUT ALIGNED */}
        <div className="flex items-center gap-4 ml-4 shrink-0">
          {tooltipText && (
            <div className="group/tooltip relative">
              <Info size={14} className="text-slate-500 hover:text-indigo-400 transition-colors cursor-help" />
              <div className="absolute right-0 bottom-full mb-3 w-64 p-3 bg-slate-950 text-slate-300 text-[10px] leading-relaxed rounded-sm border border-slate-800 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 font-sans shadow-2xl">
                {tooltipText}
              </div>
            </div>
          )}
          
          {/* CONTROL DOWN-ARROW BUTTON INDICATOR */}
          <div className="p-1 text-slate-400 group-hover/enclosure:text-slate-100 bg-slate-950 border border-slate-800 rounded-md transition-colors font-mono text-[10px] flex items-center gap-1.5">
            <span className="text-slate-600 font-bold text-[9px] uppercase hidden sm:inline">
              {isOpen ? "Collapse" : "Expand"}
            </span>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* DISCLOSURE BODY CONTENT GRID CANVAS */}
      {isOpen && (
        <div className="p-6 bg-slate-950/10 border-t border-slate-900/40 animate-in slide-in-from-top-1.5 duration-200 min-w-0 w-full overflow-hidden">
          {children}
        </div>
      )}
      
    </div>
  );
};

export default GraphEnclosure;