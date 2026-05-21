
---

## BACKEND - Overview

- Modular FastAPI analytical processing layer for survey datasets.
- Responsibilities: ingestion, preprocessing, validation, statistical estimation, AI-assisted interpretability, version-aware storage, reporting, and auditability.
- Status: iterative development - some modules stable, others partial or planned.

`Backend of the project will be added soon due to some frontend and backend bugs and to stop users to clone this project we have removed the backend from the repo until all front and backend connections gets better sorry for the inconviences :)`

## Design Principles

- Modular route separation and service-first architecture.  
- Utility-driven, reusable helpers.  
- File-backed dataset version awareness and snapshot lineage.  
- Deterministic statistical pipelines with controlled LLM assistance.  
- Avoid route-to-route coupling; favor service orchestration.  
- Incremental hardening: tests, Pydantic contracts, and DB normalization prioritized.

## Folder Structure (top-level)

```
backend/
│
├── app.py                  # FastAPI app entry
├── core/                   # app_init, config, constants
├── routes/                 # HTTP route modules (upload, cleaning, validation...)
├── services/               # Domain logic & pipelines
├── utils/                  # Shared helpers (dataframe/file/stats)
├── datasets/               # File-backed dataset snapshots
├── logs/                   # Audit logs / operation traces
├── ai_cache/               # Cached AI outputs / recommendations
```

- `app.py`: FastAPI startup, middleware, router registration.  
- `routes/`: thin adapters - validation, upload, cleaning endpoints.  
- `services/`: where domain logic, pipelines, and orchestration live.  
- `utils/`: stateless helpers used by services and routes.  
- `datasets/`, `logs/`, `ai_cache/`: primary persistence areas (file-first today).

## Request Flow

Frontend  
 ↓  
FastAPI Routes (`routes/`) - thin adapters  
 ↓  
Service Layer (`services/`) - orchestration & domain logic  
 ↓  
Statistical Engines (Pandas / SciPy / Statsmodels)  
 ↓  
Utility Layer (`utils/`) - IO, transforms, validation helpers  
 ↓  
