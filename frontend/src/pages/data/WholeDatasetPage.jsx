import React from 'react';
import DatasheetViewer from '../../components/complete_dataset/complete_dataset_viewer';

export default function WholeDatasetPage({ datasetData, onBack }) {
  const datasetId = datasetData?.metadata?.file_path || '';
  const initialFileName = datasetData?.metadata?.filename || datasetData?.metadata?.dataset_name || 'dataset';

  return (
    <DatasheetViewer
      datasetId={datasetId}
      initialFileName={initialFileName}
      onBack={onBack}
    />
  );
}
