export const TOOLTIP_CONTENT = {
  workspaceSamples: {
    title: 'Samples',
    description: 'Total observation rows currently loaded into the active workspace.',
    recommendation: 'Use this to quickly verify whether filters, pipelines, or rollbacks changed the analysis base.',
  },
  workspaceVariables: {
    title: 'Variables',
    description: 'Count of fields available in the current preview and analytics context.',
    recommendation: 'A sudden drop can indicate column pruning, schema drift, or a staged transformation.',
  },
  fullReport: {
    title: 'Full Report',
    description: 'Opens a consolidated analytical summary of the current dataset state.',
    recommendation: 'Use this when you want a recruiter, stakeholder, or reviewer to understand the project outcome quickly.',
  },
  runPipeline: {
    title: 'Run Full Pipeline',
    description: 'Executes the end-to-end cleaning, validation, weighting, and reporting workflow on the active dataset.',
    recommendation: 'This is the fastest way to refresh all downstream panels against the latest processed version.',
  },
  pipelineRun: {
    title: 'Pipeline Run',
    description: 'Shows the current pipeline status, progress message, and active version produced by the latest execution.',
    recommendation: 'Track this banner to confirm which transformed dataset the dashboard is currently representing.',
  },
  observations: {
    title: 'Observations',
    description: 'Number of dataset rows available for analysis.',
    recommendation: 'Observation count helps you judge scale, sample coverage, and whether later cleaning steps removed records.',
  },
  completeness: {
    title: 'Completeness',
    description: 'Share of available cells after accounting for missing values across the dataset.',
    recommendation: 'Higher completeness usually means less imputation effort and stronger downstream interpretability.',
  },
  anomalyCount: {
    title: 'Anomaly Count',
    description: 'Total rows flagged as potential outliers by the current anomaly detection workflow.',
    recommendation: 'Review this before applying changes so you can balance robustness against over-cleaning.',
  },
  violations: {
    title: 'Violations',
    description: 'Total records failing one or more declared validation rules.',
    recommendation: 'Use violations as a quick integrity signal before trusting descriptive or weighted outputs.',
  },
  quantVectors: {
    title: 'Quantitative Vectors',
    description: 'Number of numerical fields available for statistical profiling.',
    recommendation: 'More quantitative fields usually unlock richer charts, dispersion analysis, and weighted metrics.',
  },
  qualVectors: {
    title: 'Qualitative Vectors',
    description: 'Number of categorical fields available for segmentation and rule logic.',
    recommendation: 'These fields often drive validation rules, deduping logic, and survey weighting groups.',
  },
  nullDistribution: {
    title: 'Null Density Distribution',
    description: 'Compares missing values across columns so you can see where incompleteness is concentrated.',
    recommendation: 'Tall bars point to fields that need targeted imputation or collection-quality review.',
  },
  integrityRatio: {
    title: 'Integrity Ratio',
    description: 'Shows the balance between available and missing cells in the current dataset snapshot.',
    recommendation: 'Use it as a fast visual read on data readiness before deeper cleaning or reporting.',
  },
  histograms: {
    title: 'Feature Value Histograms',
    description: 'Shows how numeric values are distributed for selected outlier analysis targets.',
    recommendation: 'Look for skew, heavy tails, or multi-modal patterns before choosing IQR or z-score logic.',
  },
  residualScatter: {
    title: 'Residual Scatter Map',
    description: 'Plots pairwise behavior to reveal clusters, leverage points, and unusual observations.',
    recommendation: 'Widely separated points often deserve review before model-based or descriptive conclusions.',
  },
  statisticsLab: {
    title: 'Descriptive Statistics Laboratory',
    description: 'Central workspace for summary statistics such as mean, median, spread, and skewness.',
    recommendation: 'This is the baseline evidence for explaining why an AI recommendation or cleaning choice makes sense.',
  },
  boxplot: {
    title: 'Structural Outlier Quantiles',
    description: 'Summarizes median, quartiles, whiskers, and extreme values using a box-plot view.',
    recommendation: 'Useful for explaining IQR thresholds and distribution shape in a recruiter-friendly way.',
  },
  covarianceHeatmap: {
    title: 'Covariance Heatmap',
    description: 'Shows the strength and direction of linear relationships between numeric variables.',
    recommendation: 'Stronger coefficients can signal redundancy, multicollinearity, or meaningful linked behavior.',
  },
  severityDistribution: {
    title: 'Violation Severity Distribution',
    description: 'Breaks validation failures into severity levels so teams can triage integrity risks faster.',
    recommendation: 'High-severity counts should usually be reviewed before report generation or export.',
  },
  workflowLineage: {
    title: 'Workflow Lineage Graph',
    description: 'Maps dataset progression from raw intake to processed versions across the pipeline.',
    recommendation: 'This improves explainability by showing exactly how the current analytics state was produced.',
  },
  weightProfile: {
    title: 'Bias Correction Profile',
    description: 'Compares weighting-related adjustments produced during calibration or estimation.',
    recommendation: 'Use it to explain how weighting changed representation and reduced sample bias.',
  },
  convergenceWorkflow: {
    title: 'Convergence Workflow Pipeline',
    description: 'Tracks how pipeline stages or fitting steps progress toward completion.',
    recommendation: 'Helpful for monitoring whether the process reached a stable, report-ready state.',
  },
  qualityScore: {
    title: 'Dataset Quality Score',
    description: 'Composite score calculated from missing values, duplicates, outliers, and validation consistency.',
    recommendation: 'A strong score makes the dashboard easier for reviewers to trust at a glance.',
  },
  missingCells: {
    title: 'Missing Cells',
    description: 'Counts empty or null values detected across the dataset.',
    recommendation: 'High missingness can distort averages, weaken models, and trigger imputation work.',
  },
  duplicateRows: {
    title: 'Duplicate Rows',
    description: 'Counts records that appear to repeat the same observation.',
    recommendation: 'Duplicates can inflate totals and bias downstream estimates if left unresolved.',
  },
  outlierRows: {
    title: 'Outlier Rows',
    description: 'Counts records flagged as unusually distant from the bulk of the distribution.',
    recommendation: 'Review before removal so legitimate but rare signals are not discarded.',
  },
  validationFailures: {
    title: 'Validation Failures',
    description: 'Counts rule-based inconsistencies such as invalid values or broken logic paths.',
    recommendation: 'These failures usually need investigation before executive reporting.',
  },
  mean: {
    title: 'Mean',
    description: 'Average value across all valid observations in a numeric field.',
    recommendation: 'Best for symmetric distributions; pair it with median when skew may be present.',
  },
  median: {
    title: 'Median',
    description: 'Middle value after sorting observations from lowest to highest.',
    recommendation: 'Median is often more reliable than mean when outliers or skew are present.',
  },
  stdDev: {
    title: 'Standard Deviation',
    description: 'Measures how spread out values are around the mean.',
    recommendation: 'Larger spread often signals more variability and wider uncertainty bands.',
  },
  skewness: {
    title: 'Skewness',
    description: 'Indicates whether a distribution leans toward a long left or right tail.',
    recommendation: 'High skew supports robust methods like median- or IQR-based analysis.',
  },
  correlationPairs: {
    title: 'Correlation Pairs',
    description: 'Number of pairwise relationships computed between numeric variables.',
    recommendation: 'This gives a sense of how much inter-variable structure is available to explore.',
  },
  numericalFeatures: {
    title: 'Numerical Features',
    description: 'Fields containing measurable values suitable for statistical calculations.',
    recommendation: 'These features feed most of the dashboard’s quantitative analytics.',
  },
  categoricalFeatures: {
    title: 'Categorical Features',
    description: 'Fields describing labels, segments, or classes rather than continuous values.',
    recommendation: 'These are important for grouping, validation rules, and weighting categories.',
  },
  totalDimensions: {
    title: 'Total Dimensions',
    description: 'Combined count of numerical and categorical fields in the dataset schema.',
    recommendation: 'This provides a quick sense of overall dataset complexity.',
  },
  aiOverview: {
    title: 'AI Dataset Overview',
    description: 'Summarizes the model’s interpretation of dataset quality, structure, and likely next steps.',
    recommendation: 'Useful for making the dashboard self-explanatory to first-time reviewers.',
  },
  aiConfidence: {
    title: 'AI Confidence',
    description: 'Signals how strongly the model supports its current explanation or recommendation.',
    recommendation: 'Use confidence as supporting context, not as a replacement for data review.',
  },
  aiRecommendation: {
    title: 'AI Recommendation',
    description: 'Explains the action the model suggests based on the observed data pattern.',
    recommendation: 'This helps connect raw metrics to a practical next step.',
  },
  aiReasoning: {
    title: 'AI Reasoning',
    description: 'Provides the model’s rationale for choosing a method, rule, or interpretation.',
    recommendation: 'Reasoning improves auditability and makes AI outputs easier to defend.',
  },
  refreshExplanation: {
    title: 'Refresh Explanation',
    description: 'Requests a fresh AI explanation for the current context.',
    recommendation: 'Use this after major data changes so the narrative stays aligned with the latest results.',
  },
  repositories: {
    title: 'Dataset Repositories',
    description: 'Lists dataset folders that contain staged processing outputs and version history.',
    recommendation: 'Choose a repository first to inspect lineage, archive versions, or restore a checkpoint.',
  },
  checkpointBuffer: {
    title: 'Processing Checkpoint Buffer',
    description: 'Displays the files that represent each processing stage for the selected dataset.',
    recommendation: 'This makes lineage tangible and helps explain which artifact powers each dashboard state.',
  },
  refreshFolders: {
    title: 'Refresh Folders',
    description: 'Reloads available dataset repositories and staged version files from storage.',
    recommendation: 'Use this after a pipeline run, export, or rollback so the panel reflects the newest state.',
  },
  compressFolder: {
    title: 'Compress Folder',
    description: 'Packages the selected dataset repository into a compressed archive.',
    recommendation: 'Helpful for transfer, backup, and preserving version lineage outside the live workspace.',
  },
  preview: {
    title: 'Preview',
    description: 'Opens a lightweight look at the selected staged file.',
    recommendation: 'Best for quickly sanity-checking content before analytics, rollback, or deletion.',
  },
  datasetView: {
    title: 'Dataset Viewer',
    description: 'Loads the selected staged file into the dedicated dataset viewing experience.',
    recommendation: 'Use this when you need record-level inspection rather than summary analytics.',
  },
  analyticsView: {
    title: 'Analytics View',
    description: 'Opens analytical dashboards for the selected processed version.',
    recommendation: 'This is useful for comparing how each stage changes quality and statistical outputs.',
  },
  rollback: {
    title: 'Rollback',
    description: 'Restore the dataset to a previously processed version while preserving audit history.',
    recommendation: 'Rollback is safest when a downstream transformation introduced quality regressions.',
  },
  deleteStage: {
    title: 'Delete Stage File',
    description: 'Removes a staged artifact from the repository ledger.',
    recommendation: 'Use cautiously, since deleting stage evidence can reduce traceability.',
  },
  versionLineage: {
    title: 'Version Lineage',
    description: 'Shows how versions connect from raw intake through cleaning, validation, and weighting.',
    recommendation: 'This is a strong enterprise UX cue because it makes provenance immediately visible.',
  },
  activeVersion: {
    title: 'Active Version',
    description: 'Indicates which version currently powers the workspace analytics.',
    recommendation: 'Always confirm this before exporting, reporting, or presenting findings.',
  },
  versionQuality: {
    title: 'Version Quality',
    description: 'Quality score for a specific staged version in the lineage flow.',
    recommendation: 'Compare these scores to judge whether each transformation improved data fitness.',
  },
  checkpointAnalysis: {
    title: 'Checkpoint Analysis',
    description: 'Inspection summary for the selected versioned file, including quality and AI interpretation.',
    recommendation: 'Helps reviewers understand what changed at each stage without opening the raw file.',
  },
  qualityComponents: {
    title: 'Quality Components',
    description: 'Breaks the score into missing, duplicate, outlier, and validation contributions.',
    recommendation: 'This makes the final grade explainable rather than opaque.',
  },
  report: {
    title: 'Generate PDF Report',
    description: 'Builds a shareable PDF summary for the selected version.',
    recommendation: 'Ideal for presenting project outcomes to recruiters, stakeholders, or auditors.',
  },
  reportDownload: {
    title: 'Download Report',
    description: 'Opens the generated PDF report file.',
    recommendation: 'Use it once generation completes to review the final shareable deliverable.',
  },
  exportFormat: {
    title: 'Export Format',
    description: 'Defines the file type used when downloading the active dataset.',
    recommendation: 'Pick CSV for portability, XLSX for spreadsheets, ZIP for bundles, and encrypted ZIP for sensitive handoff.',
  },
  exportAction: {
    title: 'Export Dataset',
    description: 'Downloads the active dataset in the selected format.',
    recommendation: 'Use export after confirming the active version and quality indicators match your intended output.',
  },
  archiveVersions: {
    title: 'Archive Old Versions',
    description: 'Compresses older versions while keeping the newest live entries available.',
    recommendation: 'This reduces clutter without losing lineage or compliance evidence.',
  },
  encryptedExport: {
    title: 'Encrypted Export',
    description: 'Packages the dataset into a protected archive for safer transfer or storage.',
    recommendation: 'Prefer this option when working with sensitive or regulated data.',
  },
  missingAudit: {
    title: 'Null Observation Audit',
    description: 'Analyzes missing values, affected fields, and recommended remediation strategies.',
    recommendation: 'This is where users learn both the scale of incompleteness and the safest fix.',
  },
  missingObservations: {
    title: 'Missing Observations',
    description: 'Total count of empty values found across all fields.',
    recommendation: 'Use it to quantify the data quality problem before choosing a remediation strategy.',
  },
  impactedDimensions: {
    title: 'Impacted Dimensions',
    description: 'Number of columns containing one or more missing values.',
    recommendation: 'A wide spread of impact usually requires more nuanced cleaning than a single-field issue.',
  },
  completenessScore: {
    title: 'Completeness Score',
    description: 'Percentage of non-missing cells across the dataset.',
    recommendation: 'Higher completeness means downstream models and summaries rely less on imputation.',
  },
  remediationWorkflow: {
    title: 'Remediation Workflow',
    description: 'Selects the strategy used to handle missing values column by column.',
    recommendation: 'Choose methods that preserve data meaning, not just the highest completion rate.',
  },
  applyCleaning: {
    title: 'Apply Cleaning',
    description: 'Commits the selected imputation and drop strategies to the active processing pipeline.',
    recommendation: 'Apply only after reviewing AI suggestions and understanding the tradeoff for each field.',
  },
  outlierAnalysis: {
    title: 'Outlier Vector Analysis',
    description: 'Detects extreme observations and previews how anomaly treatment would change the dataset.',
    recommendation: 'This helps teams explain why certain records were flagged before removing them.',
  },
  detectionMethod: {
    title: 'Detection Method',
    description: 'Controls the algorithm used to identify anomalous values.',
    recommendation: 'IQR is robust for skewed data, z-score fits near-normal data, and winsorization caps extremes.',
    examples: [
      'IQR outlier detection is robust for skewed distributions.',
    ],
  },
  detectOutliers: {
    title: 'Execute Analysis',
    description: 'Runs outlier detection for the selected feature and methodology.',
    recommendation: 'Use after choosing a field and method so charts and thresholds are refreshed together.',
  },
  applyOutliers: {
    title: 'Apply Outlier Detection',
    description: 'Commits the current anomaly treatment to the dataset preview and pipeline state.',
    recommendation: 'Apply only after reviewing thresholds and before/after previews.',
  },
  validationWorkbench: {
    title: 'Validation Workbench',
    description: 'Creates and runs dataset logic rules to catch invalid or inconsistent records.',
    recommendation: 'This turns hidden integrity assumptions into explicit, reviewable checks.',
  },
  suggestRules: {
    title: 'Suggest Rules',
    description: 'Asks the AI layer to propose validation rules based on schema and value patterns.',
    recommendation: 'Good for bootstrapping rule coverage before fine-tuning severity and thresholds manually.',
  },
  addLogic: {
    title: 'Add Logic',
    description: 'Adds a manual validation rule to the active rule set.',
    recommendation: 'Use this for business rules the model may not infer from structure alone.',
  },
  runValidation: {
    title: 'Run Validation',
    description: 'Evaluates all active rules against the current dataset.',
    recommendation: 'Run after editing rules so the violation table reflects your latest logic definition.',
  },
  exceptionLog: {
    title: 'Exception Log',
    description: 'Lists the records that violate active validation rules.',
    recommendation: 'This table is the most direct evidence for why a dataset failed integrity checks.',
  },
  weighting: {
    title: 'Statistical Estimation',
    description: 'Computes weighted survey estimates to reduce representation bias.',
    recommendation: 'This is especially important when sample composition differs from the target population.',
  },
  runEngine: {
    title: 'Run Engine',
    description: 'Calculates the selected weighted estimate and its uncertainty metrics.',
    recommendation: 'Run after selecting both the target metric and the appropriate weight column.',
  },
  weightedMean: {
    title: 'Weighted Mean',
    description: 'Average value after applying weights to better reflect the target population.',
    recommendation: 'Compare this with the raw mean to show how weighting changes the estimate.',
  },
  rawMean: {
    title: 'Raw Mean',
    description: 'Unweighted average directly observed in the sample.',
    recommendation: 'Large gaps between raw and weighted means often indicate sample imbalance.',
  },
  marginOfError: {
    title: 'Margin of Error',
    description: 'Indicates the expected sampling variability in survey estimates.',
    recommendation: 'Smaller margins mean tighter precision; present this whenever weighted results inform decisions.',
  },
  confidenceInterval: {
    title: 'Confidence Interval',
    description: 'Range within which the weighted estimate is expected to fall at the stated confidence level.',
    recommendation: 'Use it to communicate uncertainty responsibly instead of citing a single number alone.',
  },
  weightImpact: {
    title: 'Weight Impact Diagnostic',
    description: 'Compares raw and weighted outputs so users can see how calibration changed the result.',
    recommendation: 'This makes the estimator’s effect understandable for non-statistical reviewers.',
  },
};

export function getTooltipContent(key, fallback = {}) {
  return TOOLTIP_CONTENT[key] || fallback;
}
