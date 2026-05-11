# DAET — AI-Augmented Survey Data Processing & Estimation Platform

## Overview

DAET (Data Analysis, Estimation & Transformation) is an AI-assisted survey data processing and reporting platform developed for the MOSPI (Ministry of Statistics and Programme Implementation) problem statement:

> “AI enhanced Application for Automated Data Preparation, Estimation and Report Writing”

The platform automates survey-data workflows including:

* dataset ingestion
* preprocessing
* validation
* weighting
* statistical estimation
* visualization
* report generation

The system is designed to improve:

* data quality
* reproducibility
* workflow efficiency
* statistical consistency

---

# Core Features

## Dataset Processing

* CSV/XLSX upload
* schema detection
* dataset preview

## Cleaning Engine

* missing value imputation
* outlier detection
* duplicate handling
* preprocessing logs

## Validation System

* rule-based validation
* consistency checks
* skip-pattern validation

## Statistical Estimation

* weighted/unweighted summaries
* confidence intervals
* margin of error calculations

## Visualization Dashboard

* data quality metrics
* diagnostics
* analytical charts

## AI Assistance

* automated summaries
* anomaly explanations
* preprocessing recommendations

## Report Generation

* PDF reports
* HTML reports
* workflow diagnostics

---

# Tech Stack

## Frontend

* React.js (Vite)
* Tailwind CSS
* Recharts

## Backend

* FastAPI
* Pandas
* NumPy
* Scikit-learn
* Statsmodels

## Database

* PostgreSQL / Supabase

## AI

* Ollama

## Deployment

* Netlify (Frontend)
* Render (Backend)

---

# System Architecture

```text
Frontend (React + Tailwind)
        ↓
FastAPI Backend
        ↓
Processing Layer
(Pandas + Scikit-learn + Statsmodels)
        ↓
AI Layer (Ollama)
        ↓
PostgreSQL / Supabase
```

---

# Project Structure

```text
mospi-daet/
│
├── frontend/
├── backend/
├── docs/
├── datasets/
└── README.md
```

---

# Phase-0 Status (Completed)

## Project Initialization

* Repository structure created
* Frontend initialized using Vite + React
* Backend initialized using FastAPI
* Git workflow setup
* Initial dependency planning completed

---

## Frontend Setup

Completed:

* React + Vite setup
* Tailwind CSS integration
* Initial folder structure planning

Planned:

* component architecture
* routing
* dashboard UI

---

## Backend Setup

Completed:

* FastAPI initialization
* virtual environment setup
* dependency identification

Core libraries:

* Pandas
* NumPy
* Scikit-learn
* Statsmodels

---

## Initial Development Plan Finalized

* SDLC workflow defined
* phase-wise roadmap prepared
* architecture finalized
* deployment strategy finalized

---

# Phase-1 Status (Completed)

## System Design & Database

* ER diagram finalized
* API blueprint defined
* UI wireframes outlined

---

# Phase-2 Status (Completed)

## File Upload Module

* Dataset upload module implemented (CSV/XLSX support via Pandas)
* Auto schema mapping & detection implemented
* Dataset preview dashboard with rich metadata built

---

# Upcoming Development Phases

# Phase-3 — Preprocessing Engine

## Objective

Develop an automated preprocessing pipeline capable of handling raw survey datasets before statistical estimation and reporting.

The preprocessing engine is responsible for:

* improving data quality
* reducing inconsistencies
* preparing datasets for analysis
* maintaining reproducibility

---

# Core Modules

## 1. Missing Value Handling

### Goal

Detect and handle incomplete records in uploaded datasets.

### Supported Strategies

* Mean Imputation
* Median Imputation
* Mode Imputation
* KNN Imputation

### Backend Implementation

Libraries:

* Pandas
* Scikit-learn

Modules:

```python
SimpleImputer
KNNImputer
```

### Features

