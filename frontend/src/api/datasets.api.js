import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export async function fetchFullDatasetPreview(filePath) {
  const response = await axios.post(`${API_BASE}/api/datasets/full-preview`, {
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
