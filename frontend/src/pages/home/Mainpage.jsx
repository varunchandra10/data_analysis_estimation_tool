import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Database, BarChart3, ChevronRight, Terminal, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataGridBackground from "../../components/UI/DataGridBackground";
import { useTheme } from "../../context/ThemeContext";

const themeStyles = {
  page: {
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  },
  titleText: {
    color: 'var(--text-primary)',
  },
  button: {
    backgroundColor: 'var(--bg-secondary)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-main)',
  },
  panel: {
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
  glowBlue: 'rgba(59, 130, 246, 0.14)',
  glowIndigo: 'rgba(99, 102, 241, 0.14)',
};

const Mainpage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans selection:bg-blue-500/30" style={themeStyles.page}>
      
      {/* Clean, Reusable Shared Layout Data Background */}
      <DataGridBackground />

      {/* Ambient lighting for the landing hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[620px] w-[860px] rounded-full blur-[140px] pointer-events-none" style={{ backgroundColor: themeStyles.glowBlue }} />
      <div className="absolute right-[-6rem] top-24 h-72 w-72 rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: themeStyles.glowIndigo }} />

      <button
        type="button"
        onClick={toggleTheme}
        className="fixed right-4 top-4 z-30 inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] shadow-lg backdrop-blur transition-all duration-200 sm:right-6 sm:top-6 cursor-pointer"
        style={{
          ...themeStyles.button,
          backgroundColor: 'var(--bg-secondary)',
          borderWidth: '1px',
        }}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={14} style={themeStyles.accentText} /> : <Moon size={14} style={themeStyles.accentText} />}
        <span>{isDark ? 'Light' : 'Dark'}</span>
      </button>

      {/* ===================== HERO MAIN INTERFACE ===================== */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center sm:px-8 lg:px-12">
        
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-5xl space-y-8"
        >
          {/* Branding and Architecture Header */}
          <div className="inline-flex items-center justify-center gap-3 rounded-sm border px-4 py-2 shadow-lg backdrop-blur" style={themeStyles.panel}>
            <span className="text-3xl font-extrabold tracking-wider font-mono" style={themeStyles.titleText}>
              DAET
            </span>
            <div className="h-4 w-px" style={{ backgroundColor: 'var(--border-color)' }} />
            <p className="text-[11px] uppercase tracking-[0.32em] font-mono" style={themeStyles.mutedText}>
              Data Analysis and Estimation Tool
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-highlight)' }}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--text-highlight)' }} />
              Survey Intelligence Workspace
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] shadow-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--text-highlight)' }} />
              Local-first analytics
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08] max-w-4xl mx-auto" style={themeStyles.titleText}>
            Analyze your survey <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-300">data faster</span> than ever.
          </h1>

          <p className="max-w-2xl text-sm sm:text-base leading-relaxed mx-auto font-normal" style={themeStyles.mutedText}>
            DAET delivers instantaneous dataset preview, schema validation, and actionable diagnostic insights directly within a clean, local-first analytics experience.
          </p>

          {/* Core Functional CTAs */}
          <div className="flex flex-wrap gap-4 items-center justify-center pt-4">
            <button
              onClick={() => navigate('/ingestion')}
              className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 focus:outline-none"
              style={{ backgroundColor: 'var(--text-highlight)', color: 'white', boxShadow: '0 12px 30px rgba(79, 70, 229, 0.22)' }}
            >
              Get Started
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-3 text-left text-xs shadow-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              <Terminal className="h-4 w-4" style={themeStyles.accentText} />
              <span>Open the ingestion workspace to begin a fresh session.</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ===================== CORE UTILITY SPECIFICATIONS ===================== */}
      <section className="relative z-10 border-t py-20 px-6 backdrop-blur-md sm:px-8 lg:px-12" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="max-w-3xl space-y-3">
            <h2 className="text-sm uppercase tracking-widest font-mono font-bold" style={themeStyles.mutedText}>
              DATA_PROCESSING_PARADIGM
            </h2>
            <p className="text-sm leading-relaxed max-w-2xl" style={themeStyles.mutedText}>
              The most efficient way to preview datasets, validate structural schemas, and isolate immediate issues for your survey records. Local client processing ensures stability and absolute file containment.
            </p>
          </div>

          {/* Matrix Specs Blocks */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Feature icon={<ShieldCheck size={18} />} title="Secure Architecture" desc="Local thread processing ensures maximum privacy. Your structural rows never leave your system." />
            <Feature icon={<Zap size={18} />} title="High-Speed Engine" desc="Instant baseline parsing pipelines engineered for large-scale CSV and Excel datasets." />
            <Feature icon={<Database size={18} />} title="Automated Parsing" desc="Automatic matrix schema detection, structural orientation profiling, and data formatting." />
            <Feature icon={<BarChart3 size={18} />} title="Quality Assessment" desc="Instant checks capturing null vectors, structural missing values, anomalies, and duplicates." />
          </div>

          {/* Utility Baseline Notice */}
          <div className="pt-8 border-t flex flex-col items-center text-center" style={{ borderColor: 'var(--border-color)' }}>
            <p className="font-mono uppercase tracking-[0.2em] text-[10px]" style={themeStyles.mutedText}>READY FOR UPLOAD</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs shadow-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              <Terminal size={14} style={themeStyles.accentText} />
              <span>Click <span style={themeStyles.accentText}>Get Started</span> to initialize parsing buffer.</span>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

/* ===================== PIPELINE BLOCK DESCRIPTORS ===================== */
function Feature({ icon, title, desc }) {
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
      <div className="w-fit rounded-xl border p-2 transition-all duration-200 group-hover:text-white" style={{ borderColor: 'color-mix(in srgb, var(--text-highlight) 20%, transparent)', backgroundColor: 'color-mix(in srgb, var(--text-highlight) 7%, transparent)', color: 'var(--text-highlight)' }}>
        {icon}
      </div>
      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold font-mono tracking-tight" style={themeStyles.titleText}>
          {title}
        </h4>
        <p className="text-xs leading-relaxed font-normal" style={themeStyles.titleText}>
          {desc}
        </p>
      </div>
    </div>
  );
}

export default Mainpage;