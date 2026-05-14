import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Layers, 
  UserCheck, 
  ChevronDown,
  FileJson
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
        // Reverse logs to show newest first
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
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 mt-8 shadow-sm transition-all duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <History size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Historical record of all data cleaning operations performed on this dataset.
            </p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search operations..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Retrieving audit history...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
          <div className="inline-flex p-4 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-400 mb-4">
            <Layers size={32} />
          </div>
          <h3 className="text-gray-900 dark:text-white font-bold">No logs found</h3>
          <p className="text-gray-500 text-sm">No operations have been recorded for this file yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log, index) => (
            <div 
              key={index}
              className={`border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden transition-all duration-200 ${expandedLog === index ? 'ring-2 ring-indigo-500/20' : ''}`}
            >
              {/* LOG ITEM HEADER */}
              <div 
                onClick={() => setExpandedLog(expandedLog === index ? null : index)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    log.operation.includes('Missing') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                    log.operation.includes('Outlier') ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                    'bg-green-100 text-green-600 dark:bg-green-900/30'
                  }`}>
                    <Layers size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{log.operation}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400 font-medium uppercase tracking-tighter">
                        <Calendar size={12} /> {log.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 sm:mt-0 gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Rows Affected</p>
                    <p className={`text-lg font-black ${log.rows_affected > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                      {log.rows_affected.toLocaleString()}
                    </p>
                  </div>
                  <ChevronDown 
                    className={`text-gray-400 transition-transform duration-300 ${expandedLog === index ? 'rotate-180' : ''}`} 
                    size={20} 
                  />
                </div>
              </div>

              {/* EXPANDED DETAILS */}
              {expandedLog === index && (
                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 duration-300">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                          <UserCheck size={14} /> System Summary
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          The system processed {log.rows_affected} records using the specified algorithm parameters. 
                          The source file <span className="font-mono text-xs">{metadata.filename}</span> has been updated.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                          <FileJson size={14} /> Metadata
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                          <pre className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 overflow-x-auto">
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
    </div>
  );
};

export default CleaningLogsPanel;