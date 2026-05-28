import httpClient from './httpClient';

export const getAIRecommendations = async (filePath, schema, metadata) => {
  return httpClient.post('/api/ai/recommendations', {
    file_path: filePath,
    schema,
    metadata
  });
};

export const getAIExplanations = async (filePath, recommendations, validationSummary, weightingSummary, qualitySummary) => {
  return httpClient.post('/api/ai/explanations', {
    file_path: filePath,
    recommendations,
    validation_summary: validationSummary,
    weighting_summary: weightingSummary,
    quality_summary: qualitySummary
  });
};
