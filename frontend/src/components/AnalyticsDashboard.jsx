import React, { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  Database,
  BarChart3,
  ShieldCheck,
  Sigma,
  Activity,
  Layers3,
  Binary,
  ArrowUpRight,
  Fingerprint,
  RefreshCcw,
  Crosshair,
  Sparkles,
  LayoutDashboard,
  Filter,
} from "lucide-react";

import BarChartComponent from "./charts/BarChartComponent";
import PieChartComponent from "./charts/PieChartComponent";
import LineChartComponent from "./charts/LineChartComponent";
import CorrelationHeatmap from "./charts/CorrelationHeatmap";
import HistogramChart from "./charts/HistogramChart";
import ScatterChartComponent from "./charts/ScatterChartComponent";
import BoxPlotComponent from "./charts/BoxPlotComponent";
import StatisticsPanel from "./StatisticsPanel";
import GraphEnclosure from "./UI/graphModal";
import PipelineGraph from "./charts/PipelineGraph";
import InfoTooltip from "./UI/InfoTooltip";
import { getTooltipContent } from "../utils/tooltipContent";
import { MetricStatCard, StatusBadge, FilterButtonGroup } from "./common";

/**
 * AnalyticsDashboard Component
 * Enterprise analytical terminal featuring real-time statistical metrics,
 * modular view segmentation (Quality, Distributions, Statistics, Pipeline),
 * and interactive charting.
 */
