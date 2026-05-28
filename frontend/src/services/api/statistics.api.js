import httpClient from './httpClient';

export const getDatasetProfile = async (filePath) => {
  return httpClient.post('/api/statistics/profile', {
    file_path: filePath
  });
};

export const estimateWeights = async (filePath, valueColumn, weightColumn, analysisType) => {
  return httpClient.post('/api/statistics/estimate', {
    file_path: filePath,
    value_column: valueColumn,
    weight_column: weightColumn,
    analysis_type: analysisType
  });
};

