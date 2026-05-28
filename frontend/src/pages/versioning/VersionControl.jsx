import React from 'react';
import VersioningContainer from '../../components/VersioningContainer';
import DatasetComparisonContainer from '../../components/DatasetComparisonContainer';
import QualityScoreContainer from '../../components/QualityScoreContainer';
import ReportContainer from '../../components/ReportContainer';
import ExportContainer from '../../components/ExportContainer';

export default function VersionControl() {
  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
      <VersioningContainer />
      <DatasetComparisonContainer />
      <QualityScoreContainer />
      <ReportContainer />
      <ExportContainer />
      </div>
    </div>
  );
}
