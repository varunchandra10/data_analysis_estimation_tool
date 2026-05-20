import axios from 'axios';
import { apiUrl } from './config';

export async function fetchFullDatasetPreview(filePath) {
  const response = await axios.post(apiUrl('/api/datasets/full-preview'), {
    file_path: filePath,
  });

  const rows = response.data?.rows || [];
  const columns = response.data?.columns || [];

  return {
    ...response.data,
    rows,
    columns,
    total_rows: response.data?.metadata?.rows ?? rows.length,
    metadata: {
      ...(response.data?.metadata || {}),
    },
  };
}

export async function runFullPipeline(filePath) {
  const response = await axios.post(apiUrl('/api/pipeline/run'), {
    file_path: filePath,
  });

  return response.data;
}
