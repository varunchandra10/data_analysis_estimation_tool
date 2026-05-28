import httpClient from './httpClient';

export const cleanMissingValues = async (filePath, strategies) => {
  return httpClient.post('/api/clean/missing-values', {
    file_path: filePath,
    strategies
  });
};

export const processDuplicates = async (filePath, strategy) => {
  return httpClient.post('/api/duplicates/process', {
    file_path: filePath,
    strategy
  });
};
