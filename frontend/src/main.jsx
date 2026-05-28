import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DatasetProvider } from './context/DatasetContext'
import { AIProvider } from './context/AIContext'
import { VersionProvider } from './context/VersionContext'
import { ProjectProvider } from './context/ProjectContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <DatasetProvider>
          <AIProvider>
            <VersionProvider>
              <ProjectProvider>
                <App />
              </ProjectProvider>
            </VersionProvider>
          </AIProvider>
        </DatasetProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
