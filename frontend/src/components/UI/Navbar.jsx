import React, { useState } from 'react';
import {
  Menu,
  Activity,
  Sparkles,
  LogOut,
  Sun,
  Moon,
  FileSpreadsheet,
  User,
  ShieldCheck,
  ChevronDown,
  Layers,
  AlertTriangle,
  X,
  CheckCircle2,
  Database
} from 'lucide-react';
import ReportGenerator from '../ReportGenerator';
import AIEngine from '../AIEngine';
import { useTheme } from '../../context/ThemeContext';
import { useAuthContext } from '../../context/AuthContext';
import { useVersionContext } from '../../context/VersionContext';

export default function Navbar({
  datasetData,
  aiLoading,
  onOpenMobileMenu,
  onReset,
  aiResults,
  validationResult,
  estimationResult,
  outlierResult,
  duplicateResult,
  analyticsViewData,
}) {
  if (!datasetData) return null;

  const { theme, toggleTheme, isDark } = useTheme();
  const { isAuthenticated, username, logout, openLoginModal } = useAuthContext();
  const { activeVersion } = useVersionContext();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [isAIEngineOpen, setIsAIEngineOpen] = useState(false);

  // Dataset statistics
  const filename = datasetData?.metadata?.filename || datasetData?.dataset_name || 'dataset.csv';
  const rowCount = Number(datasetData?.metadata?.rows || datasetData?.rows || 0);
  const colCount = Number(datasetData?.metadata?.columns || datasetData?.columns || datasetData?.schema?.length || 0);
  const currentVer = activeVersion || datasetData?.metadata?.current_version || datasetData?.version || 'raw';

  const handleConfirmTerminate = () => {
    setShowTerminateConfirm(false);
    onReset && onReset();
  };

  return (
    <>
      <header className="sticky top-0 z-[60] w-full select-none border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors duration-200 shadow-2xs font-sans">
        <div className="max-w-[1900px] mx-auto px-4 py-2 flex items-center justify-between gap-4">
          
          {/* ========================================================= */}
          {/* LEFT: BRANDING & NAVIGATION                               */}
          {/* ========================================================= */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile menu hamburger */}
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu size={16} />
            </button>

            {/* Logo and Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 text-white flex items-center justify-center shadow-xs shadow-indigo-500/20">
                <Activity size={17} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <h1 className="text-sm font-black tracking-wider text-slate-900 dark:text-white uppercase font-mono">
                    DAET
                  </h1>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                    WORKBENCH
                  </span>
                </div>
                <p className="text-[9px] font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase mt-0.5 hidden sm:block">
                  Survey Intelligence Engine
                </p>
              </div>
            </div>

            {/* Node Status Badge */}
            <div className="hidden xl:flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>SECURE_NODE</span>
              <span>•</span>
              <span className="text-slate-400">AES-256</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CENTER: ACTIVE DATASET BUFFER HUD (MD & UP)              */}
          {/* ========================================================= */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-xs font-mono shadow-2xs">
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-[220px]" title={filename}>
              <FileSpreadsheet size={13} className="shrink-0" />
              <span className="truncate">{filename}</span>
            </div>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {rowCount.toLocaleString()} rows
            </span>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {colCount} cols
            </span>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              {currentVer}
            </span>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: CONTROLS, AI STATUS, THEME, USER, TERMINATE       */}
          {/* ========================================================= */}
          <div className="flex items-center gap-2.5 text-xs shrink-0">
            
            {/* AI Engine Status Pill (Interactive Modal Trigger) */}
            <button
              onClick={() => setIsAIEngineOpen(true)}
              className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border text-[11px] font-mono font-medium transition-all cursor-pointer ${
                aiLoading
                  ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:border-indigo-400 dark:hover:border-indigo-500'
              }`}
              title="Open AI Engine Intelligence Console"
            >
              <Sparkles
                size={12}
                className={aiLoading ? 'text-indigo-600 dark:text-indigo-400 animate-spin' : 'text-indigo-500'}
              />
              <span className="tracking-wider">
                {aiLoading ? 'AI_THINKING...' : 'AI_ACTIVE'}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${aiLoading ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500'}`} />
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Report Generator Component */}
            <ReportGenerator
              datasetData={datasetData}
              aiResults={aiResults}
              validationResult={validationResult}
              estimationResult={estimationResult}
              outlierResult={outlierResult}
              duplicateResult={duplicateResult}
              analyticsViewData={analyticsViewData}
            />

            <div className="h-4 w-px bg-slate-200 dark:border-slate-800" />

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center p-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 shadow-2xs transition-all cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
            </button>

            <div className="h-4 w-px bg-slate-200 dark:border-slate-800" />

            {/* User Session Pill with Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-mono font-medium shadow-2xs transition-all cursor-pointer"
                  title="Session User Info"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold">{username || 'User'}</span>
                  <ChevronDown size={11} className={`text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-2xs hover:bg-indigo-100 transition-all cursor-pointer"
                >
                  <User size={12} />
                  <span>Sign In</span>
                </button>
              )}

              {/* User Dropdown Popover */}
              {isUserMenuOpen && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 text-xs font-sans animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-mono uppercase text-slate-400">Signed In As</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">{username}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      <ShieldCheck size={11} />
                      <span>Role: Survey Analyst</span>
                    </div>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200 dark:border-slate-800" />

            {/* Terminate Session Button */}
            <button
              onClick={() => setShowTerminateConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-200 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/20 px-2.5 py-1 text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wide transition hover:bg-red-100 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-800/60 cursor-pointer active:scale-[0.98]"
              title="Close and unload current dataset buffer"
            >
              <LogOut size={12} className="text-red-500" />
              <span className="hidden sm:inline">Terminate</span>
            </button>

          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* TERMINATE CONFIRMATION MODAL                              */}
      {/* ========================================================= */}
      {showTerminateConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle size={18} />
                <h3 className="text-sm font-bold uppercase font-mono">Unload Dataset</h3>
              </div>
              <button
                onClick={() => setShowTerminateConfirm(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 mt-3 font-sans">
              Are you sure you want to terminate the active session for <strong className="font-mono text-slate-900 dark:text-white">{filename}</strong>? 
              All unsaved in-memory transformations will be reset.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5 font-sans">
              <button
                onClick={() => setShowTerminateConfirm(false)}
                className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTerminate}
                className="px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                Confirm Terminate
              </button>
            </div>
          </div>
        </div>
      )}
      {/* AI Engine Intelligence Console Modal */}
      <AIEngine
        isOpen={isAIEngineOpen}
        onClose={() => setIsAIEngineOpen(false)}
      />
    </>
  );
}
