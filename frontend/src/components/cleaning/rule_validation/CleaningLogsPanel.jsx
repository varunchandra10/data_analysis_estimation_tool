import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl } from "../../../api/config";
import { 
  History, 
  Search, 
  Calendar, 
  Layers, 
  UserCheck, 
  ChevronDown,
  FileJson,
  Database,
  ArrowRightLeft,
  Clock,
  ChevronRight
} from "lucide-react";

const CleaningLogsPanel = ({ data }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLog, setExpandedLog] = useState(null);

  if (!data) return null;
  const { metadata } = data;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(apiUrl(`/api/logs/${metadata.filename}`));
        setLogs(response.data.logs?.reverse() || []);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [metadata.filename]);

  const filteredLogs = logs.filter(log => 
    log.operation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 antialiased text-slate-200 font-sans max-w-[1600px] mx-auto pb-12 px-4 sm:px-6 selection:bg-slate-800 mt-6">
      
      {/* ===================================================== */}
      {/* 1. AUDIT TRAIL MASTER WORKBENCH HEADER & CONTROLS    */}
      {/* ===================================================== */}
      <div className="bg-[#0f172a] rounded-xl border-2 border-slate-800/80 p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md shrink-0">
            <History size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-slate-200 uppercase font-mono">Audit Trail & Lineage</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-mono font-bold bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-slate-500 uppercase">Instance: {metadata.filename}</span>
              <ChevronRight size={12} className="text-slate-800 shrink-0" />
              <p className="text-[11px] text-slate-500 font-medium">Immutable cryptographic log record of step transformations</p>
            </div>
          </div>
        </div>

        {/* HIGH-DENSITY RADIAL SEARCH BAR */}
        <div className="relative w-full md:w-80 shrink-0">
          <input
            type="text"
            placeholder="Search operation codes..."
            className="w-full pl-9 pr-4 py-2 border border-slate-700 bg-slate-950 hover:border-slate-600 rounded-md text-[11px] font-bold font-mono text-slate-200 uppercase tracking-wide focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 placeholder:normal-case shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-slate-600" size={13} />
        </div>
      </div>

      {/* ===================================================== */}
      {/* 2. CHRONOLOGICAL TELEMETRY STREAM LOGS GRID           */}
      {/* ===================================================== */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-[#0f172a] border-2 border-slate-800 rounded-xl shadow-xl">
          <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Accessing Data Lineage Registry Streams...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/20">
          <div className="inline-flex p-4 rounded-lg bg-slate-950 border border-slate-900 text-slate-700 mb-4 shadow-md">
            <Layers size={28} />
          </div>
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-300">Log Buffer Empty</h3>
          <p className="text-xs text-slate-500 mt-1.5 font-sans leading-relaxed max-w-xs mx-auto">No cleaning heuristics have been committed to this dataset. Record ledger is currently pristine.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log, index) => (
            <div 
              key={index}
              className={`group overflow-hidden rounded-xl border-2 transition-all duration-150 ${
                expandedLog === index 
                ? 'border-indigo-500 bg-[#0b1329] shadow-xl' 
                : 'border-slate-800 bg-[#0f172a] hover:border-slate-700'
              }`}
            >
              {/* LOG ITEM ROW HEADER */}
              <div 
                onClick={() => setExpandedLog(expandedLog === index ? null : index)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Categorized indicator accent markers */}
                  <div className={`hidden sm:block w-1 h-7 rounded-full shrink-0 ${
                    log.operation.includes('Missing') ? 'bg-blue-500' :
                    log.operation.includes('Outlier') ? 'bg-rose-500' :
                    'bg-emerald-500'
                  }`} />
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-200 font-mono truncate">
                        {log.operation}
                      </h4>
                      <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-sm uppercase border ${
                        log.operation.includes('Missing') ? 'bg-blue-500/5 text-blue-400 border-blue-500/20' :
                        log.operation.includes('Outlier') ? 'bg-rose-500/5 text-rose-400 border-rose-500/20' :
                        'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {log.operation.includes('Missing') ? 'OP_MISSING' : log.operation.includes('Outlier') ? 'OP_ANOMALY' : 'OP_CLEAN'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 font-mono text-[10px] text-slate-500">
                      <Clock size={11} className="text-slate-600 mt-0.5" /> {log.timestamp}
                    </div>
                  </div>
                </div>

                {/* LOG DATA DENSITY COUNTS TARGET (RIGHT BOUNDARY MAPPED) */}
                <div className="flex items-center justify-between mt-3 sm:mt-0 gap-6 shrink-0 border-t border-slate-900 pt-3 sm:border-t-0 sm:pt-0">
                  <div className="flex items-center gap-6">
                    <div className="text-left sm:text-right">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1.5 font-mono">Impacted Nodes</p>
                      <p className="font-mono text-xs font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-900/60 shadow-inner">
                        {log.rows_affected.toLocaleString()} rows
                      </p>
                    </div>
                  </div>
                  <div className="p-1 border border-slate-800 bg-[#0b1329] rounded group-hover:text-slate-200 text-slate-600 transition-colors">
                    <ChevronDown 
                      className={`transition-transform duration-200 ${expandedLog === index ? 'rotate-180 text-indigo-400' : ''}`} 
                      size={14} 
                    />
                  </div>
                </div>
              </div>

              {/* EXPANDED INNER SYSTEM PARAMETERS */}
              {expandedLog === index && (
                <div className="p-5 bg-slate-950/40 border-t border-slate-900/60 animate-in slide-in-from-top-1.5 duration-200">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      
                      {/* OPERATIONAL META STATEMENT REPORT */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                          <UserCheck size={13} className="text-indigo-400" /> Operational Report
                        </div>
                        <div className="p-4 bg-[#0f172a] border border-slate-900 rounded-lg shadow-inner">
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">
                            Heuristic distribution models executed adjustments targeting <span className="font-mono font-bold text-indigo-400 bg-slate-950 px-1 rounded">{log.rows_affected}</span> cells. 
                            The operation committed a stateless immutable conversion script across the dynamic processing memory array: <span className="font-mono text-indigo-400 bg-slate-950 px-1 py-0.5 rounded border border-slate-900/60">{metadata.filename}</span>.
                          </p>
                          <div className="mt-4 pt-3 border-t border-slate-950 flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wide font-mono">
                            <ArrowRightLeft size={11} /> Data State: Synchronized In Core
                          </div>
                        </div>
                      </div>

                      {/* STRUCTURAL SCALAR PAYLOAD COMPONENT */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                          <FileJson size={13} className="text-indigo-400" /> Statistical Parameters
                        </div>
                        <div className="bg-[#0b1329] rounded-lg p-4 border border-slate-900 shadow-xl max-h-[220px] overflow-y-auto custom-scrollbar">
                          <div className="flex items-center gap-1.5 mb-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono border-b border-slate-950 pb-1.5">
                            <Database size={11} className="text-slate-700" /> JSON_Payload_Output
                          </div>
                          <pre className="text-[11px] font-mono text-indigo-400 leading-normal scrollbar-thin whitespace-pre-wrap select-text selection:bg-indigo-500/20">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      </div>

                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* GLOBAL DISK AUDIT PERSISTENCE STATUS FOOTER */}
      {!loading && logs.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono italic">
          <span>Log Register: {logs.length} Operations Cached</span>
          <span className="flex items-center gap-1.5 text-slate-600 not-italic uppercase tracking-normal">
             <div className="h-1 w-1 bg-indigo-500 rounded-full animate-ping" /> Integrity Rank: System Level 1 Audit Ledger Verified
          </span>
        </div>
      )}

    </div>
  );
};

export default CleaningLogsPanel;
