import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Type,
  Eye,
  Loader2,
  Sigma,
  Download,
  ArrowRight,
  BarChart2,
  FileText,
} from 'lucide-react';

// Modular Reusable Dataset Components
import {
  DatasetKpiCards,
  PipelineActionStrip,
  ColumnDiagnosticsGrid,
  DataDictionaryTable,
  DataGridTable,
  AttributeProfiler,
} from './dataset';

import StatisticsPanel from './StatisticsPanel';

/**
 * DatasetPreview - Orchestrator Component
 * Composes reusable data domain components (KPI cards, pipeline actions, column diagnostics,
 * schema specification dictionary, spreadsheet data grid, attribute profiler, and statistics panel).
 */
export default function DatasetPreview({ data, aiResults }) {
  const navigate = useNavigate();

  // Navigation & View States
  const [activeTab, setActiveTab] = useState('schema'); // 'schema' | 'preview' | 'profiles' | 'statistics'
  const [selectedProfileCol, setSelectedProfileCol] = useState(null);

  const preview = useMemo(() => data?.preview || [], [data?.preview]);
  const metadata = data?.metadata;
  const statistics = data?.statistics;

  // Schema normalizer
  const schema = useMemo(() => {
    if (Array.isArray(data?.schema) && data.schema.length > 0) return data.schema;
    if (preview && preview.length > 0) {
      return Object.keys(preview[0]).map((column) => ({
        column,
        type: typeof preview[0][column] === 'number' ? 'Numerical' : 'Categorical',
        pandas_dtype: typeof preview[0][column] === 'number' ? 'float64' : 'object',
      }));
    }
    return [];
  }, [data?.schema, preview]);

  const previewColumns = useMemo(() => {
    return preview && preview.length > 0 ? Object.keys(preview[0]) : [];
  }, [preview]);

  const aiRecommendations = useMemo(() => {
    return aiResults?.recommendations || [];
  }, [aiResults]);

  // Macro Metrics Calculations
  const totalRows = metadata?.rows ?? preview.length;
  const totalColumns = metadata?.columns ?? schema.length;
  const nullCounts = useMemo(() => metadata?.null_counts || {}, [metadata?.null_counts]);

  const totalNullCells = useMemo(() => {
    return Object.values(nullCounts).reduce((acc, curr) => acc + Number(curr || 0), 0);
  }, [nullCounts]);

  const columnsWithNulls = useMemo(() => {
    return Object.entries(nullCounts).filter(([, count]) => count > 0);
  }, [nullCounts]);

  const numericalColumns = useMemo(() => {
    return schema.filter(
      (s) => s.type === 'Numerical' || s.type === 'Integer' || s.type === 'Float'
    );
  }, [schema]);

  const categoricalColumns = useMemo(() => {
    return schema.filter(
      (s) => s.type !== 'Numerical' && s.type !== 'Integer' && s.type !== 'Float'
    );
  }, [schema]);

  const missingPercentage = useMemo(() => {
    const totalCells = totalRows * (totalColumns || 1);
    if (!totalCells) return 0;
    return ((totalNullCells / totalCells) * 100).toFixed(2);
  }, [totalRows, totalColumns, totalNullCells]);

  const integrityScore = useMemo(() => {
    const penalty = parseFloat(missingPercentage) * 4;
    return Math.max(70, Math.min(100, Math.round(100 - penalty)));
  }, [missingPercentage]);

  // Active selected profile column for Tab 3
  const activeProfileColumn =
    selectedProfileCol || (numericalColumns[0]?.column || previewColumns[0] || '');

  // Guard against unhydrated dataset context
  if (!data || !data.metadata) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-24 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-sans shadow-sm">
        <Loader2 className="animate-spin mb-4 text-indigo-500" size={28} />
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Initializing Dataset Context...
        </p>
      </div>
    );
  }

  // Export Handlers
  const handleExportCSV = () => {
    if (!preview || preview.length === 0) return;
    const cols = Object.keys(preview[0]);
    const csvContent = [cols.join(',')];
    preview.forEach((row) => {
      csvContent.push(cols.map((col) => `"${row[col] ?? ''}"`).join(','));
    });
    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata?.filename || 'dataset'}_preview.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMetadata = () => {
    const metaJSON = JSON.stringify({ metadata, schema, statistics }, null, 2);
    const blob = new Blob([metaJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata?.filename || 'dataset'}_profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleColumnSelect = (colName) => {
    setSelectedProfileCol(colName);
    setActiveTab('profiles');
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 py-4 animate-in fade-in duration-200 antialiased font-sans text-slate-800 dark:text-slate-100">
      
      {/* ========================================================= */}
      {/* 1. SOURCE BUFFER STATUS & WORKSPACE TOOLBAR              */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-5 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Source Buffer Ready
          </span>
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
            • Active In-Memory Microdata Stream
          </span>
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/whole-dataset')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Inspect full dataset with pagination & virtual scrolling"
          >
            <Table size={13} className="text-indigo-500" />
            <span>Full Dataset Viewer</span>
            <ArrowRight size={12} className="text-slate-400" />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Download preview rows as CSV"
          >
            <Download size={13} className="text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportMetadata}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Export schema and profile metadata as JSON"
          >
            <FileText size={13} className="text-slate-500 dark:text-slate-400" />
            <span>Export Metadata</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FIVE KEY MACRO INTELLIGENCE CARDS (REUSABLE COMPONENT)  */}
      {/* ========================================================= */}
      <DatasetKpiCards
        metadata={metadata}
        schema={schema}
        totalRows={totalRows}
        totalColumns={totalColumns}
        numericalCount={numericalColumns.length}
        categoricalCount={categoricalColumns.length}
        totalNullCells={totalNullCells}
        missingPercentage={missingPercentage}
        columnsWithNullsCount={columnsWithNulls.length}
        integrityScore={integrityScore}
        className="mb-5"
      />

      {/* ========================================================= */}
      {/* 3. INTERACTIVE SMART PIPELINE ACTION STRIP (REUSABLE)      */}
      {/* ========================================================= */}
      <PipelineActionStrip
        columnsWithNullsCount={columnsWithNulls.length}
        onNavigate={navigate}
        className="mb-5"
      />

      {/* ========================================================= */}
      {/* 4. AUTOMATED COLUMN DIAGNOSTICS GRID (REUSABLE)            */}
      {/* ========================================================= */}
      <ColumnDiagnosticsGrid
        diagnostics={aiRecommendations}
        schema={schema}
        nullCounts={nullCounts}
        totalRows={totalRows}
        onColumnClick={handleColumnSelect}
        className="mb-6"
      />

      {/* ========================================================= */}
      {/* 5. MAIN TABBED EXPLORATION MODULE                         */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden mb-8">
        
        {/* TAB CONTROLS HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 bg-slate-50/80 dark:bg-slate-900/60 overflow-x-auto">
          <div className="flex gap-6 shrink-0">
            
            {/* TAB 1: SCHEMA */}
            <button
              onClick={() => setActiveTab('schema')}
              className={`py-3.5 text-xs font-semibold tracking-wide flex items-center gap-2 transition-all relative cursor-pointer ${
                activeTab === 'schema'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Type size={14} />
              <span>Schema Specification</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 font-mono">
                {schema.length}
              </span>
              {activeTab === 'schema' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 dark:bg-indigo-500 rounded-full" />
              )}
            </button>

            {/* TAB 2: DATA EXPLORER */}
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-3.5 text-xs font-semibold tracking-wide flex items-center gap-2 transition-all relative cursor-pointer ${
                activeTab === 'preview'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Eye size={14} />
              <span>Data Grid Preview</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 font-mono">
                {preview.length} rows
              </span>
              {activeTab === 'preview' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 dark:bg-indigo-500 rounded-full" />
              )}
            </button>

            {/* TAB 3: COLUMN PROFILES & HISTOGRAMS */}
            <button
              onClick={() => setActiveTab('profiles')}
              className={`py-3.5 text-xs font-semibold tracking-wide flex items-center gap-2 transition-all relative cursor-pointer ${
                activeTab === 'profiles'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <BarChart2 size={14} />
              <span>Visual Attribute Profiler</span>
              {activeTab === 'profiles' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 dark:bg-indigo-500 rounded-full" />
              )}
            </button>

            {/* TAB 4: DESCRIPTIVE STATISTICS */}
            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-3.5 text-xs font-semibold tracking-wide flex items-center gap-2 transition-all relative cursor-pointer ${
                activeTab === 'statistics'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Sigma size={14} />
              <span>Descriptive Statistics</span>
              {activeTab === 'statistics' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 dark:bg-indigo-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: REUSABLE DATA DICTIONARY TABLE */}
        {activeTab === 'schema' && (
          <DataDictionaryTable
            schema={schema}
            nullCounts={nullCounts}
            totalRows={totalRows}
            onColumnClick={handleColumnSelect}
          />
        )}

        {/* TAB 2: REUSABLE DATA GRID TABLE */}
        {activeTab === 'preview' && (
          <DataGridTable
            rows={preview}
            columns={previewColumns}
            totalRows={totalRows}
            onExportCSV={handleExportCSV}
            onOpenFullDataset={() => navigate('/whole-dataset')}
          />
        )}

        {/* TAB 3: REUSABLE ATTRIBUTE PROFILER */}
        {activeTab === 'profiles' && (
          <AttributeProfiler
            schema={schema}
            previewRows={preview}
            nullCounts={nullCounts}
            selectedColumn={activeProfileColumn}
            onSelectColumn={setSelectedProfileCol}
          />
        )}

        {/* TAB 4: DESCRIPTIVE STATISTICS */}
        {activeTab === 'statistics' && (
          <div className="p-5 bg-slate-50/20 dark:bg-slate-950/20">
            {statistics ? (
              <StatisticsPanel statistics={statistics} />
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-12 text-center text-sm text-slate-500">
                Descriptive statistics are not available for this dataset version yet.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
