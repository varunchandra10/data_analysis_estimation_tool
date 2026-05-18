import { Routes, Route, Navigate } from 'react-router-dom';
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
import ReportPanel from './components/ReportPanel';

const pushPath = (path) => {
  try {
    window.history.pushState({}, '', path);
  } catch (e) {
    window.location.hash = path;
  }
};

export default function AllRoutes({
  datasetData,
  setDatasetData,
  aiResults,
  aiResultsSourcePath,
  setAIResults,
  setAIResultsSourcePath,
  setActiveTab,
  setIsMobileMenuOpen,
  setAnalyticsViewData,
  analyticsViewData,
  validationResult,
  estimationResult,
  setEstimationResult,
  outlierResult,
  duplicateResult,
  activeAnalyticsData,
  missingValueInsights,
  outlierInsights,
  validationInsights
}) {
  const handleUploadSuccess = (data) => {
    setDatasetData(data);
    setAnalyticsViewData(null);
    setActiveTab('overview');
    pushPath('/dataset-explorer');
    setAIResults(null);
    setAIResultsSourcePath(null);
  };

  const handleWholeDatasetBack = () => {
    setActiveTab('overview');
    pushPath('/dataset-explorer');
  };

  const handleNullAnalysisComplete = (result) => {
    setAIResults(null);
    setAIResultsSourcePath(null);
    setAnalyticsViewData(null);
    setDatasetData((prev) => ({
      ...prev,
      preview: result.preview,
      metadata: {
        ...prev.metadata,
        file_path: result.file_path,
        dataset_name: prev.metadata.dataset_name || prev.metadata.filename,
        null_counts: result.null_counts,
      },
    }));
  };

  const handleAnomalyResult = (res) => {
    setOutlierResult(res);
    if (res?.file_path) {
      setAnalyticsViewData(null);
      setDatasetData((prev) => ({
        ...prev,
        preview: res.preview || prev.preview,
        metadata: { ...prev.metadata, file_path: res.file_path },
      }));
    }
  };

  const handleDedupingComplete = (result) => {
    setDuplicateResult(result);
    setAIResults(null);
    setAIResultsSourcePath(null);
    setAnalyticsViewData(null);
    setDatasetData((prev) => ({
      ...prev,
      preview: result.preview,
      metadata: {
        ...prev.metadata,
        file_path: result.file_path,
        rows: result.final_rows,
      },
    }));
  };

  const handleLogicValidationComplete = (res) => {
    setActiveTab('validation');
    if (res?.file_path) {
      setAIResults(null);
      setAIResultsSourcePath(null);
      setAnalyticsViewData(null);
      setDatasetData((prev) => ({
        ...prev,
        preview: res.preview || prev.preview,
        metadata: { ...prev.metadata, file_path: res.file_path },
      }));
    }
  };

  const handleVersionControlAnalytics = (analyticsDataset) => {
    setAnalyticsViewData(analyticsDataset);
    setActiveTab('analytics');
    setIsMobileMenuOpen(false);
  };

  if (!datasetData) {
    return (
      <Routes>
        <Route path="/" element={<Mainpage />} />
        <Route path="/ingestion" element={<IngestionPage onUploadSuccess={handleUploadSuccess} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/ingestion" element={<Navigate to="/dataset-explorer" replace />} />
      <Route path="/" element={<DatasetExplorer datasetData={datasetData} aiResults={aiResults} />} />
      <Route path="/dataset-explorer" element={<DatasetExplorer datasetData={datasetData} aiResults={aiResults} />} />
      <Route
        path="/whole-dataset"
        element={<WholeDatasetPage datasetData={datasetData} onBack={handleWholeDatasetBack} />}
      />
      <Route
        path="/null-analysis"
        element={
          <NullAnalysis data={datasetData} aiInsights={missingValueInsights} onCleaningComplete={handleNullAnalysisComplete} />
        }
      />
      <Route
        path="/anomaly-detection"
        element={
          <AnomalyDetection data={datasetData} aiInsights={outlierInsights} onResult={handleAnomalyResult} />
        }
      />
      <Route
        path="/deduping"
        element={
          <Deduping
            data={datasetData}
            aiInsights={aiResults?.duplicate_insights || []}
            onProcessComplete={handleDedupingComplete}
          />
        }
      />
      <Route
        path="/logic-validation"
        element={
          <LogicValidation data={datasetData} aiInsights={validationInsights} onValidationComplete={handleLogicValidationComplete} />
        }
      />
      <Route
        path="/weighting-engine"
        element={
          <WeightingEngine data={datasetData} aiInsights={aiResults?.weight_estimation_insights || []} onEstimationComplete={setEstimationResult} />
        }
      />
      <Route
        path="/statistical-engine"
        element={
          <StatisticalEngine
            datasetData={activeAnalyticsData}
            validationResult={validationResult}
            estimationResult={estimationResult}
            outlierResult={outlierResult}
            duplicateResult={duplicateResult}
            aiResults={aiResults}
          />
        }
      />
      <Route path="/version-control" element={<VersionControl data={datasetData} onViewAnalytics={handleVersionControlAnalytics} />} />
      <Route path="/report-center" element={<ReportPanel
        datasetData={datasetData}
        aiResults={aiResults}
        validationResult={validationResult}
        estimationResult={estimationResult}
        outlierResult={outlierResult}
        duplicateResult={duplicateResult}
        analyticsViewData={analyticsViewData}
      />} />
      <Route path="/audit-trail" element={<AuditTrail data={datasetData} />} />
    </Routes>
  );
}