Storage / Versioning / Reports (`datasets/`, `logs/`, export services`)

Notes: routes delegate to services; services own pipeline steps and snapshots to prevent route-to-route coupling.

## Route Layer

| Route Module | Responsibility | Status |
|---|---|---:|
| `upload_routes.py` | Accept file uploads, create initial snapshot | Stable |
| `cleaning_routes.py` | Trigger cleaning pipelines, preview results | Stable |
| `outlier_routes.py` | Detect / apply outlier strategies | Stable |
| `duplicate_routes.py` | Detect & deduplicate records | Stable |
| `validation_routes.py` | Rule authoring & validation runs | Partial |
| `statistics_routes.py` | Descriptive stats & summaries | Improving |
| `ai_routes.py` | Trigger AI explanations / recommendations | Partial |
| `logs_routes.py` | Retrieve audit logs & operation history | Stable |

## Service Layer (where core domain logic lives)

| Service | Purpose | Maturity |
|---|---|---:|
| `recommendation_engine.py` | Deterministic statistical recommendations | Stable |
| `ai_explanation_engine.py` | Generate LLM explanations (Ollama wrappers) | Partial |
| `module_ai_engine.py` | Module-specific AI assist (validation/weighting hints) | Partial |
| `ai_cache_engine.py` | Cache & reuse AI responses for reproducibility | Stable |
| `weighting_engine.py` | Survey weighting algorithms & diagnostics | Stable / Improving |

Notes: Services implement pipeline steps, snapshot/version management and call utils/stat engines; unit tests should focus here.

## Utility Layer

| Utility | Role |
|---|---|
| `file_utils` | file IO, snapshot save/restore, checksums |
| `dataframe_utils` | DataFrame transforms, type-casting, schema ops |
| `stats_utils` | statistical helpers: imputation, z‑score, IQR |
| `validation_utils` | DSL parsing, rule evaluation, conditional checks |
| `visualization_utils` | chart data preparation (frontend-friendly) |
| `log_utils` | audit log formatting and persistence |

These are intentionally stateless and unit-testable.

## Current Core Backend Features

| Feature | Status | Notes |
|---|---:|---|
| CSV/XLSX Upload | Implemented | File-backed initial snapshots |
| Schema Inference | Implemented | Basic type coercion & column stats |
| Dataset Preview | Implemented | Quick preview + metadata |
| Missing Value Cleaning | Implemented | Mean/median/mode/KNN strategies |
| Outlier Detection | Implemented | IQR / Z-score / Winsorization |
| Duplicate Handling | Implemented | Detection + dedupe policies |
| Validation Engine | Partial | DSL exists; needs hardening & tests |
| Weight Estimation | Implemented | Survey weighting + diagnostics |
| AI Recommendations | Implemented | Deterministic + heuristics |
| AI Explanations | Partial | Ollama integration present; prompts evolving |
| AI Cache | Implemented | Cached outputs for repeatability |
| Audit Logs | Implemented | Operation traces in `logs/` |
| Version-aware flow | Implemented | File snapshots + metadata |
| Compression | Implemented | Archive snapshots on demand |
| Encryption | Implemented | At-rest workflows integrated |
| Report Generation | Partial | PDF/export templates in progress |
| Pipeline flow | Implemented | Orchestrated via services |

## Dataset Version Lifecycle

Raw Upload → Cleaning → Outlier Handling → Validation → Weight Estimation → Report / Archive / Export

- Snapshots saved at key steps to `datasets/` with metadata.  
- Rollback and restore supported via snapshot retrieval (partial/complete depending on dataset state).

## AI Backend Design

| Engine | Responsibility |
|---|---|
| Recommendation Engine | Deterministic statistical suggestions and rule hints |
| AI Explanation Engine | Ollama-based human-readable explanations for edits/validation |
| Module AI Engine | Contextual module assistance (validation/weighting) |
| AI Cache Engine | Persist & reuse AI responses for reproducibility |

Hybrid pattern: deterministic first, LLMs used for explanation/context and human-facing summaries.

## Storage Strategy

- Current approach: file-backed dataset storage with metadata files and checksums (`datasets/`, `ai_cache/`, `logs/`).  
- Strengths: simple rollback, transparent lineage, low friction.  
- Limits: metadata normalization and DB-backed indexing are still evolving - DB sync and normalized metadata are planned.

## Backend Maturity / Limitations

| Area | Current State |
|---|---|
| Validation DSL | Partial (works; needs tests & richer operators) |
| Weighting correctness | Improving (diagnostics present; more unit tests needed) |
| AI consolidation | In progress (prompt templates + reliability work) |
| DB sync & normalization | Planned |
| Auth / RBAC | Planned |
| Background tasks (workers) | Planned (Celery / Redis) |
| Large dataset optimization | Planned (parquet / partitioning) |
| Full persistence guarantees | Evolving |

Be explicit with reviewers: not all modules are production-hardened; priority is correctness, auditability, and testability.

## What This Backend Demonstrates

- FastAPI modular backend structuring and routing patterns.  
- Clear separation: routes → services → engines → utils.  
- Analytical data pipelines (preprocess → validate → weight → report).  
- Version-aware dataset engineering (file snapshots + metadata).  
- AI-assisted orchestration with caching for reproducibility.  
- Practical engineering trade-offs: file-first persistence, incremental hardening.

## Local Backend Run (quick)

```bash
# create venv, install and run backend (Windows PowerShell)
python -m venv .venv
.venv\\Scripts\\Activate.ps1
pip install -r backend/requirements.txt
uvicorn backend.app:app --reload
```

If using local AI models:

```bash
ollama serve
ollama run phi3
```

## Future Hardening (planned)

| Focus | Priority |
|---|---:|
| Pydantic contracts & DTO tightening | High |
| Validation DSL hardening & tests | High |
| AI consolidation & robust prompts | Medium-High |
| DB normalization & metadata indexing | High |
| JWT Auth & RBAC | High |
| Background jobs & retries | Medium |
| Pagination, streaming & large-file handling | Medium |
| Expanded unit / e2e test coverage | High |

---
