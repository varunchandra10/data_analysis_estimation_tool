import httpClient from './httpClient';

export const generateReport = async (versionName, datasetName, projectId = null) => {
  const payload = {
    version_name: versionName,
    dataset_name: datasetName,
  };
  if (projectId) payload.project_id = projectId;
  return httpClient.post('/api/report/generate', payload);
};
