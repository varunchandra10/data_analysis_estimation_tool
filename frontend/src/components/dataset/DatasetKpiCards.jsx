import React from 'react';
import {
  FileSpreadsheet,
  Hash,
  Database,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { MetricStatCard } from '../common';

/**
 * Reusable DatasetKpiCards component
 * Renders the 5 macro KPI cards: Source File, Observations (N), Features (P), Missing Values, and Integrity Index.
 * Reusable in Dataset Explorer, Whole Dataset, Comparison Diff, and Report Center.
 */
export default function DatasetKpiCards({
  metadata = {},
  schema = [],
  totalRows = 0,
  totalColumns = 0,
  numericalCount = 0,
  categoricalCount = 0,
  totalNullCells = 0,
  missingPercentage = 0,
  columnsWithNullsCount = 0,
  integrityScore = 100,
  className = '',
}) {
  const filename = metadata?.filename ?? 'dataset.csv';
  const fileSizeText = metadata?.file_size
    ? `${(metadata.file_size / 1024).toFixed(1)} KB`
    : 'In-Memory Stream';

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 ${className}`}>
      {/* 1. SOURCE FILE */}
      <MetricStatCard
        label="Source File"
        value={filename}
        icon={FileSpreadsheet}
        subValue={fileSizeText}
        truncateValue={true}
        tooltip="Active data buffer loaded in session memory"
      />

      {/* 2. OBSERVATIONS (N) */}
      <MetricStatCard
        label="Observations (N)"
        value={Number(totalRows || 0).toLocaleString()}
        icon={Hash}
        subValue="Sample Microdata Rows"
        badge="Rows"
        badgeVariant="emerald"
        tooltip="Total record rows available in this version"
      />

      {/* 3. FEATURES (P) */}
      <MetricStatCard
        label="Features (P)"
        value={totalColumns || schema.length || 0}
        icon={Database}
        subValue={`${numericalCount} Num • ${categoricalCount} Cat`}
        badge="Variables"
        badgeVariant="blue"
        tooltip="Survey attributes, metrics, and classification variables"
      />

      {/* 4. MISSING VALUES */}
      <MetricStatCard
        label="Missing Values"
        value={
          <span className={totalNullCells > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
            {Number(totalNullCells || 0).toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">({missingPercentage}%)</span>
          </span>
        }
        icon={totalNullCells > 0 ? AlertTriangle : CheckCircle2}
        subValue={`${columnsWithNullsCount} columns affected`}
        badge={totalNullCells > 0 ? 'Action Needed' : 'Clean'}
        badgeVariant={totalNullCells > 0 ? 'amber' : 'emerald'}
        tooltip="Null or empty cells requiring imputation or deletion"
      />

      {/* 5. INTEGRITY INDEX */}
      <MetricStatCard
        label="Integrity Index"
        value={`${integrityScore}%`}
        icon={Activity}
        subValue={integrityScore >= 90 ? 'High Survey Quality' : 'Moderate Inconsistencies'}
        badge={integrityScore >= 90 ? 'HIGH' : 'REVIEW'}
        badgeVariant={integrityScore >= 90 ? 'emerald' : 'amber'}
        progressBar={{
          value: integrityScore,
          colorClass: integrityScore >= 90 ? 'bg-emerald-500' : 'bg-amber-500',
        }}
        tooltip="Heuristic composite data quality score based on completeness and type consistency"
      />
    </div>
  );
}

