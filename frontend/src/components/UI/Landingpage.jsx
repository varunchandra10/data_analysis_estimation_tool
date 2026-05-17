import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [stage, setStage] = useState("blink");
  const navigate = useNavigate();

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
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 flex flex-col items-center justify-center font-sans">
      {/* ================= BACKGROUND: WATER & SPREADSHEET ================= */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <svg className="w-full h-full">
          <filter id="water-wave">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.05"
              numOctaves="2"
              result="noise"
            />
            {/* Reduced scale for the spreadsheet grid specifically */}
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" />
          </filter>

          <defs>
            <pattern
              id="grid"
              width="300"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <rect
                width="300"
                height="60"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                opacity="0.7"
              />
            </pattern>

            <linearGradient id="wave-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          <g filter="url(#water-wave)" className="animate-water-flow">
            {/* 1. The Water Background */}
            <rect width="100%" height="100%" fill="url(#wave-gradient)" />

            {/* 2. The Faded Spreadsheet Grid */}
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* 3. Submerged Terminology (Blended with water) */}
            {dataWords.map((word, i) => (
              <text
                key={i}
                x={word.x}
                y={word.y}
                fill="white"
                fontSize="14"
                fontWeight="800"
                opacity="0.7" /* Very light to blend with water */
                letterSpacing="0.2em"
                className="select-none font-sans"
              >
                {word.text}
              </text>
            ))}
          </g>
        </svg>
      </div>

      {/* ================= TEXT CONTENT ================= */}
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
              <h1 className="text-7xl md:text-9xl font-black text-white">
                DAET
              </h1>
              <p className="text-blue-400 font-bold uppercase tracking-[0.4em] text-xs md:text-sm">
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
                animate={{ letterSpacing: "1.5em", opacity: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="text-5xl md:text-8xl font-black text-white uppercase whitespace-nowrap mr-[-1.5em]"
              >
                DAET
              </motion.h1>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-4"
              >
                <h2 className="text-2xl md:text-5xl font-extralight text-blue-50 leading-tight">
                  Data Analysis{" "}
                  <span className="text-blue-500 font-black">&</span> Estimation
                  Tool
                </h2>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 1.5 }}
                  className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mt-8"
                />
              </motion.div>

              {/* Start Analysis Button */}
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
                    boxShadow: "0 0 30px rgba(37, 99, 235, 0.4)",
                    backgroundColor: "rgba(37, 99, 235, 1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/home")}
                  className="group relative flex items-center gap-3 px-10 py-4 bg-blue-600/20 border border-blue-500/50 text-white rounded-full font-black text-lg tracking-widest transition-all overflow-hidden"
                >
                  <span className="relative z-10">START ANALYSIS</span>
                  <ChevronRight className="relative z-10 group-hover:translate-x-2 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-10 pointer-events-none" />
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
