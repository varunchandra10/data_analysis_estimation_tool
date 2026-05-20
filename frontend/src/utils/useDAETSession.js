import { useState, useEffect } from 'react';

const STORAGE_KEY = 'daet_frontend_state_v1';

export function useDAETSession() {
  const [datasetData, setDatasetData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsViewData, setAnalyticsViewData] = useState(null);
  const [aiResults, setAIResults] = useState(null);
  const [aiResultsSourcePath, setAIResultsSourcePath] = useState(null);

  // Restore session
  useEffect(() => {
    try {
      const rawState = window.localStorage.getItem(STORAGE_KEY);
      if (!rawState) return;

      const savedState = JSON.parse(rawState);

      if (savedState.datasetData) setDatasetData(savedState.datasetData);
      if (savedState.activeTab) setActiveTab(savedState.activeTab);
      if (savedState.analyticsViewData) setAnalyticsViewData(savedState.analyticsViewData);
      if (savedState.aiResults) setAIResults(savedState.aiResults);
      if (savedState.aiResultsSourcePath) {
        setAIResultsSourcePath(savedState.aiResultsSourcePath);
      }
    } catch (error) {
      console.warn('Failed to restore DAET session:', error);
    }
  }, []);

  // Persist session
  useEffect(() => {
    try {
      if (!datasetData && !aiResults) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          datasetData,
          activeTab,
          analyticsViewData,
          aiResults,
          aiResultsSourcePath,
        })
      );
    } catch (error) {
      console.warn('Failed to persist DAET session:', error);
    }
  }, [datasetData, activeTab, analyticsViewData, aiResults, aiResultsSourcePath]);

  const resetSession = () => {
    setDatasetData(null);
    setActiveTab('overview');
    setAIResults(null);
    setAIResultsSourcePath(null);
    setAnalyticsViewData(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return {
    datasetData, setDatasetData,
    activeTab, setActiveTab,
    analyticsViewData, setAnalyticsViewData,
    aiResults, setAIResults,
    aiResultsSourcePath, setAIResultsSourcePath,
    resetSession
  };
}