* per-column imputation selection
* numerical/categorical separation
* preview before applying transformations
* percentage of missing values per column

### Output

* cleaned dataset
* missing-value statistics
* transformation logs

---

## 2. Outlier Detection

### Goal

Identify anomalous records that may distort statistical estimates.

### Supported Methods

* IQR (Interquartile Range)
* Z-Score
* Winsorization

### Features

* threshold configuration
* outlier highlighting
* affected-row visualization
* before/after comparison

### Backend

Libraries:

* NumPy
* SciPy
* Pandas

### Output

* detected outliers
* cleaned dataset
* outlier summary statistics

---

## 3. Duplicate Handling

### Goal

Detect redundant records within datasets.

### Features

* duplicate identification
* duplicate removal
* configurable retention policies

### Output

* duplicate count
* removed records summary

---

## 4. Preprocessing Logs

### Goal

Maintain reproducibility and transparency.

### Logs Include

* operation performed
* affected columns
* rows modified
* timestamp
* preprocessing method used

---

# Deliverables

* preprocessing pipeline
* cleaning API endpoints
* preprocessing dashboard
* operation logs

---

# Phase-4 — Rule Validation Engine

## Objective

Develop a configurable validation engine for enforcing survey-data consistency and logical correctness.

---

# Validation Features

## 1. Rule-Based Validation

### Examples

```text
age >= 0
age <= 120
salary > 0
```

### Features

* dynamic rule creation
* configurable thresholds
* rule severity levels

---

## 2. Skip Logic Validation

### Example

```text
if employed = no
salary must be null
```

### Goal

Ensure survey logic consistency.

---

## 3. Schema Validation

### Checks

* datatype consistency
* mandatory fields
* invalid categorical values

---

## Frontend Features

### Rule Builder UI

Users can:

* define conditions
* configure validation rules
* preview validation errors

---

## Backend Features

### Validation Engine

* rule parser
* dynamic condition execution
* error aggregation

---

# Output

* validation report
* failed rows
* error summaries
* validation statistics

---

# Deliverables

* rule engine
* validation APIs
* rule builder interface
* validation reports

---

# Phase-5 — Survey Weighting & Estimation

## Objective

Implement statistical estimation techniques used in survey-data analysis.

This phase is critical for aligning with MOSPI objectives.

---

# Core Features

## 1. Survey Weight Application

### Goal

Apply design/sample weights to survey datasets.

### Features

* user-selected weight column
* weighted/unweighted comparison
* weight normalization

---

## 2. Statistical Estimation

### Metrics

* weighted mean
* weighted proportion
* variance estimation
* standard error

### Libraries

* Statsmodels
* NumPy

---

## 3. Confidence Intervals

### Features

* confidence interval calculation
* customizable confidence levels
* interval visualization

---

## 4. Margin of Error

### Goal

Provide reliability estimates for survey outputs.

---

# Visualization

* weighted vs unweighted comparisons
* estimation charts
* confidence interval plots

---

# Deliverables

* weighting engine
* estimation APIs
* statistical dashboard
* survey summary reports

---

# Phase-6 — Analytics Dashboard

## Objective

Create an interactive dashboard for monitoring data quality, preprocessing, and statistical outputs.

---

# Dashboard Modules

## 1. Dataset Overview

Displays:

* total rows
* total columns
* missing values
* duplicate counts

---

## 2. Data Quality Dashboard

### Charts

* missing value distribution
* outlier frequency
* validation error summaries

### Libraries

* Recharts

---

## 3. Statistical Dashboard

### Displays

* weighted summaries
* distributions
* confidence intervals
* margin of error

---

## 4. Workflow Visualization

### Pipeline Representation

```text
Upload → Cleaning → Validation → Weighting → Reporting
```

---

# Features

* responsive design
* interactive charts
* exportable visualizations

---

# Deliverables

* analytics UI
* chart components
* workflow dashboard

---

