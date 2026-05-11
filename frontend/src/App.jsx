import { useState } from 'react';
import FileUpload from './components/FileUpload';
import DatasetPreview from './components/DatasetPreview';
import './App.css';

function App() {
  const [datasetData, setDatasetData] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#08060d] text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              D
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              DAET Platform
            </h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Settings</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full flex flex-col">
        
        {/* Hero Section */}
        {!datasetData && (
          <div className="text-center max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white">
              AI-Augmented <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
                Survey Data Processing
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Upload your dataset to automatically detect schemas, identify missing values, and prepare for statistical estimation.
            </p>
          </div>
        )}

        {/* Upload Component */}
        {!datasetData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
            <FileUpload onUploadSuccess={(data) => setDatasetData(data)} />
          </div>
        )}

        {/* Dataset Preview Dashboard */}
        {datasetData && (
          <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dataset Overview</h2>
              <button 
                onClick={() => setDatasetData(null)}
                className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 rounded-lg transition-colors"
              >
                Upload Another Dataset
              </button>
            </div>
            <DatasetPreview data={datasetData} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
          <p>© 2026 MOSPI DAET Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
