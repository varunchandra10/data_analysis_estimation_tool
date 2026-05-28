import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ message = 'Loading...' }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0f172a] px-4 py-3 text-slate-100 shadow-xl">
        <Loader2 className="animate-spin text-indigo-400" size={18} />
        <span className="text-[10px] font-bold font-mono uppercase tracking-widest">{message}</span>
      </div>
    </div>
  );
}
