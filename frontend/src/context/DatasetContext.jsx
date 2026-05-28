import React, { createContext, useContext, useState } from 'react';
import { useDAETSession } from '../utils/useDAETSession';

export const DatasetContext = createContext(null);

export function DatasetProvider({ children }) {
  const {
    datasetData, setDatasetData,
    activeTab, setActiveTab,
    analyticsViewData, setAnalyticsViewData,
    aiResults, setAIResults,
    aiResultsSourcePath, setAIResultsSourcePath,
    resetSession
  } = useDAETSession();

  const [validationResult, setValidationResult] = useState(null);
  const [estimationResult, setEstimationResult] = useState(null);
  const [outlierResult, setOutlierResult] = useState(null);
  const [duplicateResult, setDuplicateResult] = useState(null);

  const handleReset = () => {
    setValidationResult(null);
    setEstimationResult(null);
    setOutlierResult(null);
    setDuplicateResult(null);
    resetSession();
  };

  return (
    <DatasetContext.Provider
      value={{
        datasetData,
        setDatasetData,
        activeTab,
        setActiveTab,
        analyticsViewData,
        setAnalyticsViewData,
        aiResults,
        setAIResults,
        aiResultsSourcePath,
        setAIResultsSourcePath,
        validationResult,
        setValidationResult,
        estimationResult,
        setEstimationResult,
        outlierResult,
        setOutlierResult,
        duplicateResult,
        setDuplicateResult,
        resetSession: handleReset
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDatasetContext() {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDatasetContext must be used within a DatasetProvider');
  }
  return context;
}
