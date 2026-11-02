import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Table,
  FileSpreadsheet,
  Download,
  Database,
  ArrowRight,
  FileText
} from 'lucide-react';

// Reusable Components
import { DatasetKpiCards, DataGridTable } from '../../components/dataset';
import { FilterButtonGroup } from '../../components/common';
import DatasheetViewer from '../../components/complete_dataset/complete_dataset_viewer';

/**
 * WholeDatasetPage
 * Dual-mode dataset inspection suite:
 * - Full-coordinate interactive spreadsheet matrix
 * - Searchable tabular data grid with live filter & CSV export
 */
export default function WholeDatasetPage({ datasetData, onBack }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('spreadsheet'); // 'spreadsheet' | 'searchable'
  const [showKpis, setShowKpis] = useState(true);

  // Esc keyboard shortcut to return to Explorer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onBack) onBack();
        else navigate('/dataset-explorer');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, navigate]);

  const datasetId = datasetData?.metadata?.file_path || '';
  const initialFileName =
    datasetData?.metadata?.filename ||
    datasetData?.metadata?.dataset_name ||
    datasetData?.dataset_name ||
    'dataset.csv';

  const metadata = useMemo(() => datasetData?.metadata || {}, [datasetData]);
  const schema = useMemo(() => {
    if (Array.isArray(datasetData?.schema) && datasetData.schema.length > 0) {
      return datasetData.schema;
    }
    if (datasetData?.preview && datasetData.preview.length > 0) {
      return Object.keys(datasetData.preview[0]).map((col) => ({
        column: col,
        type: typeof datasetData.preview[0][col] === 'number' ? 'Numerical' : 'Categorical',
        pandas_dtype: typeof datasetData.preview[0][col] === 'number' ? 'float64' : 'object',
      }));
    }
    return [];
  }, [datasetData]);

  // Macro KPI Calculations
  const totalRows = Number(metadata?.rows ?? datasetData?.preview?.length ?? 0);
  const totalColumns = Number(metadata?.columns ?? schema?.length ?? 0);
  const totalNullCells = useMemo(() => {
    const counts = metadata?.null_counts || {};
    return Object.values(counts).reduce((acc, curr) => acc + Number(curr || 0), 0);
  }, [metadata]);

  const columnsWithNulls = useMemo(() => {
    const counts = metadata?.null_counts || {};
    return Object.entries(counts).filter(([, count]) => count > 0);
  }, [metadata]);

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

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dataset-explorer');
    }
  };

  const handleExportCSV = () => {
    if (!datasetData?.preview || datasetData.preview.length === 0) return;
    const cols = Object.keys(datasetData.preview[0]);
    const csvContent = [cols.join(',')];
    datasetData.preview.forEach((row) => {
      csvContent.push(cols.map((col) => `"${row[col] ?? ''}"`).join(','));
    });
    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${initialFileName.replace(/\.[^/.]+$/, '')}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewModeOptions = [
    { id: 'spreadsheet', label: 'Spreadsheet Grid', icon: FileSpreadsheet },
    { id: 'searchable', label: 'Searchable Table', icon: Table },
  ];

  // Standby Empty State if no active dataset buffer is loaded
  if (!datasetData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 font-sans">
        <div className="flex flex-col items-center justify-center p-14 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm max-w-lg mx-auto">
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mb-4 shadow-2xs">
            <Database size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono uppercase tracking-tight">
            No Active Dataset Loaded
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm leading-relaxed">
            Ingest a survey microdata file or select an active file in Dataset Explorer to view the complete coordinate datasheet.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dataset-explorer')}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer font-mono"
          >
            <span>Open Dataset Explorer</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden animate-in fade-in duration-150">
      
      {/* ========================================================= */}
      {/* 1. TOP NAVIGATION & VIEW SELECTOR BAR                     */}
      {/* ========================================================= */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs backdrop-blur-md">
        
        {/* Breadcrumb & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer shadow-2xs"
            title="Return to Dataset Explorer (Esc)"
          >
            <ChevronLeft size={16} />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <span>Workspace</span>
              <span>/</span>
              <span>Data</span>
              <span>/</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Full Dataset View</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h1 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                {initialFileName}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.2 rounded-md border border-slate-200 dark:border-slate-700">
                <FileText size={10} />
                {totalRows.toLocaleString()} rows × {totalColumns} cols
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Toggle, Export & KPI Collapse */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="Download preview as CSV"
          >
            <Download size={13} className="text-indigo-500" />
            <span>Export CSV</span>
          </button>

          <FilterButtonGroup
            options={viewModeOptions}
            activeId={viewMode}
            onChange={setViewMode}
            size="sm"
          />

          <button
            type="button"
            onClick={() => setShowKpis(!showKpis)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors shadow-2xs"
            title={showKpis ? 'Collapse KPI Cards' : 'Expand KPI Cards'}
          >
            <span>KPIs</span>
            {showKpis ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. REUSABLE DATASET KPI CARDS (COLLAPSIBLE STRIP)         */}
      {/* ========================================================= */}
      {showKpis && (
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shrink-0 animate-in slide-in-from-top-1 duration-200">
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
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. DUAL-MODE DATASET VIEWER CONTENT                       */}
      {/* ========================================================= */}
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden relative">
        {viewMode === 'spreadsheet' ? (
          /* Option 1: Full-screen interactive coordinate spreadsheet */
          <DatasheetViewer
            datasetId={datasetId}
            initialFileName={initialFileName}
            onBack={handleBack}
          />
        ) : (
          /* Option 2: Live searchable DataGridTable primitive */
          <div className="h-full overflow-y-auto p-5 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
              <DataGridTable
                rows={datasetData?.preview || []}
                columns={schema.map((s) => s.column)}
                totalRows={totalRows}
                onExportCSV={handleExportCSV}
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
