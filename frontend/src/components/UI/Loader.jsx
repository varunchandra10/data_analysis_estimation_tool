import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ message = 'Loading...' }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-lg">
        <Loader2 className="animate-spin text-indigo-600" size={18} />
        <span className="text-xs font-semibold uppercase tracking-widest">{message}</span>
      </div>
    </div>
  );
}
