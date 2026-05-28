import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const LandingPage = () => {
  const [stage, setStage] = useState("blink");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Terminology for project essence
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

  useEffect(() => {
    const blinkTimer = setTimeout(() => setStage("expand"), 1500);
    const readyTimer = setTimeout(() => setStage("ready"), 3500);

    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(readyTimer);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center font-sans transition-colors duration-500">

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-lg backdrop-blur-md transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
        >
          {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-600" />}
        </button>
      </div>

      {/* ================= BACKGROUND: WATER & SPREADSHEET ================= */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-60 pointer-events-none transition-opacity duration-500">
        <svg className="w-full h-full">
          <filter id="water-wave">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.05"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" />
          </filter>

          <defs>
            <pattern
              id="grid"
              width="240"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <rect
                width="240"
                height="50"
                fill="none"
                /* Swaps structural borders dynamically based on theme setting */
                stroke={isDark ? "#334155" : "#cbd5e1"}
                strokeWidth="0.75"
                opacity="0.6"
              />
            </pattern>

            {/* Completely overhauled gradient profiles to balance structural depth */}
            <linearGradient id="wave-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? "#090d16" : "#f8fafc"} />
              <stop offset="50%" stopColor={isDark ? "#1e293b" : "#e0f2fe"} />
              <stop offset="100%" stopColor={isDark ? "#0f172a" : "#bae6fd"} />
            </linearGradient>
          </defs>

          <g filter="url(#water-wave)" className="animate-water-flow">
            {/* 1. Fluid Dynamic Gradient Base */}
            <rect width="100%" height="100%" fill="url(#wave-gradient)" />

            {/* 2. Structured Matrix Grid Layout */}
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* 3. Submerged Structural Data Markers */}
            {dataWords.map((word, i) => (
              <text
                key={i}
                x={word.x}
                y={word.y}
                fill={isDark ? "#475569" : "#38bdf8"}
                fontSize="13"
                fontWeight="900"
                letterSpacing="0.25em"
                opacity={isDark ? "0.4" : "0.5"}
                className="select-none font-mono transition-all duration-500"
              >
                {word.text}
              </text>
            ))}
          </g>
        </svg>
      </div>

      {/* ================= TEXT CONTENT INTERFACE ================= */}
      <div className="relative z-10 text-center px-6">
        <AnimatePresence mode="wait">
          {stage === "blink" ? (
            <motion.div
              key="blink-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="space-y-2"
            >
              <h1 className="text-7xl md:text-9xl font-black text-slate-900 dark:text-white transition-colors duration-500 tracking-tight">
                DAET
              </h1>
              <p className="text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-[0.4em] text-xs md:text-sm">
                Team Starks Edition
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="expand-stage"
              className="flex flex-col items-center"
            >
              <motion.h1
                initial={{ letterSpacing: "-0.05em", opacity: 0 }}
                animate={{ letterSpacing: "1.2em", opacity: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white uppercase whitespace-nowrap mr-[-1.2em] transition-colors duration-500"
              >
                DAET
              </motion.h1>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-6"
              >
                <h2 className="text-2xl md:text-5xl font-light tracking-tight text-slate-800 dark:text-slate-100 leading-tight transition-colors duration-500">
                  Data Analysis{" "}
                  <span className="text-blue-600 dark:text-blue-400 font-black">&</span> Estimation Tool
                </h2>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 1.5 }}
                  className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mt-8"
                />
              </motion.div>

              {/* Action Pipeline Initializer */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={
                  stage === "ready"
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 30 }
                }
                transition={{ duration: 0.8, ease: "backOut" }}
                className="mt-12"
              >
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: isDark
                      ? "0 0 35px rgba(37, 99, 235, 0.35)"
                      : "0 12px 24px rgba(37, 99, 235, 0.15)",
                    backgroundColor: "rgba(37, 99, 235, 1)",
                    color: "#ffffff"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/home")}
                  className="group relative flex items-center gap-3 px-10 py-4 bg-blue-600/10 dark:bg-blue-500/15 border border-blue-600/30 dark:border-blue-400/30 text-blue-600 dark:text-blue-400 rounded-full font-black text-sm tracking-[0.2em] transition-all overflow-hidden"
                >
                  <span className="relative z-10 transition-colors duration-300">START ANALYSIS</span>
                  <ChevronRight className="relative z-10 group-hover:translate-x-1.5 transition-transform group-hover:text-white" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 rounded-full bg-blue-500 dark:bg-blue-400 animate-ping opacity-5 pointer-events-none" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes water-flow {
          0% {
            transform: translateY(-3%);
          }
          100% {
            transform: translateY(3%);
          }
        }
        .animate-water-flow {
          animation: water-flow 8s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;