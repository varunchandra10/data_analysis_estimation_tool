import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  AlertTriangle,
  Users,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  Award,
} from 'lucide-react';
import InfoTooltip from './UI/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';
import { StatusBadge } from './common';

function getGradeTheme(score, grade) {
  if (score >= 90 || grade?.startsWith('A')) {
    return {
      variant: 'emerald',
      strokeColor: '#10b981',
      bgGlow: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      label: 'Optimal Integrity',
      summary: 'Excellent survey data hygiene. Ready for downstream calibration, weighting, and statistical inference.',
    };
  }
  if (score >= 75 || grade?.startsWith('B')) {
    return {
      variant: 'blue',
      strokeColor: '#3b82f6',
      bgGlow: 'bg-blue-500/10 dark:bg-blue-500/15',
      textColor: 'text-blue-700 dark:text-blue-400',
      label: 'Acceptable Precision',
      summary: 'Good dataset quality with minor anomalies. Recommended to review flagged cells before final publication.',
    };
  }
  if (score >= 60 || grade?.startsWith('C')) {
    return {
      variant: 'amber',
      strokeColor: '#f59e0b',
      bgGlow: 'bg-amber-500/10 dark:bg-amber-500/15',
      textColor: 'text-amber-700 dark:text-amber-400',
      label: 'Action Recommended',
      summary: 'Moderate data contamination detected. Imputation and outlier trimming will improve model accuracy.',
    };
  }
  return {
    variant: 'rose',
    strokeColor: '#ef4444',
    bgGlow: 'bg-rose-500/10 dark:bg-rose-500/15',
    textColor: 'text-rose-700 dark:text-rose-400',
    label: 'Critical Remediation Needed',
    summary: 'Substantial missingness, duplicates, or validation errors undermine statistical validity. Remediation required.',
  };
}

