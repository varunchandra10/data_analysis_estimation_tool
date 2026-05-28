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
import ReportContainer from './components/ReportContainer';
import { useNavigate } from 'react-router-dom';

import { useDatasetContext } from './context/DatasetContext';
import { useAIContext } from './context/AIContext';

export default function AllRoutes() {
  const {
    datasetData,
    setDatasetData,
    validationResult,
    setValidationResult,
    estimationResult,
    setEstimationResult,
    outlierResult,
    setOutlierResult,
    duplicateResult,
    setDuplicateResult,
    analyticsViewData,
    setAnalyticsViewData,
    setActiveTab,
    setIsMobileMenuOpen
  } = useDatasetContext();

  const {
    aiResults,
    setAIResults,
    aiResultsSourcePath,
    setAIResultsSourcePath,
    missingValueInsights,
    outlierInsights,
    validationInsights
  } = useAIContext();

  const activeAnalyticsData = analyticsViewData || datasetData;
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
      <Route path="/null-analysis" element={<NullAnalysis />} />
      <Route path="/anomaly-detection" element={<AnomalyDetection />} />
      <Route path="/deduping" element={<Deduping />} />
      <Route path="/logic-validation" element={<LogicValidation />} />
      <Route path="/weighting-engine" element={<WeightingEngine />} />
      <Route
        path="/statistical-engine"
        element={
          <StatisticalEngine />
        }
      />
      <Route path="/version-control" element={<VersionControl />} />
      <Route path="/report-center" element={<ReportContainer />} />
      <Route path="/audit-trail" element={<AuditTrail />} />
    </Routes>
  );
}
