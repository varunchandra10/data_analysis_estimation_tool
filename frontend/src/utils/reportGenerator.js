/**
 * Report Data Collection Utility
 * Aggregates all analysis data into a unified report payload
 */

export const collectReportData = ({
  datasetData,
  aiResults,
  validationResult,
  estimationResult,
  outlierResult,
  duplicateResult,
  analyticsViewData,
}) => {
  const timestamp = new Date().toISOString();

  // Dataset Information
  const datasetPayload = {
    metadata: datasetData?.metadata || {},
    schema: datasetData?.schema || [],
    previewRows: datasetData?.preview?.length || 0,
    totalRows: datasetData?.metadata?.rows || 0,
    totalColumns: datasetData?.metadata?.columns || 0,
    nullCounts: datasetData?.metadata?.null_counts || {},
    statistics: datasetData?.statistics || {},
  };

  // AI Recommendations & Insights
  const aiRecommendations = aiResults?.recommendations || [];
  const aiPayload = {
    status: aiResults?.status || 'pending',
    totalRecommendations: aiRecommendations.length,
    recommendations: aiRecommendations.map((item) => ({
      column: item.column,
      type: item.type,
      statistics: item.statistics || {},
      suggestions: item.recommendations || {},
    })),
    missingValueInsights: aiRecommendations.map((item) => {
      const rec = item.recommendations || {};
      return {
        column: item.column,
        method: rec.missing_value_method || 'review',
        confidence: rec.confidence || 0,
      };
    }),
    outlierInsights: aiRecommendations.map((item) => {
      const rec = item.recommendations || {};
      return {
        column: item.column,
        method: rec.outlier_method || 'iqr',
        warnings: rec.warnings || [],
      };
    }),
  };

  // Cleaning & Missing Values Analysis
  const cleaningPayload = {
    nullAnalysisAvailable: !!datasetData?.metadata?.null_counts,
    nullCounts: datasetData?.metadata?.null_counts || {},
    nullPercentages: calculateNullPercentages(
      datasetData?.metadata?.null_counts || {},
      datasetData?.metadata?.rows || 0
    ),
  };

  // Outlier Detection Results
  const outlierPayload = {
    available: !!outlierResult,
    resultPath: outlierResult?.file_path || null,
    previewAvailable: !!outlierResult?.preview,
    rowsAfter: outlierResult?.preview?.length || 0,
  };

  // Duplicate Detection Results
  const duplicatePayload = {
    available: !!duplicateResult,
    resultPath: duplicateResult?.file_path || null,
    finalRowCount: duplicateResult?.final_rows || 0,
    duplicatesRemoved: (datasetData?.metadata?.rows || 0) - (duplicateResult?.final_rows || 0),
  };

  // Validation Results
  const validationPayload = {
    available: !!validationResult,
    resultPath: validationResult?.file_path || null,
    validRules: validationResult?.valid_rules || 0,
    failedRules: validationResult?.failed_rules || 0,
  };

  // Weighting & Estimation Results
  const weightingPayload = {
    available: !!estimationResult,
    resultPath: estimationResult?.file_path || null,
    weights: estimationResult?.weights || {},
  };

  // Statistics & Analytics
  const statisticsPayload = analyticsViewData?.statistics || datasetData?.statistics || {};

  // Unified Report Payload
  const reportPayload = {
    metadata: {
      generatedAt: timestamp,
      datasetName: datasetData?.metadata?.filename || 'Unknown Dataset',
      analysisType: 'Comprehensive Data Quality Report',
    },
    dataset: datasetPayload,
    cleaning: cleaningPayload,
    outliers: outlierPayload,
    duplicates: duplicatePayload,
    validation: validationPayload,
    weighting: weightingPayload,
    statistics: statisticsPayload,
    ai: aiPayload,
    summary: generateReportSummary({
      datasetData,
      aiRecommendations,
      cleaningPayload,
      outlierPayload,
      duplicatePayload,
      validationPayload,
    }),
  };

  return reportPayload;
};

/**
 * Calculate null percentages for each column
 */
const calculateNullPercentages = (nullCounts, totalRows) => {
  const result = {};
  Object.entries(nullCounts).forEach(([column, count]) => {
    result[column] = {
      count,
      percentage: totalRows > 0 ? ((count / totalRows) * 100).toFixed(2) : 0,
    };
  });
  return result;
};

/**
 * Generate executive summary for the report
 */
const generateReportSummary = ({
  datasetData,
  aiRecommendations,
  cleaningPayload,
  outlierPayload,
  duplicatePayload,
  validationPayload,
}) => {
  const totalRows = datasetData?.metadata?.rows || 0;
  const totalColumns = datasetData?.metadata?.columns || 0;
  const nullColumns = Object.keys(cleaningPayload.nullCounts).length;
  const highNullColumns = Object.entries(cleaningPayload.nullPercentages)
    .filter(([, data]) => parseFloat(data.percentage) > 20)
    .map(([col]) => col);

  return {
    datasetOverview: {
      totalRecords: totalRows,
      totalVariables: totalColumns,
      columnsWithMissingValues: nullColumns,
      columnsWithHighMissingRate: highNullColumns,
    },
    qualityStatus: {
      aiRecommendationsGenerated: aiRecommendations.length > 0,
      cleaningApplied: cleaningPayload.nullAnalysisAvailable,
      outliersDetected: outlierPayload.available,
      duplicatesRemoved: duplicatePayload.available,
      validationRun: validationPayload.available,
    },
    keyConcerns: generateKeyConcerns({
      cleaningPayload,
      outlierPayload,
      duplicatePayload,
      highNullColumns,
    }),
    recommendedActions: aiRecommendations.slice(0, 5).map((item) => ({
      column: item.column,
      recommendation: item.recommendations?.missing_value_method || 'Review recommended',
    })),
  };
};

/**
 * Generate key concerns based on analysis results
 */
const generateKeyConcerns = ({
  cleaningPayload,
  outlierPayload,
  duplicatePayload,
  highNullColumns,
}) => {
  const concerns = [];

  if (highNullColumns.length > 0) {
    concerns.push({
      severity: 'high',
      issue: `Missing values detected in ${highNullColumns.length} column(s)`,
      details: highNullColumns.join(', '),
    });
  }

  if (outlierPayload.available) {
    concerns.push({
      severity: 'medium',
      issue: 'Outliers detected in dataset',
      details: 'Review outlier analysis results',
    });
  }

  if (duplicatePayload.available && duplicatePayload.duplicatesRemoved > 0) {
    concerns.push({
      severity: 'medium',
      issue: `${duplicatePayload.duplicatesRemoved} duplicate records removed`,
      details: 'Data integrity improved',
    });
  }

  return concerns;
};

/**
 * Format report data for display/export
 */
export const formatReportForDisplay = (reportPayload) => {
  return {
    ...reportPayload,
    formattedAt: new Date().toLocaleString(),
  };
};

export default { collectReportData, formatReportForDisplay };
