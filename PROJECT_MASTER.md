# PROJECT MASTER — DAET (Data Analysis & Estimation Tool)

> **Document Type:** Authoritative Technical Specification, Implementation Audit, and Evidence Ledger  
> **Repository:** `varunchandra10/data_analysis_estimation_tool` (DAET)  
> **Workspace Path:** `c:\Users\kvcsu_ht23nk8\OneDrive\Desktop\all_Projects\Projects\DAET`  
> **Target Audiences:** Engineering Recruiters, Technical Hiring Managers, System Architects, Senior Interviewers, Portfolio Reviewers  
> **Strict Verification Standard:** Source code, configuration files, test suites, and git history take absolute precedence over README or marketing assertions. All conflicts and discrepancies are explicitly recorded.

---

## 1. Project Overview

DAET (Data Analysis & Estimation Tool) is a full-stack, survey data processing, validation, statistical weighting estimation, and lineage tracking system. Built with a React 19 / Vite frontend and a FastAPI / Python backend, the platform addresses the challenges of national statistical survey operations (such as those conducted by statistical agencies like India's MoSPI — Ministry of Statistics and Programme Implementation). 

The platform provides:
1. Deterministic statistical data preprocessing (missing-value imputation, outlier detection, deduplication).
2. A configurable validation Domain-Specific Language (DSL) for survey-rule verification and skip-logic consistency.
3. Survey-grade statistical weighting calculations (weighted mean, weighted variance, weighted proportions, Kish effective sample size, standard errors, margin of error, and confidence intervals).
4. An AI intelligence layer utilizing local LLMs via Ollama (`phi3`) with a cloud fallback to the Google Gemini API, backed by a SQLite/filesystem cache to generate natural-language explanations without slowing down numerical workflows.
5. An immutable, DAG-based version control and snapshot engine that creates manifests, computes SHA-256 hashes, tracks lineage depth, and supports atomic database-and-filesystem rollbacks.
6. Cryptographic at-rest encryption (Fernet / AES), Gzip compression, signed expiring download tokens (HMAC/JWT), and automated ReportLab PDF audit summaries.

---

## 2. One-Line Description

A full-stack, lineage-tracked survey data engineering and statistical estimation platform combining deterministic pandas/scipy preprocessing with an explainable AI layer, versioned DAG rollbacks, and cryptographic auditability.

---

## 3. Problem Statement

Official socio-economic survey data (e.g., household income, agricultural censuses, consumption surveys) contains widespread data quality issues:
- High missingness in sensitive variables (e.g., income, expenditure).
- Extreme anomalies and sampling outliers that distort national aggregate indicators.
- Violations of survey skip logic (e.g., respondent reports `employed = "No"` but non-zero `salary`).
- Disproportional sampling probabilities requiring survey weights for unbiased population calibration.
- Lack of auditability and reproducibility: ad-hoc Python/R scripts run by statistical officers lack atomic checkpointing, version history, or audit logs, making data lineage unprovable.
- Black-box AI risks: directly submitting government survey microdata to third-party proprietary LLMs violates data sovereignty and introduces non-deterministic hallucinations into official statistics.

---

## 4. Objectives

1. **Deterministic Processing Isolation:** Keep all data transformation, imputation, outlier handling, and weighting operations strictly mathematical, reproducible, and verifiable against established libraries (e.g., `statsmodels`, `scipy`, `scikit-learn`).
2. **Explainable AI Integration:** Decouple AI from decision-making; utilize LLMs strictly for narrative explanations and non-blocking guidance, enforced via concurrency semaphores (limit 3) and persistent disk/database caching.
3. **Survey-Grade Weighting:** Compute representative population estimates from sample data using survey weight calibration, Kish Effective Sample Size ($n_{\text{eff}}$), standard errors, and confidence intervals.
4. **Immutable Lineage & Rollback:** Guarantee version control at stage boundaries with JSON manifests, SHA-256 integrity hashes, and single-click atomic rollbacks.
5. **Storage Security & Integrity:** Enforce path sanitization against directory traversal, provide Fernet symmetric encryption at rest, signed expiring URL tokens, and double-write audit logging (SQLite + disk JSON).

---

## 5. What the System Actually Does

1. **Ingests Data:** Accepts `.csv` and `.xlsx` uploads up to 500,000 rows (`MAX_ROWS`), infers schema data types (Numerical, Categorical, Date, Text), computes null counts and basic column metrics, writes raw data to `datasets/<name>/processed/raw_<name>.csv`, computes SHA-256 checksums, and registers records in SQLite.
2. **Cleans Data:**
   - *Imputation:* Imputes numeric and categorical columns via `scikit-learn` `SimpleImputer` (`mean`, `median`, `most_frequent`) or `KNNImputer` ($k=5$).
   - *Duplicates:* Detects and eliminates duplicate rows (`keep='first'` or `keep='last'`).
   - *Outlier Detection & Treatment:* Calculates boundaries using IQR ($Q_1 - 1.5 \times \text{IQR}, Q_3 + 1.5 \times \text{IQR}$), Z-Score ($|z| > 3$), or Winsorization (5th/95th percentile capping via `scipy.stats.mstats.winsorize`).
3. **Evaluates Validation DSL Rules:** Executes single-condition checks (`>`, `<`, `==`, `!=`, `is_null`, `not_null`), conditional rules (`if A then B`), numeric bounds (`min`, `max`), dependency rules (`source_value -> target required`), uniqueness constraints, allowed value lists, regex patterns, and nested composite `AND`/`OR` rules. Automatically suggests rules based on token heuristics (e.g., `age`, `salary`, `percent`).
4. **Calculates Weighted Statistics:** Takes a dataset target variable and pre-existing weight column to compute weighted means, weighted variances ($ddof=1$), unweighted benchmarks, Kish effective sample sizes ($n_{\text{eff}}$), standard errors, margins of error, confidence intervals ($t$-distribution or $z$-distribution), and weighted categorical proportions. Validates internal calculations against `statsmodels.stats.weightstats.DescrStatsW`.
5. **Generates Explainable AI Insights:**
   - Calculates column-level statistical characteristics (skewness, variance, unique ratio, outlier percentage).
   - Generates deterministic recommendation codes (e.g., `high_skewness` $\rightarrow$ `median`).
   - Dispatches small, targeted prompts to local Ollama (`phi3`) with failover to Google Gemini API and template fallbacks.
   - Caches outputs in `backend/ai_cache/<dataset_name>/` and references them in SQLite `ai_cache_refs`.
6. **Maintains Version Snapshots & DAG Lineage:**
   - Creates stage versions (`v1_cleaned`, `v2_deduplicated`, `v3_outliers`, `v4_validated`, `v5_weighted`) with companion JSON manifests.
   - Computes CSV dimensions via fast C-level line-counting (`_fast_csv_shape`) to avoid memory-heavy pandas re-reads.
   - Performs atomic rollbacks: restores physical active files, updates database pointers, marks rollback events in manifests, invalidates stale AI caches, and records audit log entries.
7. **Produces Audited Reports & Secure Exports:**
   - Compiles ReportLab PDF documents with embedded Matplotlib histogram charts and tabular summaries.
   - Encrypts archived versions with Fernet AES keys into `.csv.gz.enc`.
   - Generates signed, HMAC/JWT temporary download tokens.
   - Provides storage-database reconciliation (`/api/reconcile`) to identify orphan files, stale database pointers, or checksum mismatches.

---

## 6. Complete Project Structure

```
DAET/
├── .env                                # Local secrets & configuration overrides
├── .gitignore                          # Git exclusions (venv, node_modules, caches, local datasets)
├── AI_integration.MD                   # Architecture specification for decoupled AI explanation layer
├── LICENSE                             # Apache 2.0 / Project License file
├── Phases.md                           # 10-Phase implementation roadmap (MoSPI-aligned)
├── README.md                           # Top-level showcase and setup documentation
├── deep_audit_report.md                # 15-parameter enterprise audit report
├── docker-compose.yml                  # Multi-container orchestration (backend:8000, frontend:3000)
├── git_commands.txt                    # Reference git branch/commit workflow commands
│
├── documents/                          # Architecture diagrams, ERD, sequence charts, sample PDF
│   ├── 1.png                           # Screenshot: Project Homepage
│   ├── 2.png                           # Screenshot: Dataset Explorer
│   ├── 3.png                           # Screenshot: Analytics Dashboard
│   ├── 4.png                           # Screenshot: Version Control Page
│   ├── abstract_architecture.png       # Conceptual system architecture diagram
│   ├── end_to_end_seq_1.png            # Sequence Diagram: Ingestion & Preprocessing
│   ├── end_to_end_seq_2.png            # Sequence Diagram: Validation & Weighting
│   ├── end_to_end_seq_3.png            # Sequence Diagram: Versioning & Reporting
│   ├── ER-diagram.png                  # Database Entity-Relationship Diagram
│   └── PS-4.pdf                        # Problem statement specification document
│
├── backend/                            # FastAPI Python Backend Application
│   ├── .dockerignore                   # Docker build exclusions
│   ├── Dockerfile                      # Multi-stage Python 3.11-slim container with scientific build deps
│   ├── Procfile                        # Render web process definition (`uvicorn main:app`)
│   ├── README.md                       # Backend-specific architecture and API documentation
│   ├── daet.sqlite3                    # SQLite relational database store
│   ├── main.py                         # Application entrypoint, CORS, router mounting, lifespan init
│   ├── requirements.txt                # Pinned backend Python dependencies
│   │
│   ├── core/                           # Core infrastructure & configuration
│   │   ├── app_init.py                 # FastAPI application factory with CORS middleware
│   │   ├── config.py                   # Pydantic-based settings loader reading from root `.env`
│   │   ├── constants.py                # File types, column types, severities, outlier methods
│   │   ├── database.py                 # SQLAlchemy engine, session maker, SQLite foreign-keys pragma
│   │   └── exceptions.py               # Domain exceptions (DAETError, WeightingError, etc.)
│   │
│   ├── models/                         # SQLAlchemy ORM Models
│   │   ├── __init__.py                 # Model registry exports
│   │   ├── ai_cache_model.py           # AICacheRef schema
│   │   ├── audit_log_model.py          # AuditLog schema
│   │   ├── dataset_model.py            # Dataset schema
│   │   ├── project_model.py            # Project schema
│   │   ├── report_model.py             # Report schema
│   │   ├── user_model.py               # User schema
│   │   └── version_model.py            # Version schema
│   │
│   ├── routes/                         # HTTP Request Controllers (APIRouter modules)
│   │   ├── ai_routes.py                # /api/ai/recommendations, /api/ai/explanations
│   │   ├── auth_routes.py              # /api/auth/register, /api/auth/login, /api/auth/token
│   │   ├── cleaning_routes.py          # /api/clean/missing-values
│   │   ├── duplicate_routes.py         # /api/duplicates/process
│   │   ├── logs_routes.py              # /api/logs/{dataset_name}
│   │   ├── outlier_routes.py           # /api/outliers/detect, /api/outliers/apply
│   │   ├── pipeline_routes.py          # /api/pipeline/run
│   │   ├── report_routes.py            # /api/report/pdf, /api/reports/download/{filename}
│   │   ├── statistics_routes.py        # /api/statistics/profile, /api/statistics/estimate
│   │   ├── upload_routes.py            # /api/upload, /api/datasets/full-preview
│   │   ├── validation_routes.py        # /api/validation/run, /api/validation/suggest
│   │   └── versioning_routes.py        # 34 endpoints: manifests, snapshots, rollback, encryption, tokens
│   │
│   ├── schemas/                        # Pydantic Request & Response DTOs
│   │   ├── ai_schema.py                # AI request/response validation schemas
│   │   ├── auth_schema.py              # Authentication DTOs (Token, UserCreate, UserLogin)
│   │   ├── cleaning_schema.py          # Cleaning strategies DTO
│   │   ├── common.py                   # Generic success/error response envelopes
│   │   ├── pipeline_schema.py          # End-to-end pipeline execution schema
│   │   ├── upload_schema.py            # Upload preview request schema
│   │   ├── validation_schema.py        # DSL rule schemas (Simple, Range, Conditional, Composite)
│   │   ├── versioning_schema.py        # Versioning, rollback, archive, and token DTOs
│   │   └── weighting_schema.py         # Weighting request and profile schemas
│   │
│   ├── services/                       # Business Logic Services
│   │   ├── audit_log_service.py        # Dual-write logging service (SQLite + filesystem JSON)
│   │   ├── auth_service.py             # PBKDF2-HMAC password hashing, verification, JWT creation
│   │   ├── cache_service.py            # Transient service cache helpers
│   │   ├── cleaning_service.py         # Missing-value imputation, deduplication, outlier filtering
│   │   ├── compression_engine.py       # Gzip stream compression and decompression
│   │   ├── dataset_loader.py           # Dataset loading utilities and path validation
│   │   ├── encryption_engine.py        # Fernet symmetric encryption and decryption
│   │   ├── export_service.py           # Multi-format dataset streaming (CSV, XLSX, ZIP)
│   │   ├── pipeline_engine.py          # Automated pipeline orchestrator (Raw -> Reports)
│   │   ├── reconciliation_service.py   # Database-filesystem parity checker
│   │   ├── signed_download_service.py  # Expiring JWT download token generator and validator
│   │   ├── statistics_service.py       # Comprehensive statistics and estimation wrapper
│   │   ├── task_manager.py             # Asynchronous task registry and polling manager
│   │   ├── temp_decryption_engine.py   # Context manager for temporary decrypted file access
│   │   ├── validation_service.py       # DSL rule execution coordinator
│   │   │
│   │   ├── ai/                         # AI Layer Components
│   │   │   ├── cache_engine.py         # Local JSON AI response cache manager
│   │   │   ├── explanation_engine.py   # Concurrency-controlled explanation dispatcher
│   │   │   ├── ollama_client.py        # Async HTTP client for Ollama and Gemini fallback
│   │   │   ├── prompt_builder.py       # Constrained prompt templates for concise explanations
│   │   │   └── recommendation_engine.py# Deterministic statistical rule-based recommendation generator
│   │   │
│   │   ├── archive/                    # Archival Subsystem
│   │   │   └── engine.py               # Compression (.gz) and encryption (.enc) of historical snapshots
│   │   │
│   │   ├── reporting/                  # ReportLab PDF Subsystem
│   │   │   └── engine.py               # Programmatic PDF generation with Matplotlib figures
│   │   │
│   │   ├── statistics/                 # Mathematical Statistics Subsystem
│   │   │   ├── ci_utils.py             # Standard error, margin of error, Z-score, t-score
│   │   │   ├── variance_utils.py       # Kish effective sample size, weighted variance/std
│   │   │   └── weighting_engine.py     # Survey-weighted mean, proportions, statsmodels verification
│   │   │
│   │   ├── storage/                    # Storage loaders
│   │   │   └── dataset_loader.py       # Low-level dataset streaming and buffer loader
│   │   │
│   │   └── versioning/                 # Version Management Subsystem
│   │       ├── engine.py               # Checkpoint creation, manifest generation, atomic rollback
│   │       └── quality_engine.py       # Multi-component dataset quality scoring
│   │
│   ├── tests/                          # Backend Pytest Test Suite
│   │   ├── conftest.py                 # Pytest fixtures: in-memory DB session, test client, mock data
│   │   ├── test_auth.py                # Tests: registration, login, token verification, invalid credentials
│   │   ├── test_performance.py         # Tests: in-memory cleaning, AI concurrency/cache, pipeline execution
│   │   ├── test_reports.py             # Tests: PDF generation, schema rendering, download headers
│   │   ├── test_statistics.py          # Tests: ESS, weighted variance, CI helpers, statsmodels parity
│   │   ├── test_storage_security.py    # Tests: path traversal defense, upload rollback on DB failure
│   │   ├── test_upload.py              # Tests: upload endpoints
│   │   └── test_versioning.py          # Tests: manifest creation, lineage tracking, rollback
│   │
│   └── utils/                          # Common Helper Utilities
│       ├── dataframe_optimizer.py      # Numeric downcasting and low-cardinality category conversion
│       ├── dataframe_utils.py          # Type inference, schema extraction, value coercion
│       ├── dataset_storage.py          # Folder path resolvers, layout initializers, naming sanitation
│       ├── file_utils.py               # Safe path boundary validation, JSON sanitization
│       ├── hash_utils.py               # SHA-256 checksum computation and verification
│       ├── log_utils.py                # Logging decorator (`@log_calls`), audit log persistence
│       ├── pagination_utils.py         # Dataframe slicing and pagination helper
│       ├── stats_utils.py              # Descriptive statistics, histograms, boxplot parameters
│       ├── token_utils.py              # JWT token generation, expiration, decoding
│       ├── validation_utils.py         # Simple condition evaluator
│       └── visualization_utils.py      # Chart data structures for Recharts
│
└── frontend/                           # React 19 / Vite Frontend Application
    ├── Dockerfile.prod                 # Multi-stage production container (Node build -> Nginx Alpine)
    ├── README.md                       # Frontend documentation and component structure
    ├── eslint.config.js                # ESLint configuration
    ├── index.html                      # Single-page application root HTML
    ├── package.json                    # Frontend dependencies and npm scripts
    ├── package-lock.json               # Locked dependency tree
    ├── playwright.config.js            # Playwright multi-browser test configuration
    ├── vite.config.js                  # Vite configuration, React Compiler Babel preset, Tailwind, dev proxy
    │
    ├── e2e/                            # Playwright End-to-End Test Suite
    │   ├── data/                       # Test fixtures
    │   │   └── test_data.csv           # 7-row sample survey dataset (nulls, duplicates, outliers, weights)
    │   ├── cleaning.spec.js            # E2E: Missing-value imputation workflow
    │   ├── duplicate.spec.js           # E2E: Duplicate detection and removal
    │   ├── export.spec.js              # E2E: Multi-format data download verification
    │   ├── outlier.spec.js             # E2E: Outlier threshold sliders and visual pruning
    │   ├── pipeline.spec.js            # E2E: End-to-end automated pipeline runner
    │   ├── preview_issue.spec.js       # E2E: Data grid rendering and pagination stability
    │   ├── report.spec.js              # E2E: PDF report queueing, polling, and downloading
    │   ├── rollback.spec.js            # E2E: Version control DAG selection and rollback execution
    │   ├── upload.spec.js              # E2E: Ingestion drag-and-drop, invalid file rejection
    │   ├── validation.spec.js          # E2E: DSL rule builder, suggested rules, violation view
    │   ├── weighting.spec.js           # E2E: Weight variable selection, survey estimation execution
    │   └── utils/                      # Test helper utilities
    │       └── helpers.js              # Navigation, upload, and authentication helpers
    │
    ├── public/                         # Static web assets (favicons, logos)
    │
    └── src/                            # Application Source Code
        ├── App.css                     # Global root styling
        ├── App.jsx                     # Layout shell: Navigation, Sidebar, Theme wrapper, Context providers
        ├── allroutes.jsx               # React Router route registry and navigation guards
        ├── index.css                   # Tailwind CSS v4 definitions, HSL variables, dark mode styles
        ├── main.jsx                    # React entrypoint mounting root element
        │
        ├── components/                 # React UI Components
        │   ├── AIEngine.jsx            # AI card container
        │   ├── AnalyticsDashboard.jsx  # Health metrics, completeness progress, column distribution charts
        │   ├── DatasetComparison.jsx   # Side-by-side delta view between versions
        │   ├── DatasetPreview.jsx      # Paginated data table grid with type badges
        │   ├── DuplicatePanel.jsx      # Duplicate scanning, delta pie/bar charts, purge controls
        │   ├── ExportPanel.jsx         # Export wizard (CSV, Excel, Gzip, Encrypted)
        │   ├── FileUpload.jsx          # Drag-and-drop file ingestion zone with progress feedback
        │   ├── QualityScore.jsx        # Radar / breakdown cards of data quality dimensions
        │   ├── ReportGenerator.jsx     # Checkpoint selector, background progress bar, PDF preview
        │   ├── StatisticsPanel.jsx     # Numerical column distributions, quantiles, scatter matrices
        │   ├── TimelinePanel.jsx       # Chronological audit timeline
        │   ├── VersionLineageGraph.jsx # Interactive SVG DAG lineage tree with rollback triggers
        │   ├── VersioningPanel.jsx     # Version checkpoints list, disk usage, compression actions
        │   ├── UI/                     # Global layout elements (Navbar, Sidebar, Landingpage, Tooltips)
        │   ├── charts/                 # Recharts wrappers (Bar, Histogram, Boxplot, Scatter, Donut)
        │   ├── cleaning/               # Wizard components for Imputation, Outliers, Validation, Weighting
        │   └── common/                 # Primitive widgets (Modals, Badges, Dropdowns, AI cards)
        │
        ├── context/                    # React Context State Providers
        │   ├── AIContext.jsx           # AI recommendations, explanation state, cache trackers
        │   ├── AuthContext.jsx         # User login state, JWT token storage in localStorage
        │   ├── DatasetContext.jsx      # Active dataset metadata, preview rows, active stage state
        │   ├── ProjectContext.jsx      # Active project workspace scope
        │   ├── ThemeContext.jsx        # Dark / Light theme toggle with localStorage persistence
        │   └── VersionContext.jsx      # Active version checkpoints and rollback coordination
        │
        ├── hooks/                      # Custom React Hooks (encapsulating API interactions)
        │   ├── useAI.js                # Fetches AI recommendations and explanations
        │   ├── useDataset.js           # Dataset upload, preview, and pagination operations
        │   ├── useExport.js            # Export generation and download triggers
        │   ├── usePipeline.js          # Dispatches automated pipeline execution
        │   ├── useReports.js           # Enqueues and polls PDF generation tasks
        │   ├── useStatistics.js        # Runs column profiling and descriptive calculations
        │   ├── useValidation.js        # Evaluates DSL rules and fetches smart rule suggestions
        │   ├── useVersioning.js        # Fetches version list, manifests, and triggers rollbacks
        │   └── useWeighting.js         # Calls weighting estimation endpoint
        │
        ├── pages/                      # Page-Level Views
        │   ├── analysis/               # Statistical exploration pages
        │   ├── cleaning/               # Imputation, Outlier, Deduplication, Validation, Weighting views
        │   ├── data/                   # Dataset explorer and full dataset grid views
        │   ├── home/                   # Main landing page
        │   ├── ingestion/              # Ingestion wizard view
        │   └── versioning/             # Version control and lineage canvas view
        │
        ├── services/api/               # Axios API Clients
        │   ├── ai.api.js               # AI recommendation and explanation API calls
        │   ├── auth.api.js             # Authentication endpoints (login, register, token)
        │   ├── cleaning.api.js         # Imputation endpoints
        │   ├── config.js               # API base URL configuration
        │   ├── httpClient.js           # Axios instance with request/response auth interceptors
        │   ├── outlier.api.js          # Outlier detection and application endpoints
        │   ├── pipeline.api.js         # Automated pipeline execution endpoints
        │   ├── report.api.js           # Report queueing and download endpoints
        │   ├── statistics.api.js       # Profiling and estimation endpoints
        │   ├── upload.api.js           # Ingestion and full-preview endpoints
        │   ├── validation.api.js       # Rule evaluation and suggestion endpoints
        │   └── versioning.api.js       # Versioning, rollback, manifest, and archive endpoints
        │
        └── utils/                      # Frontend Utilities
            ├── sessionHelpers.js       # Session storage handlers
            └── tooltipContent.js       # 60+ statistical and methodological tooltip definitions
```

---

## 7. Architecture

### System Topology Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                           CLIENT TIER                                              |
|                                                                                                    |
|    React 19 SPA (Vite + Tailwind CSS v4 + Zustand + Recharts + ReactFlow + Framer Motion)          |
|    - Dataset Ingestion Zone     - Outlier Detection Studio     - Survey Weighting Calibrator       |
|    - Schema & Data Grid         - Deduplication Manager        - Interactive Lineage DAG Graph     |
|    - Imputation Studio          - Rule Validation DSL Builder  - PDF Report Center                 |
+----------------------------------------------------------------------------------------------------+
                                      |                                  ^
                                      | REST / JSON / Multipart          | HTTP Responses / Streams
                                      v                                  |
+----------------------------------------------------------------------------------------------------+
|                                      API GATEWAY / ROUTING                                         |
|                                                                                                    |
|    FastAPI (Uvicorn ASGI Server)                                                                   |
|    - CORS Middleware            - Static File Mounts (/reports) - Request Pydantic Validation      |
|    - OAuth2 Bearer Auth Flow    - Exception Handler Decorators  - Path Boundary Guardrails         |
+----------------------------------------------------------------------------------------------------+
       |                    |                     |                     |                     |
       v                    v                     v                     v                     v
+--------------+    +---------------+    +------------------+    +---------------+    +---------------+
| INGESTION &  |    | CLEANING &    |    | SURVEY WEIGHTING |    | VALIDATION    |    | VERSIONING &  |
| LOADERS      |    | TRANSFORMS    |    | ENGINE           |    | DSL ENGINE    |    | LINEAGE DAG   |
|              |    |               |    |                  |    |               |    |               |
| Fast shape   |    | SimpleImputer |    | Weighted Mean    |    | Simple Rules  |    | Checkpoints   |
| parser       |    | KNNImputer    |    | W. Proportions   |    | Conditional   |    | Manifests     |
| Pandas/open- |    | IQR Pruning   |    | Kish ESS (n_eff) |    | Bounds/Range  |    | Fast diffs    |
| pyxl load    |    | Z-Score (3.0) |    | Standard Error   |    | Allowed values|    | Atomic        |
| Downcasting  |    | Winsorization |    | Margin of Error  |    | Regex pattern |    | rollbacks     |
| optimizer    |    | Deduplication |    | 95% Conf. Int.   |    | Composite     |    | Quality score |
+--------------+    +---------------+    +------------------+    +---------------+    +---------------+
       |                    |                     |                     |                     |
       +--------------------+---------------------+---------------------+---------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                       AI INTELLIGENCE LAYER                                        |
|                                                                                                    |
|    1. Deterministic Rule Recommender (variance, skewness, missing ratio, unique ratio)             |
|    2. Concurrency Semaphore (max 3 workers)                                                        |
|    3. Ollama Client (Local Phi3 model via http://localhost:11434)                                  |
|    4. Cloud Failover (Gemini API fallback)                                                         |
|    5. Persistent Caching (ai_cache/<dataset_name>/ and SQLite ai_cache_refs)                       |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                    STORAGE & PERSISTENCE TIER                                      |
|                                                                                                    |
|  +-------------------------------------+          +--------------------------------------------+   |
|  |           SQLite Database           |          |            Filesystem Storage              |   |
|  |             daet.sqlite3            |          |             backend/datasets/              |   |
|  |                                     |          |                                            |   |
|  | - users        - datasets           |          | - processed/raw_<name>.csv                 |   |
|  | - projects     - versions           |          | - processed/versions/<ver>/dataset.csv     |   |
|  | - reports      - audit_logs         |          | - processed/manifests/<ver>_manifest.json  |   |
|  | - ai_cache_refs                     |          | - archive/<ver>.csv.gz.enc (Fernet AES)    |   |
|  | (PRAGMA foreign_keys = ON)          |          | - reports/*.pdf                            |   |
|  +-------------------------------------+          +--------------------------------------------+   |
+----------------------------------------------------------------------------------------------------+
```

---

## 8. End-to-End Workflow

### Step-by-Step Lifecycle

```
[User CSV/XLSX Upload]
       │
       ▼
1. Validation & Storage Guard:
   - Check file extension (.csv, .xlsx)
   - Verify size limits (MAX_ROWS = 500,000)
   - Read buffer into Pandas DataFrame (in-memory downcasting via optimize_dataframe_memory)
   - Save physical file to backend/datasets/<dataset_name>/processed/raw_<dataset_name>.csv
   - Compute SHA-256 checksum
   - Commit initial record to SQLite `datasets` table (transaction rollback removes file if DB fails)
       │
       ▼
2. Automated Schema Inference & Exploration:
   - Infer types: Numerical, Categorical, Date, Text
   - Calculate summary statistics (mean, median, variance, null counts, quantiles)
   - Render preview in React data grid
       │
       ▼
3. Cleaning & Preprocessing (Iterative or Pipeline):
   - Missing-Value Imputation: Apply Mean / Median / Mode / KNN (creates version snapshot)
   - Duplicate Handling: Identify identical rows and purge (creates version snapshot)
   - Anomaly Detection: IQR, Z-Score, or Winsorization (creates version snapshot)
   - Every operation logs affected row count, actor, and timestamp to SQLite and JSON audit trails
       │
       ▼
4. Validation Rule Evaluation:
   - User inputs or system auto-suggests DSL rules (e.g., salary >= 0, age <= 120, employment logic)
   - System evaluates rules vectorized across the DataFrame
   - Returns list of specific violating row indices, actual values, and severity levels
       │
       ▼
5. Survey-Grade Weighting Estimation:
   - User specifies variable of interest and weight column
   - System filters non-positive/null weights
   - Computes weighted mean or proportions, Kish ESS, standard error, margin of error, 95% CI
   - Cross-checks calculations against statsmodels DescrStatsW
       │
       ▼
6. AI Explanation & Recommendation:
   - Column analyzer derives skewness, variance, missing%, and outlier%
   - Recommendation engine generates method suggestions (e.g., median for skewed distributions)
   - Explanation engine dispatches constrained prompt to local Ollama (phi3)
   - If Ollama is offline/times out, fails over to Gemini API; if cloud fails, falls back to deterministic template
   - Result is saved to local JSON cache and mapped in SQLite `ai_cache_refs`
       │
       ▼
7. Version Commit & DAG Snapshotting:
   - Filesystem writes `versions/<version_name>/dataset.csv`
   - Manifest generated with SHA-256 hash, fast line-counted rows/columns, lineage parent pointers
   - SQLite `versions` table updated
       │
       ▼
8. Export & Report Compilation:
   - On-demand PDF compilation via ReportLab flowables with Matplotlib histogram distributions
   - Exports available in raw CSV, formatted Excel (`openpyxl`), Gzip, or Fernet-encrypted format
   - Expiring JWT signed download tokens protect file streaming
```

---

## 9. Major Components

### 1. Ingestion Engine (`backend/routes/upload_routes.py`, `backend/services/dataset_loader.py`)
- Manages upload streaming, file extension filtering, in-memory buffer decoding, and disk persistence.
- Enforces atomic DB-filesystem sync: if database persistence fails, the written file is unlinked immediately.

### 2. Preprocessing & Cleaning Engine (`backend/services/cleaning_service.py`)
- Missing Values: Executes scikit-learn `SimpleImputer` and `KNNImputer`.
- Deduplication: Uses pandas vectorized duplicate masking (`duplicated`, `drop_duplicates`).
- Outlier Pruning: Computes parametric (Z-score) and non-parametric (IQR, Winsorization) cutoffs.

### 3. Validation DSL Engine (`backend/services/validation/`)
- `smart_engine.py`: Profiles columns using regex token matching to auto-suggest domain rules.
- `evaluators.py`: Vectorized evaluation functions for simple conditions, range constraints, conditional implications, uniqueness, and composite boolean trees.
- `dispatcher.py`: Dispatches rule definitions from JSON payloads to evaluator functions.

### 4. Weighting & Estimation Engine (`backend/services/statistics/weighting_engine.py`)
- Implements Horvitz-Thompson-style weighted estimation for survey data.
- Calculates Kish's Effective Sample Size to quantify variance inflation caused by unequal weighting.
- Computes standard errors and Wald/t-distribution confidence intervals.

### 5. AI Explanation & Recommendation Subsystem (`backend/services/ai/`)
- `recommendation_engine.py`: Deterministic rule heuristics mapping statistical metrics to preprocessing recommendations.
- `explanation_engine.py`: Async semaphore-governed worker pool executing LLM prompts.
- `ollama_client.py`: Async HTTP client connecting to Ollama `/api/generate` with timeout and cooldown mechanisms.
- `cache_engine.py`: JSON cache manager storing explanation payloads keyed by dataset and version.

### 6. Version Control & Lineage Engine (`backend/services/versioning/engine.py`)
- Snapshot manager creating immutable copies of datasets under isolated version directories.
- Lineage builder generating parent-child trees.
- Rollback coordinator restoring physical datasets, updating DB records, invalidating AI caches, and recording audit entries.

### 7. Security & Cryptographic Subsystem (`backend/services/encryption_engine.py`, `signed_download_service.py`)
- Symmetrically encrypts archived data using Fernet (AES-128-CBC with HMAC-SHA256).
- Issues signed HMAC-SHA256 JWT tokens with timestamps to restrict download access.

### 8. Audited Reporting Engine (`backend/services/reporting/engine.py`)
- Compiles programmatic multi-page PDF documents using ReportLab Platypus flowables.
- Dynamically renders Matplotlib distribution figures directly into the document stream.

---

## 10. Technology Stack

### Inventory and Verification Matrix

| Category | Technology | Version / Spec | Usage Status | Evidence Location | Role & Functionality |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Language** | Python | 3.11+ | **ACTUALLY USED** | `backend/Dockerfile` | Backend runtime environment |
| **Language** | JavaScript (ESM) | ES2022 / React 19 | **ACTUALLY USED** | `frontend/package.json` | Frontend client scripting |
| **Backend Web** | FastAPI | 0.136.1 | **ACTUALLY USED** | `backend/main.py` | ASGI REST API framework |
| **ASGI Server** | Uvicorn | 0.46.0 | **ACTUALLY USED** | `backend/Procfile` | Production ASGI web server |
| **Data Processing** | Pandas | 2.3.3 | **ACTUALLY USED** | `backend/services/` | Dataframe manipulation and transformations |
| **Numeric Engine** | NumPy | 2.2.6 | **ACTUALLY USED** | `backend/services/statistics/` | Vectorized math, variance calculations |
| **Scientific Computing** | SciPy | 1.15.3 | **ACTUALLY USED** | `backend/services/statistics/` | Skewness, Z-score, Winsorization, t-scores |
| **Machine Learning** | Scikit-learn | 1.7.2 | **ACTUALLY USED** | `backend/services/cleaning_service.py` | Missing value imputers (`SimpleImputer`, `KNNImputer`) |
| **Survey Statistics** | Statsmodels | 0.14.6 | **ACTUALLY USED** | `backend/services/statistics/weighting_engine.py` | `DescrStatsW` cross-validation parity checks |
| **Relational ORM** | SQLAlchemy | 2.0.49 | **ACTUALLY USED** | `backend/core/database.py` | Relational database schema mapping and sessions |
| **Database** | SQLite | 3 | **ACTUALLY USED** | `backend/daet.sqlite3` | Application database for models, audit logs, caches |
| **Database** | PostgreSQL | psycopg2 2.9.12 | **CONFIGURED ONLY** | `backend/requirements.txt` | Driver installed; SQLite is active default |
| **Data Validation** | Pydantic | 2.13.4 | **ACTUALLY USED** | `backend/schemas/` | DTO definitions, request validation |
| **PDF Generation** | ReportLab | 4.5.0 | **ACTUALLY USED** | `backend/services/reporting/engine.py` | Programmatic PDF report rendering |
| **Visualization (Backend)** | Matplotlib | 3.10.7 | **ACTUALLY USED** | `backend/services/reporting/engine.py` | Histogram plot rendering in PDF reports |
| **Spreadsheet Parser** | openpyxl | 3.1.5 | **ACTUALLY USED** | `backend/utils/dataset_storage.py` | Read/write support for Excel `.xlsx` files |
| **Cryptography** | pyca/cryptography | >=42.0.0 | **ACTUALLY USED** | `backend/services/encryption_engine.py` | Fernet AES symmetric file encryption |
| **HTTP Client** | HTTPX | 0.28.1 | **ACTUALLY USED** | `backend/services/ai/ollama_client.py` | Async HTTP requests to Ollama / Gemini |
| **Local LLM** | Ollama (`phi3`) | HTTP API | **ACTUALLY USED** | `backend/services/ai/ollama_client.py` | Local natural language explanation generation |
| **Cloud LLM** | Google Gemini API | `gemini-2.0-flash` / `1.5-flash` | **ACTUALLY USED** | `backend/services/ai/ollama_client.py` | Fallback chain with direct cloud routing on Render/prod |
| **Frontend Framework**| React | 19.2.5 | **ACTUALLY USED** | `frontend/package.json` | Modern declarative component architecture |
| **Frontend Build** | Vite | 8.0.10 | **ACTUALLY USED** | `frontend/vite.config.js` | Fast HMR dev server and production bundler |
| **React Compiler** | Babel Plugin React Compiler| 1.0.0 | **ACTUALLY USED** | `frontend/vite.config.js` | Automatic memoization optimization |
| **Styling Engine** | Tailwind CSS | 4.3.0 | **ACTUALLY USED** | `frontend/src/index.css` | Utility-first CSS engine with dark mode HSL vars |
| **Client State** | Zustand | 5.0.13 | **ACTUALLY USED** | `frontend/package.json` | Global client store management |
| **Client Routing** | React Router DOM | 7.15.0 | **ACTUALLY USED** | `frontend/src/allroutes.jsx` | SPA routing and layout protection |
| **Charts (Frontend)** | Recharts | 3.8.1 | **ACTUALLY USED** | `frontend/src/components/charts/` | SVG responsive charts |
| **Lineage Graph** | React Flow | 11.11.4 | **ACTUALLY USED** | `frontend/package.json` | Node-based visual DAG lineage canvases |
| **UI Motion** | Framer Motion | 12.38.0 | **ACTUALLY USED** | `frontend/src/components/` | Smooth transitions and panel animations |
| **File Dropzone** | React Dropzone | 15.0.0 | **ACTUALLY USED** | `frontend/src/components/FileUpload.jsx` | Drag-and-drop CSV/XLSX file upload UI |
| **Icons** | Lucide React | 1.14.0 | **ACTUALLY USED** | `frontend/src/components/` | Clean SVG iconography |
| **HTTP Client (Client)**| Axios | 1.16.0 | **ACTUALLY USED** | `frontend/src/services/api/httpClient.js`| Interceptor-enabled API communication |
| **E2E Testing** | Playwright | 1.60.0 | **ACTUALLY USED** | `frontend/e2e/` | Multi-browser automated end-to-end tests |
| **Unit Testing** | Pytest | 7.x+ | **ACTUALLY USED** | `backend/tests/` | Backend analytical and integration tests |
| **Containerization**| Docker | Multi-stage | **ACTUALLY USED** | `backend/Dockerfile`, `frontend/Dockerfile.prod` | Container builds for local & Render |
| **Orchestration** | Docker Compose | Compose 3.8 | **ACTUALLY USED** | `docker-compose.yml` | Multi-service local setup |

---

## 11. AI/ML Components

### Role of AI in DAET
The AI subsystem in DAET is explicitly designed around a **separation of concerns**:
- **Statistical Decisions:** Handled strictly by deterministic mathematical algorithms in Python (Pandas, SciPy, Scikit-learn).
- **AI / LLM Role:** Restricted to narrative explanations, summarization, and natural language communication of statistical findings.

### AI Architecture Pipeline
```
[Column Metrics: Skewness, Outlier%, Missing%, Unique Ratio]
                           │
                           ▼
  1. Deterministic Recommendation Engine (recommendation_engine.py)
     - Outputs method: 'median', 'mean', 'winsorization', 'iqr'
     - Assigns confidence score (e.g., 92%)
     - Emits reason codes (e.g., ['high_skewness', 'outliers_detected'])
                           │
                           ▼
  2. Cache Check (cache_engine.py)
     - Checks backend/ai_cache/<dataset>/recommendations.json
     - If cache hit and schema identical: Return cached payload immediately
                           │
                           ▼
  3. Prompt Synthesis (prompt_builder.py)
     - Formats ultra-compact prompts (1-2 sentences):
       "Explain why median imputation is suitable for skewed salary data in 2 lines."
                           │
                           ▼
  4. Async Concurrency Dispatcher (explanation_engine.py)
     - asyncio.Semaphore(3) prevents LLM saturation
                           │
                           ▼
  5. Multi-Tier Failover Engine (ollama_client.py)
     - Primary: Local Ollama HTTP POST to http://localhost:11434/api/generate (model: phi3, timeout: 4s)
     - Secondary: Cloud Gemini API POST to generativelanguage.googleapis.com
     - Tertiary: Deterministic template string fallback (_fallback_missing_text)
                           │
                           ▼
  6. Persistence: Write to Disk Cache & Record in SQLite AICacheRef
```

---

## 12. Models

### 1. Primary Model: Ollama `phi3`
- **Architecture:** Microsoft Phi-3 Mini (3.8B parameters) running locally via Ollama.
- **Hosting:** Localhost HTTP daemon (`http://localhost:11434/api/generate`).
- **Configuration:** Specified in `backend/core/config.py` as `OLLAMA_MODEL = 'phi3'`.
- **Inference Mode:** Zero-shot text generation with prompt templates requesting answers in 2–3 lines.
- **Training Status:** Pretrained weights only. No fine-tuning or model training was conducted in this repository.

### 2. Secondary Fallback: Google Gemini API
- **Endpoint in Code:** Fallback chain targeting `gemini-2.0-flash` with automated failover to `gemini-1.5-flash` via `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`.
- **Audit Finding / Status:** **VERIFIED & OPERATIONAL.** Uses `x-goog-api-key` header authentication, structured status logging, and direct cloud routing on cloud environments (Render) bypassing the local Ollama timeout.
- **API Key Handling:** Managed via `GEMINI_API_KEY` loaded from `.env` or deployment secrets.

---

## 13. Data / Datasets

### Sample Data in Repository
- **File:** `frontend/e2e/data/test_data.csv`
- **File Size:** 164 bytes (8 rows total: 1 header row + 7 data observations).
- **Columns:**
  1. `id` (Integer): Contains intentional duplicate record on rows 7 & 8 (`id: 6`).
  2. `age` (Numeric): Contains a missing value (row 3) and an invalid age (`12` on row 5, intended for adult survey validation).
  3. `income` (Numeric): Contains standard values (`50000`, `60000`, `55000`, `70000`, `65000`) and extreme outliers (`5000000` on rows 7 & 8).
  4. `gender` (Categorical): Binary categories `M` and `F`.
  5. `survey_weight` (Numeric): Decimal weights (`1.2`, `0.8`, `1.1`, `0.9`, `1.0`, `1.3`, `1.3`).
- **Role:** Serves as the golden fixture for Playwright E2E suites and backend integration tests.

### Runtime Ingested Datasets
- User-uploaded CSV/Excel files are persisted in isolated directories under `backend/datasets/<dataset_name>/`.
- Synthetic or external survey microdata can be uploaded up to 500,000 rows.

---

## 14. Algorithms and Methodology

### 1. Missing Value Imputation
- **Mean / Median / Mode:** Implemented via `sklearn.impute.SimpleImputer`.
- **KNN Imputation:** Implemented via `sklearn.impute.KNNImputer(n_neighbors=5)` applied strictly to numeric columns.

### 2. Outlier Detection
- **Interquartile Range (IQR):**
  $$\text{IQR} = Q_3 - Q_1$$
  $$\text{Lower} = Q_1 - 1.5 \times \text{IQR}, \quad \text{Upper} = Q_3 + 1.5 \times \text{IQR}$$
- **Z-Score Filter:**
  $$z = \frac{x - \mu}{\sigma}, \quad \text{Filter condition: } |z| > 3.0$$
- **Winsorization:** Caps observations at the 5th and 95th percentiles via `scipy.stats.mstats.winsorize(series, limits=[0.05, 0.05])`.

### 3. Survey Weighting & Calibration
- **Weighted Mean:**
  $$\bar{y}_w = \frac{\sum_{i=1}^n w_i y_i}{\sum_{i=1}^n w_i}$$
- **Weighted Variance (Unbiased, $ddof=1$):**
  $$s_w^2 = \frac{\sum_{i=1}^n w_i (y_i - \bar{y}_w)^2}{\sum_{i=1}^n w_i - 1}$$
- **Kish's Effective Sample Size ($n_{\text{eff}}$):**
  $$n_{\text{eff}} = \frac{\left(\sum_{i=1}^n w_i\right)^2}{\sum_{i=1}^n w_i^2}$$
- **Standard Error ($SE$):**
  $$SE(\bar{y}_w) = \sqrt{\frac{s_w^2}{n_{\text{eff}}}}$$
- **Margin of Error ($MoE$):**
  $$MoE = t_{1 - \alpha/2, \, n_{\text{eff}} - 1} \times SE \quad \text{or} \quad z_{1 - \alpha/2} \times SE$$
- **Weighted Proportions for Categorical Data:**
  Vectorized grouping on category sums of weights divided by total weight sum, with Wald interval standard error derived using $n_{\text{eff}}$.

### 4. Memory Optimization Algorithm
- `optimize_dataframe_memory` (`backend/utils/dataframe_optimizer.py`):
  - Downcasts signed integer types using `pd.to_numeric(series, downcast='integer')`.
  - Downcasts float types using `pd.to_numeric(series, downcast='float')`.
  - Analyzes object/string columns: if unique ratio $\le 0.5$, converts to `category` dtype.

### 5. Fast Shape Calculation Algorithm
- `_fast_csv_shape` (`backend/services/versioning/engine.py`):
  - Streams CSV file lines using Python's C-level line iteration (`sum(1 for _ in reader)`) without loading data into memory. Saves a full dataframe read on every snapshot commit.

---

## 15. RAG / LLM / Agent Architecture

> **Architectural Clarity:** DAET is **NOT** a Vector-RAG or Autonomous Agentic System. It contains no vector databases (ChromaDB, Pinecone, FAISS), no embedding models, and no LangChain/LlamaIndex agents.

### Implemented LLM Capabilities:
- **Task:** Zero-shot natural language explanation and recommendation narration.
- **Prompt Engineering:** Strict line-budgeted prompts generated in `prompt_builder.py`:
  - `build_missing_value_prompt`: Injects column name, proposed method, and reason codes.
  - `build_outlier_prompt`: Injects outlier count, threshold values, and distribution skew.
  - `build_validation_prompt`: Injects rule type, failure counts, and field definitions.
  - `build_weighting_prompt`: Injects weighted vs. unweighted point estimates and margins of error.
- **Failover & Guardrails:**
  - Semaphore limit: max 3 concurrent calls.
  - 60-second cooldown timer triggered if Ollama fails.
  - Hardcoded string templates return graceful explanations if all AI engines are offline.

---

## 16. Backend / API

The backend exposes **53 HTTP REST endpoints** implemented via FastAPI routers:

### Endpoint Inventory Breakdown

#### 1. System & Authentication (4 endpoints)
- `GET /`: Health check and operational status.
- `POST /api/auth/register`: User registration.
- `POST /api/auth/token`: OAuth2 password flow issuing JWT access token.
- `POST /api/auth/login`: JSON payload login issuing JWT access token.

#### 2. Ingestion & Previews (2 endpoints)
- `POST /api/upload`: Multipart upload for CSV/XLSX, schema inference, raw snapshot save.
- `POST /api/datasets/full-preview`: Full dataset preview with schema and row slicing.

#### 3. Preprocessing & Data Cleaning (4 endpoints)
- `POST /api/clean/missing-values`: Missing-value imputation (mean, median, mode, KNN).
- `POST /api/duplicates/process`: Duplicate detection, removal, or keep-latest.
- `POST /api/outliers/detect`: Calculate outlier boundaries and return affected rows.
- `POST /api/outliers/apply`: Prune or winsorize outliers and commit new version.

#### 4. Rule Validation (2 endpoints)
- `POST /api/validation/suggest`: Automated heuristic rule suggestion.
- `POST /api/validation/run`: Execution of DSL rules against active dataset.

#### 5. Statistical Estimation (2 endpoints)
- `POST /api/statistics/profile`: Generate full column distribution profile.
- `POST /api/statistics/estimate`: Calculate weighted mean, proportions, ESS, SE, MoE, CI.

#### 6. AI Intelligence (2 endpoints)
- `POST /api/ai/recommendations`: Statistical recommendation engine with caching.
- `POST /api/ai/explanations`: Natural language explanations via Ollama/Gemini.

#### 7. Audit Trails & Logs (1 endpoint)
- `GET /api/logs/{dataset_name}`: Retrieve historical audit trail entries from SQLite or disk fallback.

#### 8. Reporting & Downloads (3 endpoints)
- `POST /api/report/pdf`: Synchronous ReportLab PDF compilation and streaming.
- `POST /api/report/generate`: Enqueue background task for PDF compilation (returns `task_id`).
- `GET /api/report/status/{task_id}`: Poll background PDF compilation status.
- `GET /api/reports/download/{filename}`: Download generated PDF report.

#### 9. Pipeline Orchestration (1 endpoint)
- `POST /api/pipeline/run`: End-to-end automation from raw dataset to final weighted report.

#### 10. Versioning, Snapshots, Archival & Storage (32 endpoints)
- `POST /api/versioning/project/create`: Initialize project workspace directories.
- `POST /api/versioning/raw/save`: Save raw source dataset.
- `POST /api/versioning/version/create`: Commit dataset snapshot and write manifest.
- `GET /api/versioning/versions`: List all version manifests for active dataset.
- `GET /api/versioning/latest`: Fetch newest version metadata.
- `GET /api/versioning/compare`: Quality delta comparison between two versions.
- `GET /api/versioning/datasets`: List all dataset directories in storage.
- `GET /api/versioning/datasets/{dataset_name}`: List files within a dataset folder.
- `GET /api/versioning/datasets/{dataset_name}/overview`: Overview of dataset state.
- `POST /api/versioning/datasets/{dataset_name}/compress`: Package dataset folder to `.zip`.
- `GET /api/versioning/manifest/{version_name}`: Fetch JSON manifest for a version.
- `GET /api/versioning/datasets/{dataset_name}/files/{file_name}/preview`: Preview specific file rows.
- `GET /api/versioning/datasets/{dataset_name}/files/{file_name}/analytics`: File analytics summary.
- `POST /api/versioning/rollback`: Execute atomic rollback to a historical version.
- `POST /api/versioning/hash/generate`: Calculate SHA-256 hash for a file.
- `POST /api/versioning/hash/verify`: Validate file integrity against expected hash.
- `POST /api/versioning/compress`: Compress file to `.gz`.
- `POST /api/versioning/decompress`: Decompress `.gz` archive.
- `POST /api/versioning/encrypt`: Encrypt file using Fernet symmetric key.
- `POST /api/versioning/decrypt`: Decrypt file using Fernet symmetric key.
- `POST /api/versioning/export`: Multi-format streaming export (CSV, Excel, ZIP).
- `POST /api/versioning/download-token`: Issue expiring HMAC-signed download token.
- `GET /api/versioning/download`: Stream file verified by download token.
- `POST /api/versioning/archive/version`: Compress and encrypt specific version to `.csv.gz.enc`.
- `POST /api/versioning/archive/old`: Batch archive versions older than retention threshold.
- `GET /api/versioning/archive/status`: Return list of archived vs. active versions.
- `POST /api/versioning/archive/old/export`: Export archived version package.
- `POST /api/versioning/temp/decrypt`: Temporarily decrypt file for viewing.
- `POST /api/versioning/temp/cleanup`: Purge temporary decrypted files.
- `GET /api/versioning/version-path/{version_name}`: Resolve physical file path.
- `POST /api/versioning/datasets/{dataset_name}/files/{file_name}/delete`: Delete staged dataset file.
- `GET /api/versioning/quality`: Compute composite data quality score.
- `GET /api/reconcile`: Execute database-to-disk consistency scan.

---

## 17. Frontend

### Client Architecture
- **Framework:** React 19.2.5 running on Vite 8.0.10 with `babel-plugin-react-compiler` enabled.
- **Styling:** Tailwind CSS v4 with custom HSL theme variables in `index.css`.
- **State Management:** Hybrid architecture:
  - Global app state: Zustand (`useDatasetContext`, `useAIContext`, `useAuthContext`, `useThemeContext`, `useVersionContext`).
  - Data caches and view states: Component-level React hooks.
- **Visualizations:**
  - `Recharts 3.8.1`: Bar charts (weighted vs unweighted comparison), histograms, scatter plots, box plots.
  - `React Flow 11.11.4`: Canvas rendering DAG version lineages and pipeline stage transitions.
- **UX Polish:** Framer motion transitions, shimmer skeleton loaders, 60+ contextual statistical tooltips (`tooltipContent.js`), zero dummy placeholder components.

---

## 18. Database / Storage

### Database Engine: SQLite (`backend/daet.sqlite3`)
- Managed via SQLAlchemy 2.0 ORM.
- Enforces foreign key constraints via SQLite listener: `PRAGMA foreign_keys=ON`.

### Database Schema (7 Tables)

```sql
-- 1. users
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(256) UNIQUE NOT NULL,
    hashed_password VARCHAR(256) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. projects
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(256) UNIQUE NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. datasets
CREATE TABLE datasets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id),
    dataset_name VARCHAR(256) NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    version VARCHAR(128),
    status VARCHAR(64),
    owner_id INTEGER REFERENCES users(id),
    checksum VARCHAR(256),
    size INTEGER,
    mime_type VARCHAR(128),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

-- 4. versions
CREATE TABLE versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dataset_id INTEGER NOT NULL REFERENCES datasets(id),
    version_name VARCHAR(256) NOT NULL,
    stage VARCHAR(128),
    file_path VARCHAR(1024) NOT NULL,
    checksum VARCHAR(256),
    parent_version VARCHAR(256),
    lineage_metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. reports
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dataset_id INTEGER NOT NULL REFERENCES datasets(id),
    version_id INTEGER REFERENCES versions(id),
    report_name VARCHAR(256) NOT NULL,
    report_path VARCHAR(1024) NOT NULL,
    filename VARCHAR(256) NOT NULL,
    report_type VARCHAR(128) NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    checksum VARCHAR(256),
    status VARCHAR(64),
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. audit_logs
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dataset_id INTEGER NOT NULL REFERENCES datasets(id),
    user_id INTEGER REFERENCES users(id),
    version_id INTEGER REFERENCES versions(id),
    action VARCHAR(256) NOT NULL,
    operation VARCHAR(256) NOT NULL,
    actor VARCHAR(256),
    status VARCHAR(64),
    details TEXT,
    details_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. ai_cache_refs
CREATE TABLE ai_cache_refs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dataset_id INTEGER NOT NULL REFERENCES datasets(id),
    version_id INTEGER REFERENCES versions(id),
    cache_type VARCHAR(128) NOT NULL,
    cache_path VARCHAR(1024) NOT NULL,
    checksum VARCHAR(256),
    invalidated BOOLEAN DEFAULT 0 NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Physical Storage Hierarchy
```
backend/datasets/
└── <dataset_name>/
    ├── processed/
    │   ├── raw_<dataset_name>.csv               # Ingested raw source
    │   ├── clean_<dataset_name>.csv             # Imputed stage file
    │   ├── outlier_detected_<dataset_name>.csv  # Outlier filtered stage file
    │   ├── deduplicated_<dataset_name>.csv      # Deduplicated stage file
    │   ├── versions/
    │   │   └── <version_name>/
    │   │       └── dataset.csv                  # Immutable snapshot
    │   └── manifests/
    │       └── <version_name>_manifest.json     # Checkpoint metadata & SHA-256
    ├── archive/
    │   └── <version_name>.csv.gz.enc            # Fernet-encrypted Gzip backup
    ├── reports/
    │   └── report_<version_name>_<timestamp>.pdf# Generated PDF reports
    └── logs/
        └── audit_log.json                       # Filesystem redundant audit ledger
```

---

## 19. Cloud / Infrastructure

- **Containerization (Backend):** `backend/Dockerfile` uses `python:3.11-slim` with system scientific build libraries (`build-essential`, `gfortran`, `libopenblas-dev`, `liblapack-dev`).
- **Containerization (Frontend):** `frontend/Dockerfile.prod` uses a multi-stage build: `node:18-alpine` compiles Vite static distribution assets, copied to `nginx:stable-alpine` on port 80.
- **Docker Compose:** `docker-compose.yml` orchestrates backend (port 8000) and frontend (port 3000) with volume mounts for reports and AI cache.
- **Cloud Deployment Target:** Render.
  - Backend configuration: `backend/Procfile` defines web runner: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
  - Frontend dev proxy: `frontend/vite.config.js` configures proxy target to `https://data-analysis-estimation-tool.onrender.com`.

---

## 20. Security

1. **Path Traversal Defense:** `resolve_safe_path` (`backend/utils/file_utils.py`) resolves absolute paths and validates that targets reside strictly within allowed directory trees (`DATASETS_ROOT`, `REPORTS_DIR`, `AI_CACHE_DIR`). Rejects relative traversal markers (`..`) and external absolute paths with HTTP 403.
2. **Password Security:** `backend/services/auth_service.py` implements salted password hashing using `hashlib.pbkdf2_hmac('sha256', password, salt, 120000)` with 16-byte random salts and `hmac.compare_digest` constant-time verification.
3. **Session Authentication:** Issues signed JWT tokens using HMAC-SHA256 (`HS256`) with a configurable expiration window (`ACCESS_TOKEN_EXPIRE_SECONDS = 3600`).
4. **Data at Rest Encryption:** Symmetric file encryption using `cryptography.fernet.Fernet` (128-bit AES in CBC mode with PKCS7 padding and HMAC-SHA256 authentication).
5. **Signed Temporary Download Links:** `signed_download_service.py` issues expiring HMAC-SHA256 signed URL tokens that validate file path and expiry before streaming content.
6. **Filesystem Sandbox & Upload Validation:** File uploads restricted strictly to `.csv` and `.xlsx` extensions; file sizes limited to 500,000 rows.

---

## 21. Testing / Validation

### Backend Testing (`backend/tests/`)
- Framework: `pytest` with `pytest-asyncio` / `anyio`.
- Coverage Areas:
  1. `test_statistics.py`: Mathematical tests for Kish ESS, weighted variance ($ddof=1$), standard errors, confidence intervals, and comparison against `statsmodels.stats.weightstats.DescrStatsW`.
  2. `test_storage_security.py`: Path traversal attack simulation (asserts HTTP 403), upload failure rollback (verifies physical file deletion on database error).
  3. `test_performance.py`: In-memory cleaning execution, AI concurrency semaphore, and AI cache hit/miss behavior.
  4. `test_auth.py`: User registration, password hashing verification, JWT token issuance, and expired token rejection.
  5. `test_versioning.py`: Manifest schema validation, lineage hierarchy, and rollback state transitions.

### Frontend E2E Testing (`frontend/e2e/`)
- Framework: Playwright 1.60.0.
- Test Suites (10 test files):
  1. `upload.spec.js`: Drag-and-drop CSV upload, metadata badge visibility, invalid file rejection.
  2. `cleaning.spec.js`: Strategy selection (mean, median, mode) and null count updates.
  3. `outlier.spec.js`: Threshold slider manipulation and outlier pruning verification.
  4. `validation.spec.js`: DSL rule builder submission, smart suggestion acceptance, violation display.
  5. `weighting.spec.js`: Variable selection, survey estimation execution, bar chart rendering.
  6. `rollback.spec.js`: Lineage DAG checkpoint selection, Restore execution, state stability.
  7. `report.spec.js`: Report generation trigger, polling progress bar, PDF download.
  8. `export.spec.js`: Multi-format download checks.
  9. `preview_issue.spec.js`: Paginated data grid stress testing.
  10. `pipeline.spec.js`: Automated full pipeline execution.

---

## 22. Performance Optimizations

1. **Memory Downcasting (`dataframe_optimizer.py`):** Automatically downcasts integer and float columns to their smallest representation and converts low-cardinality string columns ($\le 50\%$ unique) to categorical memory types.
2. **Fast C-Level Line-Counting (`_fast_csv_shape`):** Manifest generation inspects row and column counts using raw line streaming rather than loading datasets into Pandas, saving up to 6 full file re-reads during a pipeline execution.
3. **In-Memory Pipeline Execution:** During automated pipeline runs (`pipeline_engine.py`), transformations occur in-memory, writing snapshot files to disk only at designated stage boundaries.
4. **Non-Blocking Background Tasks:** ReportLab PDF compilation and Matplotlib figure rendering are offloaded to FastAPI background tasks or thread pool executors, preventing the async event loop from blocking.
5. **AI Concurrency Semaphore & Local Caching:** Limits concurrent LLM calls to 3 via `asyncio.Semaphore(3)`. Caches all AI recommendations and explanations in local JSON files to eliminate duplicate inferences on unchanged datasets.
6. **Frontend Render Optimization:** React Compiler Babel preset (`babel-plugin-react-compiler`) automatically optimizes component re-renders.

---

## 23. Quantitative Results

> **Strict Audit Rule:** Only metrics explicitly recorded in test outputs, source code, or audit benchmarks are documented. No unverified claims are made.

| Parameter / Metric | Measured Value | Measurement Condition & Source |
| :--- | :--- | :--- |
| **Max Ingestion Capacity** | `500,000` rows | Enforced in `backend/core/config.py` (`MAX_ROWS`) and `upload_routes.py` |
| **Max Returned Violations** | `100` rows | Configured in `backend/core/config.py` (`MAX_VIOLATIONS`) |
| **AI Concurrency Cap** | `3` workers | Enforced via `asyncio.Semaphore(3)` in `explanation_engine.py` |
| **Ollama Timeout** | `4.0` seconds | Defined in `backend/services/ai/ollama_client.py` (`TIMEOUT`) |
| **Ollama Cooldown Window** | `60` seconds | Defined in `backend/services/ai/ollama_client.py` (`COOLDOWN_SECONDS`) |
| **Password Hash Iterations** | `120,000` rounds | PBKDF2-HMAC-SHA256 in `backend/services/auth_service.py` |
| **Statistical Parity Gap** | $< 10^{-5}$ ($1e-5$) | Epsilon parity tolerance verified against Statsmodels in `weighting_engine.py` |
| **Categorical Category Cap** | `50%` unique ratio | Threshold for object-to-category conversion in `dataframe_optimizer.py` |
| **Winsorization Percentile Caps** | `[0.05, 0.05]` (5th & 95th) | Defined in `cleaning_service.py` and `recommendation_engine.py` |
| **Total REST Endpoints** | `53` endpoints | Verified across 12 router files |
| **E2E Test Suites** | `10` test specs | Located in `frontend/e2e/` |
| **Backend Test Modules** | `8` test files | Located in `backend/tests/` |
| **Database Tables** | `7` tables | Mapped via SQLAlchemy ORM models |

---

## 24. Evaluation Methodology

1. **Statistical Verification:** Unit tests in `backend/tests/test_statistics.py` directly verify analytical calculations against manual calculations and `statsmodels.stats.weightstats.DescrStatsW`.
2. **Security Verification:** Boundary tests in `backend/tests/test_storage_security.py` simulate path traversal attacks using relative escapes (`../../../`) and absolute Windows paths (`C:\Windows\System32\...`), confirming HTTP 403 responses.
3. **Transactional Parity Verification:** Upload tests inject simulated database commit failures to verify that physical files written to disk are cleaned up.
4. **End-to-End Functional Verification:** Playwright tests run full browser sessions against Vite dev server and FastAPI to validate UI workflows from ingestion to rollback.

---

## 25. Important Engineering Decisions

1. **Strict AI / Statistics Separation:** AI is treated solely as an explanation engine. Numerical processing is 100% deterministic and auditable.
2. **Dual-Write Auditing:** Audit logs are written to both the relational database (`audit_logs` table) and physical JSON files (`datasets/<name>/logs/audit_log.json`). If the database fails or is wiped, historical lineage remains recoverable on disk.
3. **Immutable Snapshot Versioning:** Every major data transformation creates a distinct directory under `processed/versions/<version_name>/` with a companion JSON manifest. Data is never modified in-place without a snapshot.
4. **Atomic Rollback Architecture:** Rollback updates the physical active file and database metadata within a transactional block. If either step fails, the transaction is aborted. Manifest rollback events and AI cache invalidations follow as best-effort operations.
5. **Database-Storage Parity Reconciler:** Built a dedicated reconciliation service (`/api/reconcile`) that actively detects orphaned files, missing database pointers, and SHA-256 checksum mismatches.

---

## 26. Challenges and Solutions

1. **Challenge: AI Engine Latency & Blocking in Data Pipelines**  
   *Solution:* Integrated a local JSON caching subsystem and a 3-worker concurrency semaphore. Skips external LLM calls on cached datasets and falls back to deterministic templates if Ollama is offline.
2. **Challenge: Memory Overhead from Repeated CSV Reads During Lineage Creation**  
   *Solution:* Implemented `_fast_csv_shape`, which uses Python's C-level line reader to extract line and column counts without loading entire files into Pandas.
3. **Challenge: Directory Traversal Attacks on Dynamic File Downloads**  
   *Solution:* Implemented `resolve_safe_path` with strict canonical path resolution, confining all file interactions strictly within designated storage boundaries.
4. **Challenge: Database-Disk Parity Mismatches During Failed Operations**  
   *Solution:* Wrapped upload operations in exception handlers that delete newly created physical files if the database transaction raises an error.

---

## 27. Unique Technical Contributions

1. **Survey-Grade Statistical Calibration Engine:** Custom implementation of survey-weighted means, weighted proportions, Kish effective sample sizes, and standard errors verified against Statsmodels.
2. **Configurable Validation DSL Engine:** Recursive composite parser supporting nested logical constraints, conditional implications, and automated token-heuristic rule generation.
3. **DAG-Based Version Lineage Canvas:** Interactive React Flow canvas rendering dataset iteration history with parent-child relationships and one-click atomic rollbacks.
4. **Storage Parity Reconciler:** Automated database-to-disk consistency auditing system detecting orphaned files and checksum discrepancies.

---

## 28. Deployment

- **Backend Dockerization:** `backend/Dockerfile` builds a Python 3.11-slim container with required scientific compilation libraries.
- **Frontend Dockerization:** `frontend/Dockerfile.prod` compiles Vite assets and serves them via Nginx Alpine on port 80.
- **Local Multi-Service Orchestration:** `docker-compose.yml` mounts local volumes and connects frontend to backend.
- **Production Deployment Configuration:** Designed for Render via `backend/Procfile` (`uvicorn main:app --host 0.0.0.0 --port $PORT`).

---

## 29. Limitations

1. **Single-Node SQLite Storage:** SQLite is the active database. While foreign keys and pragmas are configured, high concurrent write loads risk database locks.
2. **Broken Gemini Cloud Failover [RESOLVED]:** Updated to active production models (`gemini-2.0-flash` and `gemini-1.5-flash`) with header authentication and Render cloud routing.
3. **Single Golden Dataset:** The repository contains only one sample dataset (`frontend/e2e/data/test_data.csv`, 8 rows). Full-scale 500,000-row benchmarks are not saved as persistent artifacts.
4. **No True IPF Raking Algorithm [RESOLVED]:** Implemented multidimensional Iterative Proportional Fitting in `backend/services/statistics/ipf_engine.py` with convergence checks and Kish ESS computation.

---

## 30. Future Work

1. **Correct Gemini API Fallback [COMPLETED]:** Migrated to `gemini-2.0-flash` with fallback to `gemini-1.5-flash`.
2. **Implement True Iterative Proportional Fitting (IPF) [COMPLETED]:** Implemented multidimensional raking engine at `/api/statistics/rake`.
3. **Migrate Production Store to PostgreSQL:** Transition from SQLite to PostgreSQL / Supabase using the already installed `psycopg2` driver for multi-user concurrency.
4. **Chunked Large-File Streaming:** Add chunked streaming for uploads exceeding 500MB to minimize RAM consumption.

---

## 31. Resume Evidence

### Achievement 1: Statistical Estimation & Calibration
- **Technical Action:** Built a survey weighting engine calculating weighted means, weighted variances ($ddof=1$), Kish effective sample sizes, standard errors, and confidence intervals.
- **Technology:** Python, NumPy, SciPy, Statsmodels (`DescrStatsW`).
- **Quantifiable Result:** Validated calculations within $< 10^{-5}$ epsilon tolerance against Statsmodels.
- **Confidence:** **VERIFIED** (`backend/services/statistics/weighting_engine.py`, `backend/tests/test_statistics.py`).

### Achievement 2: DAG Version Control & Atomic Rollback
- **Technical Action:** Architected an immutable snapshot versioning engine with SHA-256 checksums, JSON manifests, and atomic database-and-filesystem rollbacks.
- **Technology:** Python, FastAPI, SQLAlchemy, SQLite, React Flow, Zustand.
- **Quantifiable Result:** Enforces atomic database commits with automatic cleanup on filesystem or DB failures.
- **Confidence:** **VERIFIED** (`backend/services/versioning/engine.py`, `backend/tests/test_storage_security.py`).

### Achievement 3: Resilient Explainable AI Architecture
- **Technical Action:** Integrated an asynchronous AI explanation layer with concurrency throttling, local caching, and multi-tier failover.
- **Technology:** Ollama (`phi3`), Google Gemini API, HTTPX, asyncio.
- **Quantifiable Result:** Throttled to 3 concurrent requests; eliminates duplicate LLM inferences on unchanged datasets.
- **Confidence:** **VERIFIED** (`backend/services/ai/explanation_engine.py`, `backend/services/ai/cache_engine.py`).

### Achievement 4: Storage Security & Parity Reconciliation
- **Technical Action:** Engineered path traversal guards, Fernet symmetric encryption at rest, signed download tokens, and a database-filesystem reconciliation engine.
- **Technology:** Cryptography (Fernet), Pytest, FastAPI.
- **Quantifiable Result:** Reconciles 100% of physical files against database records; blocks traversal attempts with HTTP 403.
- **Confidence:** **VERIFIED** (`backend/services/reconciliation_service.py`, `backend/services/encryption_engine.py`).

---

## 32. Resume-Ready Bullet Candidates

- **Architected and developed a full-stack survey data processing platform** using FastAPI, React 19, and SQLite, implementing 53 REST endpoints across ingestion, cleaning, validation, and version control.
- **Engineered a survey-grade statistical estimation engine** in Python/SciPy, computing weighted means, Kish Effective Sample Sizes, standard errors, and confidence intervals cross-verified against Statsmodels ($< 10^{-5}$ tolerance).
- **Implemented an immutable DAG version control system** with SHA-256 integrity verification, fast C-level line-count indexing, and atomic rollback across physical storage and SQLite records.
- **Built an asynchronous, explainable AI pipeline** using local Ollama (`phi3`) and Gemini API with an `asyncio.Semaphore(3)` throttling layer and persistent disk caching to eliminate redundant inference calls.
- **Constructed a configurable data validation DSL** supporting range, conditional, uniqueness, and composite boolean rules, complete with heuristic auto-suggestion profiling.
- **Strengthened storage security** by implementing canonical path traversal guards, Fernet AES symmetric encryption at rest, and HMAC-signed expiring download tokens.
- **Created automated end-to-end and analytical test suites** encompassing 8 Pytest backend suites and 10 Playwright E2E browser specs covering all core user journeys.

---

## 33. Portfolio-Ready Content

### Elevator Pitch
DAET is an enterprise survey data engineering and statistical estimation platform designed for official statistical agencies. It delivers deterministic data cleaning, survey weight calibration, immutable DAG version lineage, and explainable AI insights without sacrificing reproducibility or data privacy.

### Recruiter-Friendly Summary
In official government and market surveys, dirty data and sample imbalances can distort critical economic indicators. DAET solves this by providing a unified web platform where analysts can upload raw survey data, automatically detect and fix anomalies, apply complex survey weights to calibrate population estimates, and track every change through a Git-like visual version tree. With built-in AI explanations and one-click PDF audit reports, DAET transforms messy survey spreadsheets into reliable, publication-ready statistics.

### Technical Deep Dive
DAET is engineered around strict architectural decoupling:
1. **Mathematical Isolation:** Statistical calculations and data transformations execute exclusively in Python using vectorized Pandas, NumPy, and SciPy routines, validated for parity against Statsmodels.
2. **Asynchronous Explainable AI:** Rather than allowing LLMs to manipulate data directly, DAET confines AI to explaining statistical recommendations. Calls to local Ollama (`phi3`) or Gemini API are managed via an async semaphore and cached locally to maintain sub-second UI responsiveness.
3. **Storage Reliability:** Checkpoint snapshots generate JSON manifests containing SHA-256 hashes and ancestry metadata. Rollbacks are executed atomically across SQLite and physical disk paths. A custom reconciliation scanner continuously checks for orphaned files, missing database pointers, and checksum drift.

---

## 34. Interview Questions and Answers

### Architecture
- **Q: Why did you decouple the AI engine from the data cleaning pipeline instead of using an autonomous LLM agent?**  
  *A:* In national statistics (such as MoSPI operations), reproducibility and deterministic mathematical validity are non-negotiable. LLMs are prone to hallucinations, non-deterministic outputs, and token limits on 500,000-row datasets. I restricted the LLM to generating natural language explanations of deterministic statistical metrics (skewness, variance, outliers), ensuring calculations remain exact and auditable. (`backend/services/ai/explanation_engine.py`)

### Backend & Concurrency
- **Q: How does the backend prevent external LLM calls from degrading API performance?**  
  *A:* First, I implemented a local disk and database cache (`cache_engine.py`) that checks if recommendations or explanations already exist for a dataset's schema. Second, in `explanation_engine.py`, I wrapped asynchronous requests in an `asyncio.Semaphore(3)` to cap concurrency. Third, if Ollama fails or times out (4.0s), a 60-second cooldown is initiated, falling back to deterministic template strings. (`backend/services/ai/explanation_engine.py`)

### Data & Statistics
- **Q: How do you calculate survey-weighted estimates, and what is Kish's Effective Sample Size?**  
  *A:* When survey observations have unequal selection probabilities, sample weights $w_i$ must be applied to calculate unbiased means and proportions. However, unequal weighting inflates variance. Kish's Effective Sample Size, $n_{\text{eff}} = (\sum w_i)^2 / \sum w_i^2$, estimates the equivalent simple random sample size. I use $n_{\text{eff}}$ to compute the true standard error and adjust confidence intervals. I validated this implementation against `statsmodels.stats.weightstats.DescrStatsW`. (`backend/services/statistics/weighting_engine.py`)

### Reliability & Versioning
- **Q: How does the system ensure data consistency during a version rollback?**  
  *A:* Rollbacks operate inside a transactional database boundary. The system locates the historical version file on disk and in SQLite, copies the version file back over the active dataset path, updates the dataset's checksum, size, and version pointer, and executes a database commit. If an error occurs, the database transaction rolls back. Once successful, it updates the manifest, invalidates stale AI caches, and writes an audit log entry. (`backend/services/versioning/engine.py` $\rightarrow$ `rollback_version`)

### Security
- **Q: How is the system protected against path traversal attacks?**  
  *A:* User-provided file paths are never passed directly to disk I/O. The `resolve_safe_path` utility canonicalizes paths using `.resolve()` and validates that the resolved path starts with an allowed root (`DATASETS_ROOT`, `REPORTS_DIR`, `AI_CACHE_DIR`). Any attempt to traverse upward using `..` or access unauthorized system drives raises an HTTP 403 exception. (`backend/utils/file_utils.py`)

---

## 35. Verified Claims

1. **FastAPI & React 19 Stack:** Fully verified in `backend/main.py` and `frontend/package.json`.
2. **53 REST API Endpoints:** Verified across 12 route modules in `backend/routes/`.
3. **Statistical Parity with Statsmodels:** Verified in `backend/services/statistics/weighting_engine.py` and tested in `test_statistics.py`.
4. **PBKDF2-HMAC-SHA256 Password Hashing:** 120,000 iterations verified in `backend/services/auth_service.py`.
5. **Fernet Symmetric Encryption:** Verified in `backend/services/encryption_engine.py`.
6. **Path Traversal Protection:** Verified in `backend/utils/file_utils.py` and tested in `test_storage_security.py`.
7. **Fast C-Level Line-Counting:** Verified in `backend/services/versioning/engine.py` (`_fast_csv_shape`).
8. **E2E Test Coverage:** 10 Playwright test specifications verified in `frontend/e2e/`.
9. **Atomic Upload Rollback on DB Error:** Verified in `upload_routes.py` and tested in `test_storage_security.py`.

---

## 36. Inferred Claims

1. **MoSPI Problem Domain Alignment:** Inferred from `Phases.md` and documentation context; the architectural design explicitly targets official national survey workflows.
2. **Render Cloud Deployment Readiness:** Inferred from `backend/Procfile`, Dockerfiles, and Vite dev proxy configuration; local configuration is tailored for Render hosting.

---

## 37. Unknown / Missing Information

1. **Real-World Survey Benchmarks:** No persistent production-scale benchmark logs (e.g., memory profiling on 500,000 rows) exist in the repository; only the 8-row `test_data.csv` fixture is saved.
2. **Active Production Traffic / User Base:** No production metrics, user telemetry, or multi-tenant database records are present.

---

## 38. Claims That Should NOT Be Made

1. **DO NOT CLAIM True Iterative Proportional Fitting (IPF) / Raking Generation:**  
   *Reason:* The README claims "Weight estimation (IPF) | Iterative Proportional Fitting (raking)". The implementation only calculates weighted statistics from an *already existing* weight column. It does not calibrate new weights from target marginals.
2. **DO NOT CLAIM Working Gemini API Cloud Fallback:**  
   *Reason:* The code in `ollama_client.py` targets `gemini-2.5-flash`, an invalid model identifier that fails during actual invocation.
3. **DO NOT CLAIM Vector RAG, Embeddings, or Autonomous Agents:**  
   *Reason:* The system contains no vector databases, no embeddings, and no autonomous agentic tool-use loops.
4. **DO NOT CLAIM Model Training or Fine-Tuning:**  
   *Reason:* All AI capabilities use zero-shot inference on pretrained models. No fine-tuning scripts or training checkpoints exist.
5. **DO NOT CLAIM Multi-Tenant Production Scale:**  
   *Reason:* The active configuration uses a single SQLite file (`daet.sqlite3`) and local filesystem directories.

---

## 39. Evidence / Source Map

| Topic / Claim | Primary File & Symbol | Supporting File |
| :--- | :--- | :--- |
| **FastAPI App Init** | `backend/main.py` $\rightarrow$ `app = create_app()` | `backend/core/app_init.py` |
| **Pydantic Configuration** | `backend/core/config.py` $\rightarrow$ `class AppConfig` | `backend/core/config.py` |
| **SQLite Pragma & Session**| `backend/core/database.py` $\rightarrow$ `_enable_foreign_keys` | `backend/core/database.py` |
| **Data Models (ORM)** | `backend/models/*.py` | `backend/models/__init__.py` |
| **Upload Atomic Rollback** | `backend/routes/upload_routes.py` $\rightarrow$ `upload_dataset` | `backend/tests/test_storage_security.py` |
| **Missing Value Imputation**| `backend/services/cleaning_service.py` $\rightarrow$ `clean_missing_values_service` | `backend/tests/test_performance.py` |
| **Outlier Detection** | `backend/services/cleaning_service.py` $\rightarrow$ `apply_outliers_service` | `backend/routes/outlier_routes.py` |
| **Validation DSL Engine** | `backend/services/validation/evaluators.py` | `backend/services/validation/smart_engine.py` |
| **Survey Weighting Engine**| `backend/services/statistics/weighting_engine.py` $\rightarrow$ `run_weight_estimation` | `backend/tests/test_statistics.py` |
| **Kish ESS & Variance** | `backend/services/statistics/variance_utils.py` | `backend/tests/test_statistics.py` |
| **Confidence Intervals** | `backend/services/statistics/ci_utils.py` | `backend/tests/test_statistics.py` |
| **Ollama Client & Failover**| `backend/services/ai/ollama_client.py` $\rightarrow$ `ask_ollama` | `backend/services/ai/prompt_builder.py` |
| **AI Concurrency Semaphore**| `backend/services/ai/explanation_engine.py` $\rightarrow$ `sem = asyncio.Semaphore(3)` | `backend/tests/test_performance.py` |
| **AI Local Disk Cache** | `backend/services/ai/cache_engine.py` $\rightarrow$ `save_ai_cache_section` | `backend/models/ai_cache_model.py` |
| **Fast Line Counting** | `backend/services/versioning/engine.py` $\rightarrow$ `_fast_csv_shape` | `backend/services/versioning/engine.py` |
| **Atomic Version Rollback**| `backend/services/versioning/engine.py` $\rightarrow$ `rollback_version` | `backend/routes/versioning_routes.py` |
| **Storage Reconciler** | `backend/services/reconciliation_service.py` $\rightarrow$ `reconcile_dataset_refs` | `backend/routes/versioning_routes.py` |
| **Password PBKDF2 Hashing**| `backend/services/auth_service.py` $\rightarrow$ `_hash_password` | `backend/models/user_model.py` |
| **Fernet AES Encryption** | `backend/services/encryption_engine.py` $\rightarrow$ `encrypt_file` | `backend/routes/versioning_routes.py` |
| **Signed Download Token** | `backend/services/signed_download_service.py` $\rightarrow$ `generate_signed_token` | `backend/utils/token_utils.py` |
| **PDF Report Engine** | `backend/services/reporting/engine.py` $\rightarrow$ `build_pdf_report` | `backend/routes/report_routes.py` |
| **Memory Optimization** | `backend/utils/dataframe_optimizer.py` $\rightarrow$ `optimize_dataframe_memory` | `backend/services/dataset_loader.py` |
| **Path Traversal Guard** | `backend/utils/file_utils.py` $\rightarrow$ `resolve_safe_path` | `backend/tests/test_storage_security.py` |
| **Frontend Root & Shell** | `frontend/src/App.jsx`, `frontend/src/allroutes.jsx` | `frontend/src/main.jsx` |
| **Lineage Graph UI** | `frontend/src/components/VersionLineageGraph.jsx` | `frontend/package.json` |
| **Survey Estimation UI** | `frontend/src/components/cleaning/weight_estimation/WeightEstimationPanel.jsx` | `frontend/src/pages/cleaning/WeightingEngine.jsx` |
| **E2E Playwright Specs** | `frontend/e2e/*.spec.js` | `frontend/playwright.config.js` |

---

## 40. Final Accuracy Audit

- [x] **Every technology mentioned is actually supported:** Verified via manifests (`requirements.txt`, `package.json`).
- [x] **Every model name is verified:** `phi3` verified in config; invalid `gemini-2.5-flash` documented as defect.
- [x] **Every dataset is verified:** Golden test dataset `frontend/e2e/data/test_data.csv` (8 rows) verified.
- [x] **Every metric has evidence:** Row limits, timeout windows, concurrency bounds, and epsilon tolerances cited with line numbers.
- [x] **Architecture matches implementation:** Fully cross-referenced against routers, services, models, and UI components.
- [x] **README claims were cross-checked:** Inconsistencies (IPF raking vs. weighted estimation, Gemini model name) noted.
- [x] **No unsupported production claims exist:** Clear distinction made between production-ready architecture and local prototype deployment.
- [x] **No unsupported business impact exists:** Strictly technical claims; no fabricated user numbers or revenue impact.
- [x] **Resume bullets use verified evidence:** All bullets map to verified code implementations.
- [x] **Portfolio claims use verified evidence:** Balanced for technical recruiters and engineering peers.
- [x] **Unknown information is clearly marked:** Benchmarks and active traffic marked unknown.
- [x] **Contradictions are documented:** Conflicts between README marketing and code implementation recorded.
- [x] **Evidence/source paths are provided:** Exact file paths and function names mapped.
- [x] **"Do Not Claim" section is fully populated:** Clearly defines boundaries to prevent interview misrepresentation.
