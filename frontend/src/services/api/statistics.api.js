import httpClient from './httpClient';

export const getDatasetProfile = async (filePath) => {
  return httpClient.post('/api/statistics/profile', {
    file_path: filePath,
  });
};

export const estimateWeights = async (filePath, valueColumn, weightColumn, analysisType) => {
  return httpClient.post('/api/statistics/estimate', {
    file_path: filePath,
    value_column: valueColumn,
    weight_column: weightColumn,
    analysis_type: analysisType,
  });
};

export const rakeWeights = async ({
  filePath,
  targetMargins,
  baseWeightColumn = null,
  outputWeightColumn = 'calibrated_weight',
  maxIter = 100,
  epsilon = 1e-4,
}) => {
  return httpClient.post('/api/statistics/rake', {
    file_path: filePath,
    target_margins: targetMargins,
    base_weight_column: baseWeightColumn,
    output_weight_column: outputWeightColumn,
    max_iter: maxIter,
    epsilon,
  });
};
