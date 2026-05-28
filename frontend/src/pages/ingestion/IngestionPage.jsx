import React from 'react';
import { Zap, FileSpreadsheet, Terminal, Cpu, Sun, Moon } from 'lucide-react';
import FileUpload from '../../components/FileUpload';
import DataGridBackground from '../../components/UI/DataGridBackground'; // Adjust your directory import path as needed
import { useTheme } from '../../context/ThemeContext';

const IngestionPage = ({ onUploadSuccess }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const themeStyles = {
    page: {
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
    },
    surface: {
      backgroundColor: 'var(--bg-secondary)',
      borderColor: 'var(--border-color)',
      color: 'var(--text-primary)',
    },
    card: {
      backgroundColor: 'var(--bg-card)',
      borderColor: 'var(--border-color)',
      color: 'var(--text-primary)',
    },
    mutedText: {
      color: 'var(--text-secondary)',
    },
    accentText: {
      color: 'var(--text-highlight)',
    },
    accentBorder: {
      borderColor: 'color-mix(in srgb, var(--text-highlight) 28%, var(--border-color))',
    },
  };

  return (
    <div className="relative min-h-screen w-full font-sans selection:bg-blue-500/30 overflow-x-hidden flex flex-col justify-between" style={themeStyles.page}>

      {/* Clean, Reusable Shared Layout Data Background */}
      <DataGridBackground />

      {/* Direct layout ambient light accent */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: isDark ? 'rgba(37, 99, 235, 0.10)' : 'rgba(59, 130, 246, 0.12)' }} />

      {/* ===================== MAIN SYSTEM HEADER BLOCK ===================== */}
      <header className="relative z-10 w-full px-6 pt-6 sm:pt-8 sm:px-8 lg:px-12 border-b pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 75%, transparent)' }}>
        <div className="flex items-center gap-3">
          <span className="text-xl font-extrabold tracking-wider font-mono" style={{ color: 'var(--text-primary)' }}>
            DAET
          </span>
          <div className="h-4 w-px" style={{ backgroundColor: 'var(--border-color)' }} />
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider" style={themeStyles.mutedText}>
            <Cpu size={12} style={themeStyles.accentText} />
            <span>INGESTION_PIPELINE // SECURE_NODE</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border rounded-sm px-2.5 py-1 text-[11px] font-mono" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--text-highlight)' }} />
            <span>ENVIRONMENT: STABLE</span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] shadow-sm transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              borderWidth: '1px',
              boxShadow: 'var(--shadow-main)',
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={13} style={{ color: 'var(--text-highlight)' }} /> : <Moon size={13} style={{ color: 'var(--text-highlight)' }} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </header>

      {/* ===================== WORKBENCH SUB-GRID LAYOUT ===================== */}
      <main className="relative z-10 w-full px-6 py-8 sm:px-8 lg:px-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT COLUMN: DOCUMENTATION & META */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-4 font-mono">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm border text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: 'color-mix(in srgb, var(--text-highlight) 10%, var(--bg-secondary))', borderColor: 'color-mix(in srgb, var(--text-highlight) 25%, var(--border-color))', color: 'var(--text-highlight)' }}>
              <Zap size={10} style={{ color: 'var(--text-highlight)' }} /> System Ready
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight" style={themeStyles.page}>
              Load Statistical Environment
            </h2>
            
            <p className="text-xs leading-relaxed font-sans font-normal" style={themeStyles.mutedText}>
              Initialize the high-throughput workbench by importing a raw tabular dataset. The incoming matrix buffer is verified locally using structural typing rules to map null values, parse row elements, and extract schema keys safely.
            </p>
          </div>

          <div className="border p-4 rounded-sm font-mono text-[11px] space-y-2" style={themeStyles.card}>
            <p className="font-bold tracking-wider uppercase" style={{ color: 'var(--text-highlight)' }}>COMPLIANCE_PARADIGM</p>
            <p className="font-sans leading-relaxed text-xs font-normal" style={themeStyles.mutedText}>Data stream arrays are computed completely in isolated memory allocation scopes on the client device. Row sequences do not transmit across remote external ports.</p>
          </div>
        </div>

        {/* RIGHT COMPONENT COLUMN: HIGH-DENSITY UPLOAD CONSOLE */}
        <div className="lg:col-span-8 w-full border p-2 rounded-sm backdrop-blur-md shadow-2xl" style={themeStyles.surface}>
          <div className="border rounded-sm p-2" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
            <FileUpload onUploadSuccess={onUploadSuccess} />
          </div>
        </div>

      </main>

      {/* ===================== CORE LABORATORY FOOTER META ===================== */}
      <footer className="relative z-10 w-full px-6 py-6 sm:px-8 lg:px-12 border-t flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 85%, transparent)', color: 'var(--text-secondary)' }}>
        <div className="flex items-center gap-1.5">
          <Terminal size={12} style={{ color: 'var(--text-highlight)' }} />
          <span>DAET Laboratory • Security Layer: AES-256</span>
        </div>
        <span className="rounded-full border px-2.5 py-1" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>SYSTEM_STATUS_00</span>
      </footer>

    </div>
  );
};

export default IngestionPage;