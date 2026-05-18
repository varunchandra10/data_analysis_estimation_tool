import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';

export default function Sidebar({ datasetData, navItems, activeTab, onTabChange, isMobileMenuOpen, setIsMobileMenuOpen }) {
  if (!datasetData) return null;

  const handleMobileItemClick = (id) => {
    onTabChange(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* ===================== DESKTOP WORKSPACE SIDEBAR ===================== */}
      <aside className="hidden lg:flex w-64 h-screen border-r border-slate-900 bg-slate-950 p-4 flex flex-col justify-between shrink-0 select-none font-mono transition-all duration-300 ease-in-out sticky top-0">
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-2">
            ANALYSIS_PIPELINE
          </p>
          
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => onTabChange(item.id)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold 
                  border-l-2 transition-all duration-200 ease-in-out transform
                  ${isActive
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500 shadow-[inset_4px_0_12px_rgba(59,130,246,0.05)] translate-x-0.5'
                    : 'text-slate-400 border-transparent hover:bg-slate-900/60 hover:text-slate-200 hover:translate-x-0.5'
                  }
                `}
              >
                <item.icon size={14} strokeWidth={2} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span className="tracking-wide">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* METADATA SYSTEM RUNTIME STORAGE PIPELINE */}
        <div className="mt-auto pt-4 border-t border-slate-900/60">
          <div className="p-3 bg-slate-950 border border-slate-900 rounded-sm shadow-sm hover:border-slate-800 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SYSTEM_STATUS</p>
            </div>
            <p className="text-[11px] font-semibold text-slate-300 truncate tracking-tight bg-slate-900/40 px-1.5 py-1 rounded-sm border border-slate-900/40 transition-colors duration-200">
              {datasetData.metadata.filename}
            </p>
          </div>
        </div>
      </aside>

      {/* ===================== MOBILE BELOW-NAVBAR SLIDEOUT DRAWER ===================== */}
      {/* top-11 (or top-[45px]) offsets the sidebar cleanly so the navbar remains entirely interactive and exposed */}
      <div 
        className={`fixed left-0 right-0 bottom-0 top-11 z-[50] lg:hidden font-mono transition-opacity duration-300 ease-in-out ${
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Backdrop Blur Fade Overlay - Restricted below the header area */}
        <div 
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
          onClick={() => setIsMobileMenuOpen(false)} 
        />
        
        {/* Slide-out Sidebar Panel Container - Adjusts cleanly under the workspace header row */}
        <aside 
          className={`absolute inset-y-0 left-0 w-[260px] bg-slate-950 border-r border-slate-900 p-5 flex flex-col gap-6 shadow-2xl transition-transform duration-300 ease-in-out transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">// NAVIGATION_BUFFER</h3>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="p-1 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-800 rounded-sm transition-all duration-150"
            >
              <X size={14} />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => handleMobileItemClick(item.id)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-semibold
                  border-l-2 transition-all duration-200 ease-in-out transform
                  ${isActive 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500 shadow-[inset_4px_0_12px_rgba(59,130,246,0.05)] translate-x-0.5' 
                    : 'text-slate-400 border-transparent hover:bg-slate-900/60 hover:text-slate-200 hover:translate-x-0.5'
                  }
                `}
              >
                <item.icon size={13} className="shrink-0" />
                <span className="tracking-wide">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}