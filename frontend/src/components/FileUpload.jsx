import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, CheckCircle2, AlertCircle, FileText, Zap, Info } from 'lucide-react';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [stage, setStage] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    setFileInfo({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2) });
    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setStage('Uploading dataset');
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedData = uploadResponse.data;

      try {
        setStage('Generating statistical profile');
        const statsResponse = await axios.post('/api/statistics/profile', { file_path: uploadedData.metadata.file_path });
        uploadedData.statistics = statsResponse.data.stats;
      } catch (e) {
        // non-fatal, ignore profile errors
      }

      onUploadSuccess && onUploadSuccess(uploadedData);
      setStage('Complete');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      setTimeout(() => setStage(''), 800);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });

  return (
    <>
      {/* ===================== BUFFER ZONE / DROPZONE BOX ===================== */}
      <div
        {...getRootProps()}
        className={`relative group border rounded-sm transition-all duration-200 cursor-pointer overflow-hidden
        ${
          isDragActive
            ? 'border-blue-500 bg-blue-950/20'
            : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="p-12 text-center relative z-10">
          <div className={`mx-auto mb-4 w-12 h-12 rounded-sm border flex items-center justify-center transition-colors duration-200
            ${isDragActive ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-slate-300'}`}>
            <UploadCloud size={20} />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold font-mono tracking-tight text-slate-200">
              {isDragActive ? 'INITIALIZE_INGESTION_BUFFER' : 'LOAD SURVEY TARGET MATRIX'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Drag file arrays here or click to assign a storage system path. Optimized for flat structural calculations.
            </p>
          </div>

          {/* HIGH-DENSITY INTERFACE SYSTEM TAGS */}
          <div className="mt-6 flex items-center justify-center gap-3 text-[10px] font-mono font-bold text-slate-500 tracking-wider">
            <span className="flex items-center gap-1.5 border border-slate-900 bg-slate-950 px-2.5 py-1 rounded-sm">
              <FileText size={11} className="text-slate-400" /> CSV
            </span>
            <span className="flex items-center gap-1.5 border border-slate-900 bg-slate-950 px-2.5 py-1 rounded-sm">
              <FileText size={11} className="text-slate-400" /> XLSX
            </span>
            <span className="flex items-center gap-1.5 border border-blue-900/50 bg-blue-950/30 px-2.5 py-1 rounded-sm text-blue-400">
              <Zap size={11} /> FILE_MAX_BOUNDS
            </span>
          </div>
        </div>

        {/* SUBTLE INNER VECTOR BACKGROUND GLOW */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
        </div>
      </div>

      {/* ===================== STREAM REAL-TIME PIPELINE PIPES ===================== */}
      <div className="mt-4">
        {/* RUNNING AND PARSING STATE */}
        {isUploading && (
          <div className="bg-slate-950 border border-slate-900 rounded-sm p-4 font-mono">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Active Processing Pipeline</h4>
                  <p className="text-[11px] text-blue-400 font-medium mt-0.5">&gt;&gt; {stage || 'Parsing...'}...</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-sm">
                {fileInfo?.size} MB
              </span>
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-sm overflow-hidden">
              <div className="h-full bg-blue-500 animate-pulse w-[65%] rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-slate-500 text-[10px] uppercase tracking-wide border-t border-slate-900/60 pt-2.5">
               <Info size={11} className="text-slate-600" />
               <span>Metadata tracking: <span className="text-slate-400">{fileInfo?.name}</span></span>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {!isUploading && error && (
          <div className="bg-slate-950 border border-red-900/50 rounded-sm p-4 font-mono flex items-start gap-3">
            <div className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm mt-0.5">
              <AlertCircle size={15} />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Ingestion Exception Interrupted</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-2 text-[10px] font-bold text-red-400 uppercase tracking-wider hover:underline underline-offset-2">
                [ Clear Errors ]
              </button>
            </div>
          </div>
        )}

        {/* DISPATCH SUCCESS STATE */}
        {!isUploading && !error && fileInfo && (
          <div className="bg-slate-950 border border-emerald-900/50 rounded-sm p-4 font-mono flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-sm">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Processing Complete</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Dataset indexed. Structural vectors mapped completely.</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 tracking-wide uppercase font-bold bg-slate-900 border border-slate-800 px-2 py-1 rounded-sm">
              {fileInfo.size} MB
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default FileUpload;