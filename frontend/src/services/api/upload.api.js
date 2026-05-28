import httpClient from './httpClient';

export const uploadDataset = async (formData) => {
  return httpClient.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000, // 5 minutes for large uploads
  });
};