function DimensionCard({
  icon: Icon,
  label,
  value,
  rate,
  subScore,
  maxPoints,
  tooltipKey,
  statusLabel,
  statusVariant,
  actionPath,
  actionText,
  navigate,
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs">
              <Icon size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                  {label}
                </span>
                <InfoTooltip {...getTooltipContent(tooltipKey)} iconSize={12} className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Rate: {rate}%
              </span>
            </div>
          </div>

          <StatusBadge variant={statusVariant} size="xs">
            {statusLabel}
          </StatusBadge>
        </div>

        <div className="mt-3 flex items-baseline justify-between border-t border-slate-200/60 dark:border-slate-800/80 pt-2.5">
          <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
            {value.toLocaleString()}
          </span>
          {subScore !== undefined && maxPoints !== undefined && (
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Contribution: <strong className="text-slate-800 dark:text-slate-200">{subScore.toFixed(1)}</strong> / {maxPoints} pts
            </span>
          )}
        </div>
      </div>

      {actionPath && actionText && (
        <button
          type="button"
          onClick={() => navigate(actionPath)}
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
        >
          <span>{actionText}</span>
          <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

/**
 * Enterprise QualityScore Component
 * Visualizes deterministic normalized data quality index (0-100),
 * letter grades, component weight contributions, and diagnostic breakdowns.
 */
export default function QualityScore({
  versionName = 'raw',
  loading = false,
  error = '',
  data = null,
  className = '',
}) {
  const navigate = useNavigate();

  const score = data?.score ?? 0;
  const grade = data?.grade ?? 'N/A';
  const gradeMeta = useMemo(() => getGradeTheme(score, grade), [score, grade]);

  const metrics = data?.metrics || {};
  const breakdown = data?.breakdown || {};
  const components = breakdown.components || {};
  const weights = breakdown.weights || { missing: 30, duplicates: 25, outliers: 25, validation: 20 };

  // SVG Circular Gauge calculation
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <section
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs font-sans text-slate-800 dark:text-slate-100 transition-all ${className}`}
    >
      {/* 1. Header Bar */}
      <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Data Quality Assurance
            </span>
            <StatusBadge variant="slate" size="xs">
              Normalized Index
            </StatusBadge>
            <InfoTooltip {...getTooltipContent('qualityScore')} iconSize={12} className="h-4 w-4" />
          </div>

          <h3 className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">
            Survey Reliability & Quality Score
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Deterministic multi-variable index evaluating survey integrity across completeness, uniqueness,
            outlier frequency, and structural rule compliance.
          </p>
        </div>

        {/* Snapshot Milestone Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs shrink-0 shadow-2xs">
          <Award size={14} className="text-indigo-500" />
          <div className="text-left">
            <div className="text-[9px] uppercase font-bold text-slate-400">Target Snapshot</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">
              version: <span className="text-indigo-600 dark:text-indigo-400">{versionName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Loading and Error Feedback */}
      {loading && (
        <div className="mt-6 flex items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 font-mono text-xs text-slate-500">
          <Loader2 size={16} className="animate-spin text-indigo-500" />
          <span>Computing normalized deterministic quality matrix for {versionName}...</span>
        </div>
      )}

      {error && !loading && (
        <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-xs font-mono text-rose-800 dark:text-rose-300">
          <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Main Data Content */}
      {!loading && data && (
        <div className="mt-6 space-y-6">
          
          {/* Hero Score Showcase Card */}
          <div className="grid gap-6 md:grid-cols-[160px_1fr] items-center p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50/80 via-white to-slate-50/50 dark:from-slate-950/60 dark:via-slate-900 dark:to-slate-950/60 shadow-2xs">
            
            {/* SVG Radial Meter */}
            <div className="relative flex items-center justify-center mx-auto">
              <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 108 108">
                {/* Background Ring */}
                <circle
                  cx="54"
                  cy="54"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-200 dark:text-slate-800"
                  fill="transparent"
                />
                {/* Active Progress Ring */}
                <circle
                  cx="54"
                  cy="54"
                  r={radius}
                  stroke={gradeMeta.strokeColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700 ease-out"
                  fill="transparent"
                />
              </svg>

              {/* Centered Score Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  {score}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                  / 100
                </span>
              </div>
            </div>

            {/* Score Meta Context */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge variant={gradeMeta.variant} size="sm">
                  Grade {grade}
                </StatusBadge>
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {gradeMeta.label}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-xl">
                {gradeMeta.summary}
              </p>

              {/* Progress Contribution Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                  <span>Component Weight Composition (100 pts max)</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{score.toFixed(1)} / 100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                  <div
                    style={{ width: `${((components.missing || 0) / 100) * 100}%` }}
                    className="bg-emerald-500"
                    title={`Missing: ${(components.missing || 0).toFixed(1)} pts`}
                  />
                  <div
                    style={{ width: `${((components.duplicates || 0) / 100) * 100}%` }}
                    className="bg-blue-500"
                    title={`Duplicates: ${(components.duplicates || 0).toFixed(1)} pts`}
                  />
                  <div
                    style={{ width: `${((components.outliers || 0) / 100) * 100}%` }}
                    className="bg-amber-500"
                    title={`Outliers: ${(components.outliers || 0).toFixed(1)} pts`}
                  />
                  <div
                    style={{ width: `${((components.validation || 0) / 100) * 100}%` }}
                    className="bg-indigo-500"
                    title={`Validation: ${(components.validation || 0).toFixed(1)} pts`}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* 4. Four Pillar Dimension Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Dimension 1: Missing Data */}
            <DimensionCard
              icon={Database}
              label="Completeness"
              value={metrics.missing ?? 0}
              rate={metrics.missing_pct ?? 0}
              subScore={components.missing}
              maxPoints={weights.missing}
              tooltipKey="missingCells"
              statusLabel={(metrics.missing_pct ?? 0) === 0 ? 'Zero Loss' : (metrics.missing_pct ?? 0) < 5 ? 'Minor' : 'Remediate'}
              statusVariant={(metrics.missing_pct ?? 0) === 0 ? 'emerald' : (metrics.missing_pct ?? 0) < 5 ? 'blue' : 'amber'}
              actionPath={(metrics.missing ?? 0) > 0 ? '/processing/missing' : null}
              actionText="Inspect Imputation"
              navigate={navigate}
            />

            {/* Dimension 2: Duplicate Rows */}
            <DimensionCard
              icon={Users}
              label="Uniqueness"
              value={metrics.duplicates ?? 0}
              rate={metrics.duplicate_pct ?? 0}
              subScore={components.duplicates}
              maxPoints={weights.duplicates}
              tooltipKey="duplicateRows"
              statusLabel={(metrics.duplicates ?? 0) === 0 ? '100% Unique' : 'Duplicates'}
              statusVariant={(metrics.duplicates ?? 0) === 0 ? 'emerald' : 'rose'}
              actionPath={(metrics.duplicates ?? 0) > 0 ? '/processing/duplicates' : null}
              actionText="Deduplicate Records"
              navigate={navigate}
            />

            {/* Dimension 3: Outlier Rows */}
            <DimensionCard
              icon={AlertTriangle}
              label="Outlier Bounds"
              value={metrics.outliers ?? 0}
              rate={metrics.outlier_pct ?? 0}
              subScore={components.outliers}
              maxPoints={weights.outliers}
              tooltipKey="outlierRows"
              statusLabel={(metrics.outlier_pct ?? 0) < 2 ? 'In Bounds' : 'Skewed'}
              statusVariant={(metrics.outlier_pct ?? 0) < 2 ? 'emerald' : 'amber'}
              actionPath={(metrics.outliers ?? 0) > 0 ? '/processing/outliers' : null}
              actionText="Inspect Outliers"
              navigate={navigate}
            />

            {/* Dimension 4: Validation Consistency */}
            <DimensionCard
              icon={ShieldCheck}
              label="Rule Validation"
              value={metrics.validation_violations ?? 0}
              rate={metrics.validation_pct ?? 0}
              subScore={components.validation}
              maxPoints={weights.validation}
              tooltipKey="validationFailures"
              statusLabel={(metrics.validation_violations ?? 0) === 0 ? 'Consistent' : 'Violations'}
              statusVariant={(metrics.validation_violations ?? 0) === 0 ? 'emerald' : 'rose'}
              actionPath={(metrics.validation_violations ?? 0) > 0 ? '/processing/rules' : null}
              actionText="Verify Rules"
              navigate={navigate}
            />

          </div>

        </div>
      )}

      {/* 5. Standby Empty State (No Data) */}
      {!loading && !error && !data && (
        <div className="mt-6 flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center font-mono">
          <Award size={28} className="text-slate-400 mb-2" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            No Quality Telemetry Available
          </h4>
          <p className="text-xs text-slate-500 font-sans mt-1 max-w-sm">
            Select a dataset version or run statistical profiling to compute data quality metrics.
          </p>
        </div>
      )}
    </section>
  );
}
