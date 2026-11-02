import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Terminal, 
  Cpu, 
  Sun, 
  Moon, 
  ShieldCheck, 
  ChevronLeft, 
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Lock
} from 'lucide-react';
import FileUpload from '../../components/FileUpload';
import DataGridBackground from '../../components/UI/DataGridBackground';
import { useTheme } from '../../context/ThemeContext';

const IngestionPage = ({ onUploadSuccess }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative min-h-screen w-full font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-x-hidden flex flex-col justify-between selection:bg-indigo-500/20 transition-colors duration-500">

      {/* Cybernetic Microdata Grid Background with Mouse Spotlight */}
      <DataGridBackground opacityClass="opacity-30 dark:opacity-25" />

      {/* Ambient Lighting Accents */}
      <div 
        className="absolute top-0 left-1/4 w-[650px] h-[550px] rounded-full blur-[140px] pointer-events-none" 
        style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.10)' : 'rgba(79, 70, 229, 0.08)' }} 
      />
      <div 
        className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full blur-[140px] pointer-events-none" 
        style={{ backgroundColor: isDark ? 'rgba(56, 189, 248, 0.06)' : 'rgba(14, 165, 233, 0.06)' }} 
      />

      {/* ===================== MAIN SYSTEM HEADER BLOCK ===================== */}
      <header className="relative z-10 w-full px-6 py-5 sm:px-8 lg:px-12 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Brand & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer shadow-2xs"
            title="Return to Home"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-xl font-black tracking-wider font-mono text-slate-900 dark:text-white">
              DAET
            </span>
            <div className="h-4 w-px bg-slate-200 dark:border-slate-800" />
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <Cpu size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>INGESTION_PIPELINE // SECURE_NODE</span>
            </div>
          </div>
        </div>

        {/* Status Badge & Theme Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-300 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[10px] uppercase tracking-wider">ENVIRONMENT: STABLE</span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 text-slate-700 dark:text-slate-300 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* ===================== WORKBENCH SUB-GRID LAYOUT ===================== */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT COLUMN: DOCUMENTATION & SPECIFICATIONS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main Title & Description */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/50 text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 shadow-2xs">
              <Zap size={11} />
              <span>Intake Buffer Ready</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
              Load Statistical Microdata
            </h2>
            
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
              Initialize the high-throughput survey pipeline by importing tabular microdata. The incoming matrix buffer is verified locally using structural typing rules to map missing values, isolate anomaly bounds, and extract schema headers.
            </p>
          </div>

          {/* Privacy & Zero-Leakage Compliance Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-xs space-y-2.5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <ShieldCheck size={16} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">
                Zero-Leakage Privacy Paradigm
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Data streams are processed entirely in isolated memory scopes on your device. Raw survey records and respondent identifiers are never transmitted across remote external ports.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <Lock size={11} />
              <span>Local Memory Containment Verified</span>
            </div>
          </div>

          {/* Supported Format Specifications */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 shadow-xs space-y-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={15} className="text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">
                Engine Specifications
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">FORMATS</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">.CSV, .XLSX, .XLS</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">DELIMITERS</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">AUTO-DETECT</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">TYPING</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">PANDAS V2 INT</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">ENCODING</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">UTF-8 / LATIN-1</span>
              </div>
            </div>
          </div>

          {/* Sequential Pipeline Breadcrumb Indicator */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-[10px] font-mono uppercase tracking-wider text-slate-500">
            <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 size={12} /> 1. Ingest
            </span>
            <span>&rarr;</span>
            <span>2. Profile</span>
            <span>&rarr;</span>
            <span>3. Clean</span>
            <span>&rarr;</span>
            <span>4. Weight</span>
          </div>

        </div>

        {/* RIGHT COMPONENT COLUMN: ELEVATED FILE UPLOAD CONSOLE */}
        <div className="lg:col-span-8 w-full">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-slate-950/50 backdrop-blur-md">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                  <Layers size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono uppercase text-slate-900 dark:text-white">
                    Data Intake Matrix
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Drag microdata sheets or select sample demonstration vectors
                  </p>
                </div>
              </div>
            </div>

            <FileUpload onUploadSuccess={onUploadSuccess} />
          </div>
        </div>

      </main>

      {/* ===================== CORE LABORATORY FOOTER META ===================== */}
      <footer className="relative z-10 w-full px-6 py-4 sm:px-8 lg:px-12 border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-indigo-600 dark:text-indigo-400" />
          <span>DAET Intelligence Engine • Memory Isolation: AES-256</span>
        </div>
        <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-0.5 text-slate-600 dark:text-slate-400 font-bold">
          READY_FOR_STREAM
        </span>
      </footer>

    </div>
  );
};

export default IngestionPage;
