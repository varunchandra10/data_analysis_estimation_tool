import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  Activity,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSpreadsheet,
  Droplets,
  AlertTriangle,
  Copy,
  ShieldCheck,
  Scale,
  BarChart3,
  Layers,
  FileText,
  History,
  Search,
} from 'lucide-react';
import { useDatasetContext } from '../../context/DatasetContext';

export default function Sidebar({
  datasetData,
  onTabChange,
  activeTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  const { validationResult, outlierResult, duplicateResult } = useDatasetContext();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  if (!datasetData) return null;

  const handleMobileItemClick = (id) => {
    onTabChange(id);
    setIsMobileMenuOpen(false);
  };

  const filename = datasetData?.metadata?.filename || datasetData?.dataset_name || 'dataset.csv';
  const rowCount = Number(datasetData?.metadata?.rows || datasetData?.rows || 0);
  const colCount = Number(datasetData?.metadata?.columns || datasetData?.columns || datasetData?.schema?.length || 0);

  // Calculate null columns count for badge
  const nullCounts = datasetData?.metadata?.null_counts || {};
  const nullColumnsCount = Object.values(nullCounts).filter((c) => c > 0).length;

  // Enhanced Navigation Structure with Logical Groups
  const navigationGroups = [
    {
      group: 'SOURCE & DISCOVERY',
      items: [
        { id: 'overview', label: 'Dataset Explorer', icon: Database, path: '/dataset-explorer' },
        { id: 'whole_dataset', label: 'Whole Dataset', icon: FileSpreadsheet, path: '/whole-dataset', badge: 'Grid', badgeColor: 'slate' },
      ],
    },
    {
      group: 'QUALITY & REFINEMENT',
      items: [
        {
          id: 'missing',
          label: 'Null Analysis',
          icon: Droplets,
          path: '/null-analysis',
          badge: nullColumnsCount > 0 ? `${nullColumnsCount}` : null,
          badgeColor: 'amber',
        },
        {
          id: 'outliers',
          label: 'Outlier Detection',
          icon: AlertTriangle,
          path: '/anomaly-detection',
          badge: outlierResult?.total_outliers ? `${outlierResult.total_outliers}` : null,
          badgeColor: 'rose',
        },
        {
          id: 'duplicates',
          label: 'Deduplication',
          icon: Copy,
          path: '/deduping',
          badge: duplicateResult?.total_duplicates ? `${duplicateResult.total_duplicates}` : null,
          badgeColor: 'blue',
        },
        {
          id: 'validation',
          label: 'Rule Validation',
          icon: ShieldCheck,
          path: '/logic-validation',
          badge: validationResult?.total_violations ? `${validationResult.total_violations}` : 'DSL',
          badgeColor: validationResult?.total_violations ? 'rose' : 'slate',
        },
      ],
    },
    {
      group: 'ESTIMATION & ANALYTICS',
      items: [
        { id: 'estimation', label: 'Weighting Engine', icon: Scale, path: '/weighting-engine', badge: 'IPF', badgeColor: 'indigo' },
        { id: 'analytics', label: 'Dashboard', icon: BarChart3, path: '/statistical-engine' },
      ],
    },
    {
      group: 'GOVERNANCE & LINEAGE',
      items: [
        { id: 'versioning', label: 'Version Control', icon: Layers, path: '/version-control', badge: 'DAG', badgeColor: 'indigo' },
        { id: 'reports', label: 'Report Center', icon: FileText, path: '/report-center' },
        { id: 'logs', label: 'Audit Trail', icon: History, path: '/audit-trail' },
      ],
    },
  ];

  // Filter items if searching
  const filteredGroups = navigationGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => {
        if (!navSearch.trim()) return true;
        return item.label.toLowerCase().includes(navSearch.toLowerCase());
      }),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR RAIL                                      */}
      {/* ========================================================= */}
      <aside
        className={`hidden lg:flex flex-col justify-between shrink-0 select-none font-sans transition-all duration-200 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-[49px] h-[calc(100vh-49px)] max-h-[calc(100vh-49px)] ${
          isCollapsed ? 'w-16 p-2' : 'w-64 p-3'
        }`}
      >
        {/* TOP SCROLLABLE NAVIGATION LIST */}
        <div className="space-y-3 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
          
          {/* Top Rail Controls */}
          <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            {!isCollapsed ? (
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <Activity size={12} className="text-indigo-500" />
                <span>PIPELINE_MODULES</span>
              </div>
            ) : (
              <div className="mx-auto">
                <Activity size={14} className="text-indigo-500" />
              </div>
            )}

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Quick Search (When Expanded) */}
          {!isCollapsed && (
            <div className="relative px-0.5">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Quick jump..."
                className="w-full pl-7 pr-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500 font-mono text-[11px]"
              />
            </div>
          )}

          {/* Navigation Groups */}
          <nav className="space-y-3">
            {filteredGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-0.5">
                {/* Group Heading (Hidden when collapsed) */}
                {!isCollapsed && (
                  <p className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 pb-0.5">
                    {group.group}
                  </p>
                )}

                {/* Nav Links */}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        onClick={() => onTabChange(item.id)}
                        className={`
                          group flex items-center justify-between rounded-md py-1.5 text-xs font-semibold 
                          transition-all duration-150 cursor-pointer
                          ${
                            isActive
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold border-l-[3px] border-indigo-600 dark:border-indigo-500 shadow-2xs pl-2.5 pr-2'
                              : 'border-l-[3px] border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-100 pl-2.5 pr-2'
                          }
                          ${isCollapsed ? 'justify-center px-0 py-2 border-l-0' : ''}
                        `}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon
                            size={14}
                            className={`shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                              isActive
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          />
                          {!isCollapsed && (
                            <span className="truncate tracking-wide font-sans text-xs">
                              {item.label}
                            </span>
                          )}
                        </div>

                        {/* Badge / Indicator (When expanded) */}
                        {!isCollapsed && item.badge && (
                          <span
                            className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-full shrink-0 ${
                              item.badgeColor === 'amber'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                                : item.badgeColor === 'rose'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                                : item.badgeColor === 'blue'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40'
                                : item.badgeColor === 'indigo'
                                ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM: SYSTEM RUNTIME STATUS CARD                        */}
        {/* ========================================================= */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 shrink-0">
          {!isCollapsed ? (
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70 shadow-2xs font-mono">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    BUFFER_ONLINE
                  </p>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  SECURE
                </span>
              </div>

              <p
                className="text-xs font-bold truncate text-slate-800 dark:text-slate-200 mb-1"
                title={filename}
              >
                {filename}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-800/60 pt-1">
                <span>{rowCount.toLocaleString()} rows</span>
                <span>•</span>
                <span>{colCount} cols</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-1 text-center" title={`${filename} (${rowCount} rows)`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE SLIDEOUT DRAWER                                    */}
      {/* ========================================================= */}
      <div
        className={`fixed left-0 right-0 bottom-0 top-[49px] z-[50] lg:hidden font-sans transition-opacity duration-200 ease-in-out ${
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <aside
          className={`absolute inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shadow-2xl transition-transform duration-200 ease-in-out transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-indigo-500" />
                <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  ANALYSIS_PIPELINE
                </h3>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="space-y-3">
              {navigationGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-0.5">
                  <p className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 pb-0.5">
                    {group.group}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        onClick={() => handleMobileItemClick(item.id)}
                        className={({ isActive }) => `
                          flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-semibold
                          transition-all duration-150 cursor-pointer
                          ${
                            isActive
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold border-l-[3px] border-indigo-600 dark:border-indigo-500 shadow-2xs'
                              : 'border-l-[3px] border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-100'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5">
                          <item.icon size={14} className="shrink-0 text-slate-400" />
                          <span className="tracking-wide text-xs">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase">
              ACTIVE_STREAM
            </p>
            <p className="text-xs font-mono font-bold truncate text-slate-800 dark:text-slate-200 mt-0.5">
              {filename}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
