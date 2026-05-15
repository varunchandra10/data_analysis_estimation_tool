import React from 'react';
import { Zap, FileSpreadsheet } from 'lucide-react';
import FileUpload from '../components/FileUpload';

const IngestionPage = ({ onUploadSuccess }) => {
  return (
    <div className="h-screen w-full bg-[#f8fafc] dark:bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-y-auto custom-scrollbar">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <div className="w-full max-w-xl z-10 py-10 flex flex-col items-center">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Zap size={12} /> System Ready
          </div>
          <h2 className="text-3xl font-bold tracking-tighter mb-3 text-slate-900 dark:text-white">Load Statistical Environment</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Initialize the workbench by importing a CSV or XLSX source file for high-fidelity processing.
          </p>
        </div>

        <div className="w-full bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl">
          <FileUpload onUploadSuccess={onUploadSuccess} />
        </div>
        
        {/* Subtle Footer Meta */}
        <p className="mt-8 text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em]">
          DAET Laboratory • Security Layer: AES-256
        </p>
      </div>
    </div>
  );
};

export default IngestionPage;