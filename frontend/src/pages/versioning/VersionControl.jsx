import React from 'react';
import VersioningPanel from '../../components/VersioningPanel';
import DatasetComparison from '../../components/DatasetComparison';
import QualityScore from '../../components/QualityScore';
import ReportPanel from '../../components/ReportPanel';
import ExportPanel from '../../components/ExportPanel';

export default function VersionControl(props) {
  return (
    <div className="space-y-6">
      <VersioningPanel {...props} />
      <DatasetComparison currentDataset={props.data} />
      <QualityScore versionName={props.data?.version || 'raw'} datasetName={props.data?.dataset_name || props.data?.metadata?.dataset_name} />
      <ReportPanel versionName={props.data?.version || 'raw'} datasetName={props.data?.dataset_name || props.data?.metadata?.dataset_name} />
      <ExportPanel datasetData={props.data} />
    </div>
  );
}
