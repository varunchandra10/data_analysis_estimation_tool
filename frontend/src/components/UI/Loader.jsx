import { Loader2, Activity } from 'lucide-react';

export default function Loader({ 
  message = 'Loading...', 
  subtitle = '',
  variant = 'overlay', // 'overlay' | 'fullscreen' | 'inline' | 'minimal'
  size = 'md',        // 'sm' | 'md' | 'lg'
  progress = null,    // Optional percentage (0-100)
  className = ''
}) {
  const sizeMap = {
    sm: { icon: 14, text: 'text-[10px]', sub: 'text-[9px]', padding: 'px-3 py-2' },
    md: { icon: 18, text: 'text-xs', sub: 'text-[10px]', padding: 'px-4.5 py-3' },
    lg: { icon: 24, text: 'text-sm', sub: 'text-xs', padding: 'px-6 py-4.5' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Minimal variant (simple inline row)
  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center gap-2 font-mono text-slate-600 dark:text-slate-400 ${currentSize.text} ${className}`}>
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" size={currentSize.icon} />
        <span className="font-bold uppercase tracking-wider">{message}</span>
      </div>
    );
  }

  const containerStyles = {
    fullscreen: 'fixed inset-0 z-[200] bg-white/70 dark:bg-slate-950/75 backdrop-blur-sm',
    overlay: 'absolute inset-0 z-50 bg-white/75 dark:bg-slate-950/70 backdrop-blur-xs',
    inline: 'relative py-12 w-full',
  };

  return (
    <div className={`flex items-center justify-center ${containerStyles[variant] || containerStyles.overlay} ${className}`}>
      <div className={`relative flex flex-col items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 ${currentSize.padding} text-slate-900 dark:text-white shadow-xl shadow-slate-900/5 dark:shadow-slate-950/50 backdrop-blur-md max-w-sm text-center animate-in fade-in zoom-in-95 duration-200`}>
        
        {/* Animated Icon Ring */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-indigo-500/15 animate-ping opacity-75" />
          <div className="relative p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
            <Loader2 className="animate-spin" size={currentSize.icon} />
          </div>
        </div>

        {/* Message and Subtitle */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1.5">
            <span className={`font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white ${currentSize.text}`}>
              {message}
            </span>
          </div>
          {subtitle && (
            <p className={`text-slate-500 dark:text-slate-400 font-medium ${currentSize.sub}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Optional Progress Bar */}
        {typeof progress === 'number' && (
          <div className="w-full space-y-1 mt-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <Activity size={10} className="text-indigo-500" /> PROGRESS
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
