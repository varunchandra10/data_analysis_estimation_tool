import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertCircle } from 'lucide-react';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUploadSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 
          ${isDragActive ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className={`p-5 rounded-full transition-colors duration-300 ${isDragActive ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
            <UploadCloud size={56} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              {isDragActive ? 'Drop your dataset here' : 'Click or drag dataset to upload'}
            </h3>
            <p className="text-base text-gray-500 dark:text-gray-400">
              Supports .csv and .xlsx files up to 50MB
            </p>
          </div>
        </div>
      </div>
      
      {isUploading && (
        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl flex items-center justify-center gap-3 animate-pulse">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-700 dark:border-purple-300"></div>
          <span className="font-medium">Uploading and processing dataset...</span>
        </div>
      )}
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl flex items-center justify-center gap-3">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
