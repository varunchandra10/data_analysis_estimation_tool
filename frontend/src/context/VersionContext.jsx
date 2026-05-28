import React, { createContext, useContext, useState } from 'react';

export const VersionContext = createContext(null);

export function VersionProvider({ children }) {
  const [activeVersion, setActiveVersion] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [comparisonState, setComparisonState] = useState(null);

  return (
    <VersionContext.Provider
      value={{
        activeVersion,
        setActiveVersion,
        versionHistory,
        setVersionHistory,
        comparisonState,
        setComparisonState
      }}
    >
      {children}
    </VersionContext.Provider>
  );
}

export function useVersionContext() {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error('useVersionContext must be used within a VersionProvider');
  }
  return context;
}
