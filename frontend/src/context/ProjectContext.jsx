import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_PROJECT_ID } from '../services/api/config';

export const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projectId, setProjectId] = useState(DEFAULT_PROJECT_ID);
  const [projectConfig, setProjectConfig] = useState({});

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId, projectConfig, setProjectConfig }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}