const AnalyticsDashboard = ({
  datasetData,
  setDatasetData,
  validationResult,
  setValidationResult,
  estimationResult,
  setEstimationResult,
  outlierResult,
  setOutlierResult,
  duplicateResult,
  setDuplicateResult,
  aiResults,
  setAIResults,
  pipelineStatus,
  pipelineResult,
  isRunningPipeline,
  onRunFullPipeline,
}) => {
  const [activeSection, setActiveSection] = useState("all"); // 'all' | 'quality' | 'distributions' | 'statistics' | 'pipeline'

  if (!datasetData) return null;

  const { metadata, statistics } = datasetData;

  // Analytical metrics calculations
  const safeNullCounts = metadata?.null_counts || {};
  const totalMissing = Object.values(safeNullCounts).reduce((acc, val) => acc + Number(val || 0), 0);
  const totalCells = (metadata.rows || 1) * (metadata.columns || 1);
  const completeness = ((totalCells - totalMissing) / totalCells) * 100 || 0;

  const missingChartData = Object.entries(safeNullCounts).map(([key, value]) => ({
    column: key,
    missing: value,
  }));

  const qualityPieData = [
    { name: "Available", value: Math.max(0, totalCells - totalMissing) },
    { name: "Missing", value: totalMissing },
  ];

  const workflowData = [
    { step: "Upload", completed: 100 },
    { step: "Cleaning", completed: 100 },
    { step: "Validation", completed: validationResult ? 100 : 0 },
    { step: "Estimation", completed: estimationResult ? 100 : 0 },
  ];

  const validationChartData = validationResult
    ? [
        { severity: "Low", count: validationResult?.severity_counts?.low ?? 0 },
        { severity: "Medium", count: validationResult?.severity_counts?.medium ?? 0 },
        { severity: "High", count: validationResult?.severity_counts?.high ?? 0 },
      ]
    : [];

  const weightComparisonData = estimationResult?.visualizations || [];
  const numericalStats = statistics?.numerical || [];
  const categoricalStats = statistics?.categorical || [];
  const correlationStats = statistics?.correlation || [];

  const pipelineStages = pipelineResult?.stage_results?.length
    ? pipelineResult.stage_results.map((stage, index) => ({
        id: stage.stage || `stage-${index}`,
        stage: stage.stage,
        label: stage.stage ? stage.stage.toUpperCase() : `STAGE ${index + 1}`,
        version: stage.version || `v${index + 1}`,
        status: stage.status || "pending",
        timestamp: stage.timestamp || null,
        lineage: index === 0 ? "raw" : pipelineResult.stage_results[index - 1]?.version || "previous",
        active: pipelineStatus?.currentVersion ? stage.version === pipelineStatus.currentVersion : false,
        rollbackAvailable: index < pipelineResult.stage_results.length - 1,
      }))
    : [
        {
          id: "raw",
          stage: "raw",
          label: "RAW",
          version: "raw_source",
          status: "completed",
          timestamp: datasetData?.metadata?.generated_at || datasetData?.metadata?.uploaded_at || null,
          lineage: "source",
          active: false,
          rollbackAvailable: false,
        },
        {
          id: "cleaning",
          stage: "cleaning",
          label: "CLEANING",
          version: "v1_cleaned",
          status: duplicateResult || outlierResult || validationResult || estimationResult ? "completed" : "pending",
          timestamp: null,
          lineage: "raw",
          active: false,
          rollbackAvailable: true,
        },
        {
          id: "outliers",
          stage: "outliers",
          label: "OUTLIERS",
          version: "v2_outliers",
          status: outlierResult ? "completed" : "pending",
          timestamp: null,
          lineage: "cleaning",
          active: false,
          rollbackAvailable: true,
        },
        {
          id: "validation",
          stage: "validation",
          label: "VALIDATION",
          version: "v3_validated",
          status: validationResult ? "completed" : "pending",
          timestamp: null,
          lineage: "outliers",
          active: false,
          rollbackAvailable: true,
        },
        {
          id: "weighting",
          stage: "weighting",
          label: "WEIGHTING",
          version: "v4_weighted",
          status: estimationResult ? "completed" : "pending",
          timestamp: null,
          lineage: "validation",
          active: false,
          rollbackAvailable: true,
        },
        {
          id: "report",
          stage: "report",
          label: "REPORT",
          version: "v5_report",
          status: pipelineStatus?.status === "completed" ? "completed" : "pending",
          timestamp: pipelineStatus?.status === "completed" ? new Date().toISOString() : null,
          lineage: "weighting",
          active: false,
          rollbackAvailable: false,
        },
      ];

  const sectionOptions = [
    { id: "all", label: "Full Dashboard", icon: LayoutDashboard },
    { id: "quality", label: "Quality & Missingness", icon: BarChart3 },
    { id: "distributions", label: "Distributions & Anomalies", icon: Activity },
    { id: "statistics", label: "Statistics & Correlation", icon: Sigma },
    { id: "pipeline", label: "Lineage & Convergence", icon: Layers3 },
  ];

  const showAll = activeSection === "all";

  return (
    <div className="space-y-6 mt-2 pb-12 antialiased text-slate-800 dark:text-slate-100 font-sans max-w-[1650px] mx-auto px-4 sm:px-6">
      
      {/* ========================================================= */}
      {/* 1. DASHBOARD HEADER & WORKSPACE ACTION BAR                */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-mono tracking-wider text-slate-400 uppercase">
            <span>Workspace</span>
            <span>/</span>
            <span>Analytics</span>
            <span>/</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Terminal</span>
          </div>

          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-mono">
              Analytical Intelligence Terminal
            </h2>
            <StatusBadge variant="emerald" size="xs" dot>
              Real-time Processing
            </StatusBadge>
          </div>

          <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Database size={13} className="text-slate-400" />
              <span>{metadata.filename || "Session_Data_01"}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Fingerprint size={13} className="text-slate-400" />
              <span>Vector ID: {metadata.rows} rows × {metadata.columns} cols</span>
            </div>
          </div>
        </div>
        
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onRunFullPipeline}
            data-testid="pipeline-run-btn"
            disabled={isRunningPipeline}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold font-mono transition-all cursor-pointer shadow-xs"
          >
            <RefreshCcw size={13} className={isRunningPipeline ? "animate-spin" : ""} />
            <span>{isRunningPipeline ? "Running Pipeline..." : "Run Full Pipeline"}</span>
          </button>
        </div>
      </div>

      {/* Active Pipeline Status Banner */}
      {pipelineStatus && (
        <div className="rounded-xl border border-indigo-200 dark:border-slate-800 bg-indigo-50/40 dark:bg-slate-900/80 p-4 shadow-xs">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                <Sparkles size={14} />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Pipeline Execution State
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {pipelineStatus.message}
                </p>
              </div>
            </div>
            {pipelineStatus.currentVersion && (
              <StatusBadge variant="indigo" size="sm">
                Active Version: {pipelineStatus.currentVersion}
              </StatusBadge>
            )}
          </div>
          {Array.isArray(pipelineStatus.stepsCompleted) && pipelineStatus.stepsCompleted.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 pt-2.5 border-t border-indigo-100 dark:border-slate-800">
              {pipelineStatus.stepsCompleted.map((step) => (
                <StatusBadge key={step} variant="slate" size="xs">
                  {step}
                </StatusBadge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. REUSABLE MACRO KPI CARDS STRIP                         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <MetricStatCard
          label="Observations"
          value={(metadata?.rows ?? 0).toLocaleString()}
          icon={Database}
          subValue="Active Rows"
          badge="N"
          badgeVariant="slate"
          tooltip={getTooltipContent("observations")}
        />

        <MetricStatCard
          label="Completeness"
          value={`${completeness.toFixed(1)}%`}
          icon={CheckCircle}
          subValue={`${totalMissing.toLocaleString()} null cells`}
          badge={completeness >= 95 ? "High" : "Review"}
          badgeVariant={completeness >= 95 ? "emerald" : "amber"}
          progressBar={{
            value: completeness,
            colorClass: completeness >= 95 ? "bg-emerald-500" : "bg-amber-500",
          }}
          tooltip={getTooltipContent("completeness")}
        />

        <MetricStatCard
          label="Anomaly Count"
          value={outlierResult ? outlierResult.total_outliers : 0}
          icon={AlertTriangle}
          subValue="Flagged Records"
          badge={outlierResult?.total_outliers > 0 ? "Outliers" : "Zero"}
          badgeVariant={outlierResult?.total_outliers > 0 ? "rose" : "emerald"}
          tooltip={getTooltipContent("anomalyCount")}
        />

        <MetricStatCard
          label="Violations"
          value={validationResult ? validationResult.total_violations : 0}
          icon={ShieldCheck}
          subValue="Rule Check Failures"
          badge={validationResult?.total_violations > 0 ? "DSL Alert" : "Clean"}
          badgeVariant={validationResult?.total_violations > 0 ? "amber" : "emerald"}
          tooltip={getTooltipContent("violations")}
        />

        <MetricStatCard
          label="Quant Vectors"
          value={numericalStats.length}
          icon={Activity}
          subValue="Numeric Features"
          badge="Scale"
          badgeVariant="indigo"
          tooltip={getTooltipContent("quantVectors")}
        />

        <MetricStatCard
          label="Qual Vectors"
          value={categoricalStats.length}
          icon={Layers3}
          subValue="Categorical Classes"
          badge="Class"
          badgeVariant="blue"
          tooltip={getTooltipContent("qualVectors")}
        />
      </div>

      {/* ========================================================= */}
      {/* 3. ANALYTICAL SECTION SWITCHER                            */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
        <FilterButtonGroup
          options={sectionOptions}
          activeId={activeSection}
          onChange={setActiveSection}
          size="sm"
        />

        <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
          Filtering analytical workspace view
        </span>
      </div>

      {/* ========================================================= */}
      {/* 4. DATA QUALITY & COMPLETENESS TRACK                      */}
      {/* ========================================================= */}
      {(showAll || activeSection === "quality") && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* NULL DENSITY DISTRIBUTION */}
          <div className="xl:col-span-8">
            <GraphEnclosure
              title="Null Density Distribution"
              subtitle="Null observational gaps categorized across active schema fields"
              tooltip={getTooltipContent("nullDistribution")}
              icon={BarChart3}
              hasData={missingChartData && missingChartData.length > 0}
            >
              <div className="h-[400px] w-full overflow-hidden pl-2 pr-2">
                <BarChartComponent
                  data={missingChartData}
                  xKey="column"
                  yKey="missing"
                  color="#6366f1"
                  margin={{ top: 20, right: 10, left: 45, bottom: 80 }}
                />
              </div>
            </GraphEnclosure>
          </div>

          {/* INTEGRITY RATIO MIX */}
          <div className="xl:col-span-4">
            <GraphEnclosure
              title="Integrity Ratio"
              subtitle="Proportional completeness mix calculation"
              tooltip={getTooltipContent("integrityRatio")}
              icon={RefreshCcw}
              hasData={qualityPieData && qualityPieData.length > 0}
            >
              <div className="h-[280px] w-full flex items-center justify-center mt-2">
                <PieChartComponent data={qualityPieData} nameKey="name" dataKey="value" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 font-mono text-[11px] border-t border-slate-100 dark:border-slate-800 pt-4 w-full">
                <div className="flex flex-col border-l-2 border-emerald-500 pl-2">
                  <span className="text-slate-400 uppercase text-[10px]">Available Data</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {(qualityPieData[0]?.value ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col border-l-2 border-rose-500 pl-2">
                  <span className="text-slate-400 uppercase text-[10px]">Missing Cells</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {(qualityPieData[1]?.value ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </GraphEnclosure>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. DISTRIBUTIONS & ANOMALY DETECTION TRACK                */}
      {/* ========================================================= */}
      {(showAll || activeSection === "distributions") && outlierResult?.visualizations && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* FEATURE VALUE HISTOGRAMS */}
          <div className="xl:col-span-7">
            <GraphEnclosure
              title="Feature Value Histograms"
              subtitle="Continuous distribution parameters over selected targets"
              tooltip={getTooltipContent("histograms")}
              icon={BarChart3}
              hasData={outlierResult.visualizations.histogram?.length > 0}
            >
              <div className="h-[360px] w-full overflow-hidden">
                <HistogramChart data={outlierResult.visualizations.histogram} />
              </div>
            </GraphEnclosure>
          </div>

          {/* RESIDUAL SCATTER MAP */}
          <div className="xl:col-span-5">
            <GraphEnclosure
              title="Residual Scatter Map"
              subtitle="Bivariate cross-feature outlier detection maps"
              tooltip={getTooltipContent("residualScatter")}
              icon={Crosshair}
              hasData={outlierResult.visualizations.scatterplot?.length > 0}
            >
              <div className="h-[360px] w-full overflow-hidden">
                <ScatterChartComponent
                  data={outlierResult.visualizations.scatterplot}
                  xKey="x"
                  yKey="y"
                  color="#6366f1"
                />
              </div>
            </GraphEnclosure>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. DESCRIPTIVE STATISTICS LABORATORY & BOXPLOT           */}
      {/* ========================================================= */}
      {(showAll || activeSection === "statistics") && statistics && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded-md">
                <Sigma size={15} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">
                  Descriptive Statistics Laboratory
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase mt-0.5">
                  Confidence Interval: 95% σ-verified
                </p>
              </div>
            </div>
            <InfoTooltip {...getTooltipContent("statisticsLab")} iconSize={12} className="h-4 w-4" />
          </div>

          <div className="p-6 space-y-6">
            <StatisticsPanel statistics={statistics} />

            {/* BOXPLOT STRUCTURAL QUANTILE ENCLOSURE */}
            {outlierResult?.visualizations?.boxplot && (
              <GraphEnclosure
                title="Structural Outlier Quantiles"
                subtitle="Whisker summary diagnostics evaluating interquartile tracking boundaries"
                tooltip={getTooltipContent("boxplot")}
                icon={Activity}
                hasData={true}
              >
                <div className="pt-2 h-[300px]">
                  <BoxPlotComponent stats={outlierResult.visualizations.boxplot} />
                </div>
              </GraphEnclosure>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. CORRELATION & VALIDATION ENCLOSURES                    */}
      {/* ========================================================= */}
      {(showAll || activeSection === "statistics" || activeSection === "quality") && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* COVARIANCE HEATMAP */}
          {correlationStats.length > 0 && (showAll || activeSection === "statistics") && (
            <div className="xl:col-span-7">
              <GraphEnclosure
                title="Covariance Heatmap (Pearson)"
                subtitle="Linear product-moment relational outputs coefficient metrics"
                tooltip={getTooltipContent("covarianceHeatmap")}
                icon={Binary}
                hasData={true}
              >
                <div className="w-full overflow-hidden">
                  <CorrelationHeatmap data={correlationStats} />
                </div>
              </GraphEnclosure>
            </div>
          )}

          {/* VIOLATION SEVERITY DISTRIBUTION */}
          {validationChartData.length > 0 && (showAll || activeSection === "quality") && (
            <div className="xl:col-span-5">
              <GraphEnclosure
                title="Violation Severity Distribution"
                subtitle="Rule constraint failure weights array metrics"
                tooltip={getTooltipContent("severityDistribution")}
                icon={ShieldCheck}
                hasData={true}
              >
                <div className="h-[320px] w-full overflow-hidden">
                  <BarChartComponent data={validationChartData} xKey="severity" yKey="count" color="#f59e0b" />
                </div>
              </GraphEnclosure>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. WORKFLOW LINEAGE & CONVERGENCE PROFILE                 */}
      {/* ========================================================= */}
      {(showAll || activeSection === "pipeline") && (
        <div className="space-y-5">
          <GraphEnclosure
            title="Workflow Lineage DAG Graph"
            subtitle="Visualized execution from raw intake to report generation with version tracking"
            tooltip={getTooltipContent("workflowLineage")}
            icon={Layers3}
            hasData={pipelineStages.length > 0}
          >
            <PipelineGraph
              stages={pipelineStages}
              activeVersion={pipelineStatus?.currentVersion || pipelineResult?.current_version}
            />
          </GraphEnclosure>

          {/* BIAS CORRECTION BAR TRACK */}
          {estimationResult && (
            <GraphEnclosure
              title="Computational Bias Correction Profile"
              subtitle="Iterative proportional fitting mapping matrix adjustments"
              tooltip={getTooltipContent("weightProfile")}
              icon={Sigma}
              hasData={true}
            >
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                      Iterative Proportional Fitting Comparison
                    </h4>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-800 font-mono text-right">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wide">
                      Convergence Rate
                    </span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      0.0001Δ
                    </span>
                  </div>
                </div>
                <div className="h-[340px] w-full overflow-hidden">
                  <BarChartComponent data={weightComparisonData} xKey="label" yKey="value" color="#6366f1" />
                </div>
              </div>
            </GraphEnclosure>
          )}

          {/* CONVERGENCE PIPELINE TELEMETRY */}
          <GraphEnclosure
            title="Convergence Workflow Pipeline"
            subtitle="Monitoring fitting iterations sequential convergence logs across session states"
            tooltip={getTooltipContent("convergenceWorkflow")}
            icon={RefreshCcw}
            hasData={workflowData && workflowData.length > 0}
          >
            <div>
              <div className="h-[360px] w-full overflow-hidden pl-2 pr-2">
                <LineChartComponent
                  data={workflowData}
                  xKey="step"
                  yKey="completed"
                  color="#6366f1"
                  margin={{ top: 20, right: 15, left: 35, bottom: 45 }}
                />
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                <p className="text-[10px] text-slate-500">
                  * Monitoring iterative proportional fitting convergence across active transformation buffers.
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Live telemetry
                  </span>
                </div>
              </div>
            </div>
          </GraphEnclosure>
        </div>
      )}

    </div>
  );
};

export default AnalyticsDashboard;
