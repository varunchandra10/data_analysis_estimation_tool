import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Database, BarChart3, ChevronRight, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataGridBackground from "../../components/UI/DataGridBackground";
const Mainpage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Clean, Reusable Shared Layout Data Background */}
      <DataGridBackground />

      {/* Deep crisp ambient lighting for dashboard aesthetics */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ===================== HERO MAIN INTERFACE ===================== */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 sm:px-8 lg:px-12 flex flex-col items-center text-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-4xl space-y-8"
        >
          {/* Branding and Architecture Header */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-extrabold tracking-wider text-white font-mono">
              DAET
            </span>
            <div className="h-4 w-px bg-slate-800" />
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400 font-mono">
              Data Analysis and Estimation Tool
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-sm border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-mono text-xs uppercase tracking-wider text-blue-400 mx-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Survey Intelligence Workspace
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.12] max-w-3xl mx-auto">
            Analyze your survey <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">data faster</span> than ever.
          </h1>

          <p className="max-w-xl text-sm sm:text-base leading-relaxed text-slate-400 mx-auto font-normal">
            DAET delivers instantaneous dataset preview, schema validation, and actionable diagnostic insights directly within a clean, local-first analytics experience.
          </p>

          {/* Core Functional CTAs */}
          <div className="flex flex-wrap gap-4 items-center justify-center pt-4">
            <button
              onClick={() => navigate('/ingestion')}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-600/10 transition hover:bg-blue-500 focus:outline-none"
            >
              Get Started
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

      </div>

      {/* ===================== CORE UTILITY SPECIFICATIONS ===================== */}
      <section className="bg-slate-950/90 border-t border-slate-900/80 py-20 px-6 sm:px-8 lg:px-12 relative z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="max-w-3xl space-y-3">
            <h2 className="text-sm uppercase tracking-widest text-slate-400 font-mono font-bold">
              DATA_PROCESSING_PARADIGM
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
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
          <div className="pt-8 border-t border-slate-900 flex flex-col items-center text-center">
            <p className="text-slate-500 font-mono uppercase tracking-[0.2em] text-[10px]">READY FOR UPLOAD</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-sm border border-slate-800 bg-slate-950 px-4 py-2 font-mono text-xs text-slate-400">
              <Terminal size={14} className="text-blue-500" />
              <span>Click <span className="text-blue-400 font-semibold">Get Started</span> to initialize parsing buffer.</span>
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
    <div className="flex flex-col gap-4 p-6 rounded-sm border border-slate-900 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-800 transition-all duration-200 group">
      <div className="text-blue-400 bg-blue-500/5 border border-blue-500/10 w-fit p-2 rounded-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-200">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-slate-200 font-mono tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed font-normal">
          {desc}
        </p>
      </div>
    </div>
  );
}

export default Mainpage;