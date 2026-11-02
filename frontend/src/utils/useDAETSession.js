import { useState, useEffect } from 'react';

const STORAGE_KEY = 'daet_frontend_state_v1';

/**
 * Strips massive row arrays before serializing to localStorage
 * to strictly prevent QuotaExceededError (5MB browser limit).
 */
function sanitizeForStorage(data) {
  if (!data) return null;
  const { rows, ...rest } = data;
  return {
    ...rest,
    preview: rest.preview || (Array.isArray(rows) ? rows.slice(0, 10) : []),
    columns: rest.columns || (Array.isArray(rows) && rows.length > 0 ? Object.keys(rows[0]) : []),
    metadata: {
      ...(rest.metadata || {}),
      rows: rest.metadata?.rows ?? (Array.isArray(rows) ? rows.length : 0),
    },
  };
}

export function useDAETSession() {
  const [loadingSession, setLoadingSession] = useState(true);
  const [datasetData, setDatasetData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsViewData, setAnalyticsViewData] = useState(null);
  const [aiResults, setAIResults] = useState(null);
  const [aiResultsSourcePath, setAIResultsSourcePath] = useState(null);

  // Restore session from localStorage on initial mount
  useEffect(() => {
    try {
      const rawState = window.localStorage.getItem(STORAGE_KEY);
      if (rawState) {
        const savedState = JSON.parse(rawState);
        if (savedState.datasetData) setDatasetData(savedState.datasetData);
        if (savedState.activeTab) setActiveTab(savedState.activeTab);
        if (savedState.analyticsViewData) setAnalyticsViewData(savedState.analyticsViewData);
        if (savedState.aiResults) setAIResults(savedState.aiResults);
        if (savedState.aiResultsSourcePath) {
          setAIResultsSourcePath(savedState.aiResultsSourcePath);
        }
      }
    } catch (error) {
      console.warn('Failed to restore DAET session:', error);
    } finally {
      setLoadingSession(false);
    }
  }, []);

  // Persist session to localStorage (guarded against initial hydration race condition)
  useEffect(() => {
    if (loadingSession) return;

    try {
      if (!datasetData && !aiResults) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }

      const lightweightData = sanitizeForStorage(datasetData);
      const lightweightAnalytics = sanitizeForStorage(analyticsViewData);

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          datasetData: lightweightData,
          activeTab,
          analyticsViewData: lightweightAnalytics,
          aiResults,
          aiResultsSourcePath,
        })
      );
    } catch (error) {
      console.warn('Failed to persist DAET session:', error);
    }
  }, [datasetData, activeTab, analyticsViewData, aiResults, aiResultsSourcePath, loadingSession]);

  const resetSession = () => {
    setDatasetData(null);
    setActiveTab('overview');
    setAIResults(null);
    setAIResultsSourcePath(null);
    setAnalyticsViewData(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return {
    loadingSession,
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
    resetSession,
  };
}
