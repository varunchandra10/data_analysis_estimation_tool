import httpClient from './httpClient';

export const runValidation = async (filePath, rules) => {
  return httpClient.post('/api/validation/run', {
    file_path: filePath,
    rules
  });
};

export const suggestRules = async (filePath) => {
  return httpClient.post('/api/validation/suggest', {
    file_path: filePath
  });
};
