import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Mainpage from './pages/home/Mainpage';
import IngestionPage from './pages/ingestion/IngestionPage';
import DatasetExplorer from './pages/data/DatasetExplorer';
import WholeDatasetPage from './pages/data/WholeDatasetPage';
import NullAnalysis from './pages/cleaning/NullAnalysis';
import AnomalyDetection from './pages/cleaning/AnomalyDetection';
import Deduping from './pages/cleaning/Deduping';
import LogicValidation from './pages/cleaning/LogicValidation';
import WeightingEngine from './pages/cleaning/WeightingEngine';
import StatisticalEngine from './pages/analysis/StatisticalEngine';
import VersionControl from './pages/versioning/VersionControl';
import AuditTrail from './pages/cleaning/AuditTrail';
import ReportContainer from './components/ReportContainer';

import { useDatasetContext } from './context/DatasetContext';
import { useAIContext } from './context/AIContext';

/**
 * Enterprise Application Routing Table
 * Maps core pipeline pages, guards unhydrated session buffers,
 * and maintains canonical routing aliases across the workspace.
 */
export default function AllRoutes() {
  const {
    loadingSession,
    datasetData,
    setDatasetData,
    setAnalyticsViewData,
    setActiveTab,
  } = useDatasetContext();

  const {
    aiResults,
    setAIResults,
    setAIResultsSourcePath,
  } = useAIContext();

  const navigate = useNavigate();

  const handleUploadSuccess = (data) => {
    setDatasetData(data);
    setAnalyticsViewData(null);
    setActiveTab('overview');
    navigate('/dataset-explorer');
    setAIResults(null);
    setAIResultsSourcePath(null);
  };

  const handleWholeDatasetBack = () => {
    setActiveTab('overview');
    navigate('/dataset-explorer');
  };

  // Guard against F5 refresh race condition while local storage session hydrates
  if (loadingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-slate-500 font-sans">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-sm" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold font-mono">
          Restoring Session Context...
        </p>
      </div>
    );
  }

  // Pre-ingestion routes (Landing Page & Intake Portal)
  if (!datasetData) {
    return (
      <Routes>
        <Route path="/" element={<Mainpage />} />
        <Route path="/ingestion" element={<IngestionPage onUploadSuccess={handleUploadSuccess} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Active dataset workspace routes
  return (
    <Routes>
      {/* Root & Discovery Routes */}
      <Route path="/" element={<DatasetExplorer datasetData={datasetData} aiResults={aiResults} />} />
      <Route path="/dataset-explorer" element={<DatasetExplorer datasetData={datasetData} aiResults={aiResults} />} />
      <Route
        path="/whole-dataset"
        element={<WholeDatasetPage datasetData={datasetData} onBack={handleWholeDatasetBack} />}
      />

      {/* Quality & Cleaning Pipeline Routes */}
      <Route path="/null-analysis" element={<NullAnalysis />} />
      <Route path="/anomaly-detection" element={<AnomalyDetection />} />
      <Route path="/deduping" element={<Deduping />} />
      <Route path="/logic-validation" element={<LogicValidation />} />
      <Route path="/weighting-engine" element={<WeightingEngine />} />

      {/* Analytics, Versioning & Audit Routes */}
      <Route path="/statistical-engine" element={<StatisticalEngine />} />
      <Route path="/version-control" element={<VersionControl />} />
      <Route path="/report-center" element={<ReportContainer />} />
      <Route path="/audit-trail" element={<AuditTrail />} />

      {/* Canonical Navigation Aliases & Fallbacks */}
      <Route path="/ingestion" element={<Navigate to="/dataset-explorer" replace />} />
      <Route path="/data/preview" element={<Navigate to="/dataset-explorer" replace />} />
      <Route path="/data/whole-dataset" element={<Navigate to="/whole-dataset" replace />} />
      <Route path="/data/dataset" element={<Navigate to="/whole-dataset" replace />} />
      <Route path="/analytics" element={<Navigate to="/statistical-engine" replace />} />
      <Route path="/processing/missing" element={<Navigate to="/null-analysis" replace />} />
      <Route path="/processing/duplicates" element={<Navigate to="/deduping" replace />} />
      <Route path="/processing/outliers" element={<Navigate to="/anomaly-detection" replace />} />
      <Route path="/processing/rules" element={<Navigate to="/logic-validation" replace />} />
      <Route path="/processing/weighting" element={<Navigate to="/weighting-engine" replace />} />
      <Route path="/cleaning/audit-trail" element={<Navigate to="/audit-trail" replace />} />

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/dataset-explorer" replace />} />
    </Routes>
  );
}
