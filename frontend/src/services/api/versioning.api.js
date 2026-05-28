import httpClient from './httpClient';

export const fetchDatasets = async () => httpClient.get('/api/versioning/datasets');

export const fetchDatasetFiles = async (datasetName) => httpClient.get(`/api/versioning/datasets/${encodeURIComponent(datasetName)}`);

export const deleteDatasetFile = async (datasetName, fileName) => httpClient.post(`/api/versioning/datasets/${encodeURIComponent(datasetName)}/files/${encodeURIComponent(fileName)}/delete`, {});

export const previewDatasetFile = async (datasetName, fileName) => httpClient.get(`/api/versioning/datasets/${encodeURIComponent(datasetName)}/files/${encodeURIComponent(fileName)}/preview`);

export const analyticsDatasetFile = async (datasetName, fileName) => httpClient.get(`/api/versioning/datasets/${encodeURIComponent(datasetName)}/files/${encodeURIComponent(fileName)}/analytics`);

export const compressDatasetFolder = async (datasetName) => httpClient.post(`/api/versioning/datasets/${encodeURIComponent(datasetName)}/compress`, {});

export const rollbackVersion = async (datasetName, versionName) => httpClient.post('/api/versioning/rollback', { dataset_name: datasetName, version_name: versionName });

export const compareVersions = async (datasetName, v1, v2, projectId = null) => {
  const params = { dataset_name: datasetName, left_version: v1, right_version: v2 };
  if (projectId) params.project_id = projectId;
  return httpClient.get('/api/versioning/compare', { params });
};

export const fetchVersions = async (projectId = null) => {
  const params = {};
  if (projectId) params.project_id = projectId;
  return httpClient.get('/api/versioning/versions', { params });
};

export const getTimelineLogs = async (datasetName) => httpClient.get(`/api/logs/${encodeURIComponent(datasetName)}`);


export const exportDataset = async (filePath, datasetName, format, projectId = null) => {
  const payload = { file_path: filePath, dataset_name: datasetName, format };
  if (projectId) payload.project_id = projectId;
  return httpClient.post('/api/versioning/export', payload, { responseType: 'blob' });
};

export const archiveOldVersions = async (keepLatest, projectId = null) => {
  const payload = { keep_latest: keepLatest };
  if (projectId) payload.project_id = projectId;
  return httpClient.post('/api/versioning/archive/old', payload);
};

export const getDatasetQuality = async (datasetName, versionName, projectId = null) => {
  const params = { dataset_name: datasetName, version_name: versionName };
  if (projectId) params.project_id = projectId;
  return httpClient.get('/api/versioning/quality', { params });
};
