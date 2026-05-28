import { useState } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { generateReport } from '../services/api/report.api';

export function useReports() {
  const { projectId } = useProjectContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async (versionName, datasetName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await generateReport(versionName, datasetName, projectId);
      return response;
    } catch (err) {
      setError(err.message || 'Report generation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generate
  };
}
