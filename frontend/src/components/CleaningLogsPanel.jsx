import React, { useState, useEffect } from "react";
import axios from "axios";
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
        const response = await axios.get(`http://localhost:8000/api/logs/${metadata.filename}`);
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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 mt-10 shadow-sm antialiased text-slate-900 dark:text-slate-100">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-start gap-5">
          <div className="p-3 bg-slate-900 dark:bg-indigo-500 text-white rounded-lg shadow-lg">
            <History size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Audit Trail & Lineage</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 uppercase tracking-tighter">Instance: {metadata.filename}</span>
              <ChevronRight size={12} className="text-slate-300" />
              <p className="text-xs text-slate-500 font-medium italic">Immutable record of statistical cleaning operations</p>
            </div>
          </div>
        </div>

        {/* COMPACT SEARCH BAR */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search operation codes..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 placeholder:normal-case"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3.5 top-3 text-slate-400" size={14} />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Accessing Data Lineage...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
          <div className="inline-flex p-4 rounded-xl bg-white dark:bg-slate-800 text-slate-300 mb-4 border border-slate-100 dark:border-slate-700">
            <Layers size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Log Buffer Empty</h3>
          <p className="text-xs text-slate-500 mt-1">No cleaning heuristics have been committed to this dataset.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log, index) => (
            <div 
              key={index}
              className={`group border rounded-lg overflow-hidden transition-all duration-200 ${expandedLog === index ? 'border-indigo-500 ring-4 ring-indigo-500/5 bg-slate-50 dark:bg-slate-950' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'}`}
            >
              {/* LOG ITEM HEADER */}
              <div 
                onClick={() => setExpandedLog(expandedLog === index ? null : index)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className={`hidden sm:flex w-1.5 h-8 rounded-full ${
                    log.operation.includes('Missing') ? 'bg-blue-500' :
                    log.operation.includes('Outlier') ? 'bg-rose-500' :
                    'bg-emerald-500'
                  }`} />
                  
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 leading-none">
                        {log.operation}
                      </h4>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                        log.operation.includes('Missing') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                        log.operation.includes('Outlier') ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20' :
                        'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                      }`}>
                        {log.operation.includes('Missing') ? 'OP_MISSING' : log.operation.includes('Outlier') ? 'OP_ANOMALY' : 'OP_CLEAN'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 font-mono text-[10px] text-slate-400">
                      <Clock size={10} /> {log.timestamp}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 sm:mt-0 gap-8">
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Impacted Nodes</p>
                      <p className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
                        {log.rows_affected.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`text-slate-300 transition-transform duration-300 ${expandedLog === index ? 'rotate-180 text-indigo-500' : 'group-hover:text-slate-500'}`} 
                    size={16} 
                  />
                </div>
              </div>

              {/* EXPANDED DETAILS */}
              {expandedLog === index && (
                <div className="p-6 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-1 duration-300">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                          <UserCheck size={14} className="text-indigo-500" /> Operational Report
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-inner">
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Heuristic analysis identified and modified <span className="font-mono font-bold text-indigo-500">{log.rows_affected}</span> entries. 
                            The operation utilized a stateless transformation pipeline on source buffer <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-indigo-400">{metadata.filename}</span>.
                          </p>
                          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                            <ArrowRightLeft size={12} /> Data State: Synchronized
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                          <FileJson size={14} className="text-indigo-500" /> Statistical Parameters
                        </div>
                        <div className="bg-slate-950 rounded-lg p-5 border border-slate-800 shadow-2xl">
                          <div className="flex items-center gap-2 mb-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest opacity-50">
                            <Database size={10} /> JSON_Payload_Output
                          </div>
                          <pre className="text-[11px] font-mono text-indigo-400 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
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
      
      {/* FOOTER STATS */}
      {!loading && logs.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
          <span>Buffer: {logs.length} operations cached</span>
          <span>Integrity: System Level 1 Audit</span>
        </div>
      )}
    </div>
  );
};

export default CleaningLogsPanel;