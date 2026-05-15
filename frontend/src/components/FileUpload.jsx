import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud,
  AlertCircle,
  FileText,
  CheckCircle2,
  Loader2,
  Info,
  Sigma,
  BarChart3,
  Activity,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [stage, setStage] = useState("");

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    setFileInfo({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
      type: file.name.split('.').pop().toUpperCase()
    });

    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    setError(null);

    try {
      setStage("Uploading dataset");
      const uploadResponse = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedData = uploadResponse.data;

      setStage("Generating statistical profile");
      const statsResponse = await axios.post('http://localhost:8000/api/statistics/profile', {
        file_path: uploadedData.metadata.file_path
      });
      uploadedData.statistics = statsResponse.data.stats;

      setStage("Generating AI recommendations");
      try {
        const aiResponse = await axios.post('http://localhost:8000/api/ai/recommendations', {
          file_path: uploadedData.metadata.file_path,
          schema: uploadedData.schema
        });
        uploadedData.ai = aiResponse.data;
      } catch (aiError) {
        console.warn("AI generation failed:", aiError);
        uploadedData.ai = { recommendations: [] };
      }

      onUploadSuccess(uploadedData);
    } catch (err) {
      setError(err.response?.data?.detail || 'System error: Failed to parse dataset.');
    } finally {
      setIsUploading(false);
      setStage("");
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 px-4 antialiased font-sans">
      {/* HEADER SECTION - Systematic and Professional */}
      <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-indigo-600 rounded">
              <Database size={16} className="text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Data Pipeline V2.0
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ingestion Engine
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
            Upload structured data for automated <span className="text-slate-900 dark:text-slate-200 font-medium text-sm">feature engineering</span>, 
            statistical profiling, and schema validation.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase">System Status</span>
            <div className="flex items-center gap-2 mt-1">
               <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
               <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Server Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN - THE INTERFACE */}
        <div className="lg:col-span-8 space-y-6">
          <div
            {...getRootProps()}
            className={`relative group border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer overflow-hidden
            ${
              isDragActive
                ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-950'
            }`}
          >
            <input {...getInputProps()} />
            
            <div className="p-12 text-center relative z-10">
              <div className={`mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                ${isDragActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                <UploadCloud size={32} />
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {isDragActive ? 'Drop to Initialize Process' : 'Select Research Dataset'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Drag files here or click to browse. Supports large-scale <span className="font-mono text-indigo-500">.csv</span> and <span className="font-mono text-indigo-500">.xlsx</span> formats.
                </p>
              </div>

              {/* FORMAT PILLS */}
              <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                <span className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full">
                  <FileText size={12} /> CSV
                </span>
                <span className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full">
                  <FileText size={12} /> XLSX
                </span>
                <span className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full text-indigo-500 border-indigo-100 dark:border-indigo-900/50">
                   <Zap size={12} /> MAX 50MB
                </span>
              </div>
            </div>

            {/* DECORATIVE GRID PATTERN FOR PROFESSIONAL FEEL */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
          </div>

          {/* UPLOADING STATE */}
          {isUploading && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                    <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Processing Pipeline</h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">{stage}...</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {fileInfo?.size} MB
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 animate-progress-buffer w-[65%] rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]"></div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                 <Info size={12} className="text-slate-400" />
                 <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Metadata: {fileInfo?.name}</p>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-5 flex items-start gap-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg text-red-600">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-red-800 dark:text-red-400 uppercase tracking-tight">Ingestion Interrupted</h4>
                <p className="text-sm text-red-700 dark:text-red-300/80 mt-1 leading-relaxed">{error}</p>
                <button onClick={() => setError(null)} className="mt-3 text-xs font-bold text-red-600 underline underline-offset-4">Retry Upload</button>
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {!isUploading && !error && fileInfo && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-tight">Processing Complete</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300/80 mt-0.5 font-medium">Dataset indexed, statistical vectors mapped.</p>
                </div>
              </div>
              <ArrowRight className="text-emerald-500" size={20} />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - ANALYST INSIGHTS / STATS PREVIEW */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 dark:bg-slate-900 rounded-xl p-6 text-white shadow-xl">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <ShieldCheck size={14} className="text-indigo-400" />
               Validation Workflow
             </h4>
             
             <ul className="space-y-6">
                {[
                  { icon: <Sigma size={16}/>, label: "Descriptive Stats", desc: "Mean, Median, Std Dev" },
                  { icon: <BarChart3 size={16}/>, label: "Data Profiling", desc: "Outlier & Null Detection" },
                  { icon: <Activity size={16}/>, label: "AI Insights", desc: "Contextual Recommendations" },
                  { icon: <Database size={16}/>, label: "Schema Map", desc: "Type Inference & Casting" }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="text-indigo-400 mt-1">{item.icon}</div>
                    <div>
                      <p className="text-xs font-bold tracking-tight">{item.label}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </li>
                ))}
             </ul>

             <div className="mt-8 pt-6 border-t border-slate-800">
               <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">ENCRYPTION</span>
                  <span className="text-[10px] font-mono text-emerald-400">AES-256</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;