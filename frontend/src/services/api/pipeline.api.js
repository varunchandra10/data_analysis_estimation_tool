import httpClient from './httpClient';

export async function fetchFullDatasetPreview(filePath) {
  const response = await httpClient.post('/api/datasets/full-preview', {
    file_path: filePath,
  });

  const rows = response?.rows || [];
  const columns = response?.columns || [];

  return {
    ...response,
    rows,
    columns,
    total_rows: response?.metadata?.rows ?? rows.length,
    metadata: {
      ...(response?.metadata || {}),
    },
  };
}

export async function runFullPipeline(filePath) {
  return httpClient.post('/api/pipeline/run', {
    file_path: filePath,
  });
}
