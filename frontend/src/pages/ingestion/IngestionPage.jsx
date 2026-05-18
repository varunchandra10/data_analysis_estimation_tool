import React from 'react';
import { Zap, FileSpreadsheet, Terminal, Cpu } from 'lucide-react';
import FileUpload from '../../components/FileUpload';
import DataGridBackground from '../../components/UI/DataGridBackground'; // Adjust your directory import path as needed

const IngestionPage = ({ onUploadSuccess }) => {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden flex flex-col justify-between">
      
      {/* Clean, Reusable Shared Layout Data Background */}
      <DataGridBackground />

      {/* Direct layout ambient light accent */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ===================== MAIN SYSTEM HEADER BLOCK ===================== */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-12 sm:px-8 lg:px-12 border-b border-slate-900 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl font-extrabold tracking-wider text-white font-mono">
            DAET
          </span>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider text-slate-400">
            <Cpu size={12} className="text-blue-500" />
            <span>INGESTION_PIPELINE // SECURE_NODE</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-900 rounded-sm px-2.5 py-1 text-[11px] font-mono text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>ENVIRONMENT: STABLE</span>
        </div>
      </header>

      {/* ===================== WORKBENCH SUB-GRID LAYOUT ===================== */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 sm:px-8 lg:px-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT COLUMN: DOCUMENTATION & META */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-4 font-mono">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-blue-950/40 border border-blue-900/40 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
              <Zap size={10} /> System Ready
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Load Statistical Environment
            </h2>
            
            <p className="text-xs text-slate-400 leading-relaxed font-sans font-normal">
              Initialize the high-throughput workbench by importing a raw tabular dataset. The incoming matrix buffer is verified locally using structural typing rules to map null values, parse row elements, and extract schema keys safely.
            </p>
          </div>

          <div className="border border-slate-900 bg-slate-950/40 p-4 rounded-sm font-mono text-[11px] text-slate-500 space-y-2">
            <p className="text-slate-400 font-bold tracking-wider uppercase">COMPLIANCE_PARADIGM</p>
            <p className="font-sans leading-relaxed text-xs font-normal">Data stream arrays are computed completely in isolated memory allocation scopes on the client device. Row sequences do not transmit across remote external ports.</p>
          </div>
        </div>

        {/* RIGHT COMPONENT COLUMN: HIGH-DENSITY UPLOAD CONSOLE */}
        <div className="lg:col-span-8 w-full border border-slate-900 bg-slate-950/60 p-2 rounded-sm backdrop-blur-md shadow-2xl">
          <div className="border border-slate-900 rounded-sm bg-slate-950 p-2">
            <FileUpload onUploadSuccess={onUploadSuccess} />
          </div>
        </div>

      </main>

      {/* ===================== CORE LABORATORY FOOTER META ===================== */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 sm:px-8 lg:px-12 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
        <div className="flex items-center gap-1.5">
          <Terminal size={12} className="text-slate-600" />
          <span>DAET Laboratory • Security Layer: AES-256</span>
        </div>
        <span>SYSTEM_STATUS_00</span>
      </footer>

    </div>
  );
};

export default IngestionPage;