# Phase-7 — AI-Assisted Summaries Using Ollama

## Objective

Integrate lightweight local AI models for explainability and report assistance.

---

# AI Features

## 1. Dataset Quality Summaries

### Example Prompt

```text
Explain the major quality issues in this dataset.
```

### Output

* missing-value interpretation
* anomaly explanation
* quality assessment

---

## 2. Cleaning Recommendations

### Example

```text
Suggest preprocessing methods for this dataset.
```

---

## 3. Statistical Narratives

### Generate

* executive summaries
* key observations
* report conclusions

---

## 4. Explainability Layer

### Example

```text
Why was this row flagged as an outlier?
```

---

# Ollama Models

## Recommended

* phi3
* gemma:2b
* tinyllama

---

# Backend Integration

### API Communication

```python
http://localhost:11434/api/generate
```

---

# Deliverables

* Ollama integration
* AI explanation APIs
* AI-generated summaries

---

# Phase-8 — Report Generation

## Objective

Generate professional analytical reports from processed datasets.

---

# Report Components

## 1. Dataset Information

* row count
* column count
* schema summary

---

## 2. Preprocessing Summary

* missing values handled
* outliers removed
* duplicates removed

---

## 3. Validation Summary

* failed validations
* rule violations
* consistency issues

---

## 4. Statistical Analysis

* weighted estimates
* confidence intervals
* summary metrics

---

## 5. Visualizations

* charts
* diagnostics
* workflow diagrams

---

# Output Formats

* PDF
* HTML

---

# Backend Tools

* ReportLab
* Jinja2

---

# Features

* downloadable reports
* report templates
* automated report generation

---

# Deliverables

* PDF generation engine
* HTML reports
* report APIs

---

# Phase-9 — Audit Logs & Reproducibility

## Objective

Maintain traceability and reproducibility across all preprocessing and estimation workflows.

---

# Core Features

## 1. Workflow Logging

### Track

* uploads
* cleaning operations
* validations
* report generation

---

## 2. Reproducibility

### Features

* save preprocessing configurations
* rerun workflows
* version processing pipelines

---

## 3. Audit Trail Dashboard

Displays:

* operation history
* timestamps
* affected records
* workflow sequence

---

# Database Logging

### Store

* operation metadata
* configuration details
* processing timestamps

---

# Deliverables

* audit logging system
* reproducibility support
* workflow history dashboard

---

# Phase-10 — Testing & Deployment

## Objective

Ensure application reliability, scalability, and production readiness.

---

# Testing Strategy

## 1. Backend Testing

### Scope

* API testing
* preprocessing validation
* statistical calculation accuracy

### Tools

```text
pytest
```

---

## 2. Frontend Testing

### Scope

* workflow testing
* form validation
* dashboard interactions

### Tools

```text
Playwright
```

---

## 3. Integration Testing

### Validate

* upload-to-report workflow
* database integration
* frontend-backend communication

---

# Deployment

## Frontend Deployment

Platform:

```text
Netlify
```

### Environment Variables

```env
VITE_API_URL=
```

---

## Backend Deployment

Platform:

```text
Render
```

### Setup

* FastAPI hosting
* PostgreSQL connection
* environment management

---

## Database Deployment

Platform:

```text
Supabase PostgreSQL
```

---

# Production Features

* error handling
* loading states
* API security
* CORS configuration
* file upload validation

---

# Final Deliverables

* production-ready frontend
* deployed backend APIs
* cloud database integration
* live analytics platform
* deployment documentation


# Development Goals

The project focuses on:

* statistical correctness
* workflow automation
* reproducibility
* explainable preprocessing
* configurable data pipelines

rather than generic chatbot-based AI systems.

---

# Target Outcome

A production-oriented prototype capable of:

* accelerating survey readiness
* reducing preprocessing errors
* automating estimation workflows
* generating standardized analytical reports

aligned with MOSPI’s data-processing objectives.
