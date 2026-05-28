import httpClient from './httpClient';

export const detectOutliers = async (filePath, column, method) => {
  return httpClient.post('/api/outliers/detect', {
    file_path: filePath,
    column,
    method
  });
};

export const applyOutliers = async (filePath, column, method) => {
  return httpClient.post('/api/outliers/apply', {
    file_path: filePath,
    column,
    method
  });
};
