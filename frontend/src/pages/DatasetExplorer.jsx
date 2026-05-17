import React from 'react';
import DatasetPreview from '../components/DatasetPreview';

export default function DatasetExplorer({ datasetData, aiResults }) {
  return <DatasetPreview data={datasetData} aiResults={aiResults} />;
}
