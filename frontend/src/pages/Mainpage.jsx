import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Zap, Database, BarChart3, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const dataWords = [
  { text: "COLUMN NAME", x: "15%", y: "20%" },
  { text: "DATASET", x: "45%", y: "35%" },
  { text: "ROWS", x: "75%", y: "25%" },
  { text: "CLEANING", x: "20%", y: "55%" },
  { text: "OUTLIERS", x: "50%", y: "65%" },
  { text: "VISUALIZATION", x: "80%", y: "50%" },
  { text: "HANDLING", x: "35%", y: "85%" },
  { text: "UNDERSTANDING", x: "65%", y: "80%" },
];

const Mainpage = () => {
  const [stage, setStage] = useState("blink");
  const navigate = useNavigate();

  useEffect(() => {
    const blinkTimer = setTimeout(() => setStage("expand"), 1500);
    const readyTimer = setTimeout(() => setStage("ready"), 3500);

    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(readyTimer);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-visible bg-slate-950 text-white">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900">
          <filter id="water-wave">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.05" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" />
          </filter>

          <defs>
            <pattern id="grid" width="300" height="60" patternUnits="userSpaceOnUse">
              <rect width="300" height="60" fill="none" stroke="white" strokeWidth="0.5" opacity="0.6" />
            </pattern>
            <linearGradient id="wave-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="45%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          <g filter="url(#water-wave)" className="animate-water-flow">
            <rect width="100%" height="100%" fill="url(#wave-gradient)" />
            <rect width="100%" height="100%" fill="url(#grid)" />
            {dataWords.map((word, index) => (
              <text
                key={index}
                x={word.x}
                y={word.y}
                fill="white"
                fontSize="14"
                fontWeight="800"
                opacity="0.75"
                letterSpacing="0.2em"
                className="select-none font-sans"
              >
                {word.text}
              </text>
            ))}
          </g>
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-16">
        <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="space-y-12">
            <AnimatePresence mode="wait">
              {stage === "blink" ? (
                <motion.div
                  key="blink-stage"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  className="space-y-4 text-center lg:text-left"
                >
                  <h1 className="text-7xl md:text-9xl font-black tracking-tight">DAET</h1>
                  <p className="text-blue-300 font-bold uppercase tracking-[0.35em] text-sm md:text-base">
                    Team Starks Edition
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="expand-stage"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="space-y-8"
                >
                  <div className="max-w-3xl">
                    <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-blue-200 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-blue-400" />
                      Survey intelligence in one place
                    </p>
                    <h1 className="mt-6 text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
                      Analyze your survey <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">data</span> faster than ever.
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                      DAET brings instant dataset preview, schema validation, and actionable insights into a polished, local-first analytics experience.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row items-center sm:items-start">
                    <button
                      onClick={() => navigate('/ingestion')}
                      className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-500/20 transition hover:brightness-110"
                    >
                      Get Started
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => navigate('/ingestion')}
                      className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-8 py-4 text-base font-semibold text-slate-100 transition hover:bg-slate-800"
                    >
                      Upload a file
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Live metrics</p>
                  <p className="mt-3 text-3xl font-bold text-white">94%</p>
                </div>
                <div className="rounded-3xl bg-blue-500/10 p-3 text-blue-200">
                  <Database size={24} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Metric label="Privacy first" value="Local data processing" />
                <Metric label="Auto detect" value="CSV, XLSX, survey schema" />
                <Metric label="Quality checks" value="Missing values, outliers, duplicates" />
                <Metric label="Results" value="Preview + analytics in seconds" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-[#f8fafc] text-slate-900 py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="max-w-3xl space-y-6">
            <h2 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Analyze your survey <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">data in seconds.</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              The most efficient way to preview datasets, validate schemas, and generate instant insights for your survey reports. Local processing keeps your files private and your workflow fast.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Feature icon={<ShieldCheck size={24} />} title="Secure" desc="Local processing ensures maximum privacy." />
            <Feature icon={<Zap size={24} />} title="Fast" desc="Instant parsing for CSV and Excel datasets." />
            <Feature icon={<Database size={24} />} title="Smart" desc="Automatic schema detection and data profiling." />
            <Feature icon={<BarChart3 size={24} />} title="Visual" desc="Real-time quality maps, stats, and trends." />
          </div>

          <div className="pt-10 border-t border-slate-200 flex flex-col items-center text-center">
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Ready to start your analysis?</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
              <Database size={16} className="text-blue-600" />
              Click Get Started to upload your first dataset.
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes water-flow {
          0% { transform: translateY(-2%); }
          100% { transform: translateY(2%); }
        }
        .animate-water-flow { animation: water-flow 10s infinite alternate ease-in-out; }
      `}</style>
    </div>
  );
};

const Metric = ({ label, value }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
    <p className="uppercase tracking-[0.3em] text-slate-400 text-[10px]">{label}</p>
    <p className="mt-3 text-base font-semibold text-white">{value}</p>
  </div>
);

/* ===================== FEATURE CARD SUB-COMPONENT ===================== */
function Feature({ icon, title, desc }) {
  return (
    <div className="flex flex-col gap-4 p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group">
      <div className="text-blue-600 bg-blue-50 w-fit p-4 rounded-2xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <div className="space-y-2">
        <h4 className="text-lg font-bold text-slate-800">
          {title}
        </h4>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">
          {desc}
        </p>
      </div>
    </div>
  );
}

export default Mainpage;