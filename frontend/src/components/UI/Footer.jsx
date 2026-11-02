import React from 'react';
import { Activity, ShieldCheck, Terminal, Cpu, Sparkles, Layers, FileText, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative z-10 w-full border-t font-sans transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Upper Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 py-14 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Overview Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Activity size={18} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black tracking-wider font-mono uppercase text-white">
                  DAET
                </span>
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  v1.0.0
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              Data Analysis and Estimation Tool — An enterprise-grade, deterministic survey processing, 
              rule validation DSL, demographic IPF raking, and DAG lineage tracking platform.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span style={{ color: 'var(--text-secondary)' }}>ENGINE_ONLINE // SECURE_NODE</span>
              </div>
            </div>
          </div>

          {/* Statistical Modules */}
          <div className="space-y-3 font-mono text-xs">
            <p className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--text-highlight)' }}>
              STATISTICAL_CORE
            </p>
            <ul className="space-y-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              <li className="hover:text-white transition-colors cursor-default">IPF Multidimensional Raking</li>
              <li className="hover:text-white transition-colors cursor-default">Kish Effective Sample Size</li>
              <li className="hover:text-white transition-colors cursor-default">IQR & Winsorization</li>
              <li className="hover:text-white transition-colors cursor-default">KNN & Simple Imputation</li>
              <li className="hover:text-white transition-colors cursor-default">Weighted Confidence Intervals</li>
            </ul>
          </div>

          {/* Architecture & Security */}
          <div className="space-y-3 font-mono text-xs">
            <p className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--text-highlight)' }}>
              ARCHITECTURE
            </p>
            <ul className="space-y-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Fernet At-Rest AES</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
                <Layers size={12} className="text-blue-400" />
                <span>DAG Checkpoint Lineage</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
                <Sparkles size={12} className="text-indigo-400" />
                <span>Gemini 2.0 / 1.5 Failover</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
                <Cpu size={12} className="text-slate-400" />
                <span>Isolated Client Threads</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
                <FileText size={12} className="text-slate-400" />
                <span>HMAC Signed PDF Reports</span>
              </li>
            </ul>
          </div>

          {/* Navigation & Documentation */}
          <div className="space-y-3 font-mono text-xs">
            <p className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--text-highlight)' }}>
              WORKSPACE
            </p>
            <ul className="space-y-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              <li>
                <button
                  onClick={() => navigate('/ingestion')}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  <span>Ingestion Pipeline</span>
                  <ArrowUpRight size={12} style={{ color: 'var(--text-highlight)' }} />
                </button>
              </li>
              <li>
                <a
                  href="/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  <span>FastAPI OpenAPI Spec</span>
                  <ArrowUpRight size={12} style={{ color: 'var(--text-highlight)' }} />
                </a>
              </li>
              <li>
                <a
                  href="/redoc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  <span>ReDoc Interface</span>
                  <ArrowUpRight size={12} style={{ color: 'var(--text-highlight)' }} />
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Lower Sub-Footer Bar */}
      <div
        className="w-full border-t py-5 px-6 sm:px-8 lg:px-12 font-mono text-[10px] tracking-wider uppercase flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 50%, var(--bg-secondary))',
          color: 'var(--text-secondary)',
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span>&copy; {currentYear} DAET Workbench</span>
          <span>•</span>
          <span>Survey Microdata Governance</span>
          <span>•</span>
          <span>MoSPI Specification Aligned</span>
        </div>

        <div className="flex items-center gap-2">
          <Terminal size={12} style={{ color: 'var(--text-highlight)' }} />
          <span>REACT 19 • FASTAPI • PYTHON 3.10+</span>
        </div>
      </div>
    </footer>
  );
}

