# DAET — AI-Augmented Survey Data Processing & Estimation Platform

## Overview

DAET (Data Analysis, Estimation & Transformation) is an AI-assisted survey data processing, validation, estimation, and reporting platform developed for the MOSPI (Ministry of Statistics and Programme Implementation) problem statement:

> “AI Enhanced Application for Automated Data Preparation, Estimation and Report Writing”

The platform automates the complete survey-data workflow including:

* dataset ingestion
* preprocessing
* validation
* statistical estimation
* analytics
* AI-assisted summaries
* report generation

The system is designed to improve:

* data quality
* reproducibility
* statistical consistency
* workflow efficiency
* auditability

---

# Current Project Status

## Completed Phases

| Phase | Status |
|---|---|
| Phase-0 — Initialization | ✅ Completed |
| Phase-1 — System Design | ✅ Completed |
| Phase-2 — File Upload Module | ✅ Completed |
| Phase-3 — Cleaning Engine | ✅ Completed |
| Phase-4 — Rule Validation Engine | ✅ Completed |

---

# Core Features

# 1. Dataset Upload & Processing

## Supported Formats

* CSV
* XLSX

## Features

* drag & drop upload
* dataset parsing
* schema inference
* metadata extraction
* dataset preview
* null-value analysis

## Automatic Schema Detection

Automatically identifies:

* numerical columns
* categorical columns
* date columns
* text columns

---

# 2. Cleaning Engine

## Missing Value Handling

Supported strategies:

* Mean Imputation
* Median Imputation
* Mode Imputation
* KNN Imputation

### Features

* per-column strategy selection
* intelligent type handling
* before/after preview
* cleaning statistics

---

## Outlier Detection

Supported methods:

* IQR
* Z-Score
* Winsorization

### Features

* threshold detection
* affected-row visualization
* outlier statistics
* dynamic chart generation

### Visualizations

* histogram
* scatter plot
* boxplot statistics

---

## Duplicate Handling

Supported operations:

* detect duplicates
* remove duplicates
* keep latest record

### Features

* duplicate statistics
* duplicate preview table
* duplicate summary charts

### Visualizations

* pie chart
* dataset summary chart

---

## Cleaning Logs

Tracks:

* operation performed
* affected rows
* timestamp
* preprocessing details

---

# 3. Dynamic Rule Validation Engine

## Rule-Based Validation

Examples:

```text
age >= 0
age <= 120
salary > 0
````

---

## Conditional Validation (Skip Logic)

Example:

```text
if employed == "No"
salary must be null
```

---

## Features

* dynamic rule creation
* configurable operators
* severity levels
* validation reporting
* violated-row detection
* conditional rule support

---

## Validation Output

Displays:

* violated rows
* actual values
* expected conditions
* severity counts
* validation statistics

---

## Severity Levels

* Low
* Medium
* High

---

# 4. Visualization Engine

## Reusable Chart Architecture

Built reusable visualization components for analytics modules.

### Supported Charts

* Bar Chart
* Pie Chart
* Histogram
* Scatter Plot
* Boxplot
* Line Chart

---

## Context-Aware Visualization Strategy

### Missing Values

Uses:

* bar charts
* pie charts

---

### Outlier Detection

Uses:

* histogram
* scatter plot
* boxplot

---

### Duplicate Handling

Uses:

* pie chart
* summary chart

---

# 5. Logging & Auditability

Tracks all major operations:

* preprocessing
* outlier detection
* duplicate handling
* validation execution

Stored information:

* timestamp
* operation details
* rows affected
* validation statistics

---

# Tech Stack

# Frontend

* React.js (Vite)
* Tailwind CSS
* Axios
* Recharts
* Lucide React

---

# Backend

* FastAPI
* Pandas
* NumPy
* Scikit-learn
* SciPy

---

# AI Layer (Planned)

* Ollama

---

# Database (Planned)

* PostgreSQL
* Supabase

---

# Deployment (Planned)

## Frontend

* Netlify

## Backend

* Render

---

# System Architecture

```text
Frontend (React + Tailwind)
        ↓
FastAPI Backend
        ↓
Processing Layer
(Pandas + Scikit-learn + SciPy)
        ↓
Validation Engine
        ↓
Visualization Engine
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
│   ├── components/
│   ├── charts/
│   ├── pages/
│   └── App.jsx
│
├── backend/
│   ├── main.py
│   └── requirements.txt
│
├── datasets/
├── logs/
├── docs/
└── README.md
```

---

# Implemented API Endpoints

# Upload & Dataset APIs

```http
POST /api/upload
```

Upload CSV/XLSX datasets.

---

# Cleaning APIs

## Missing Value Cleaning

```http
POST /api/clean/missing-values
```

---

## Outlier Detection

```http
POST /api/outliers/detect
```

---

## Duplicate Handling

```http
POST /api/duplicates/process
```

---

# Validation APIs

## Dynamic Rule Validation

```http
POST /api/validation/run
```

---

# Visualization APIs

## Generate Visualizations

```http
POST /api/visualizations/generate
```

---

# Logging APIs

## Fetch Cleaning Logs

```http
GET /api/logs/{dataset_name}
```

---

# Completed Development Phases

# Phase-0 — Project Initialization - Completed

* repository structure setup
* frontend initialization
* backend initialization
* dependency planning
* architecture planning

---

# Phase-1 — System Design & Database - Completed

### ER Design

Designed entities:

* users
* projects
* datasets
* cleaning_logs
* reports

---

### API Planning

Designed endpoint architecture.

---

### UI Planning

Designed application workflow and page structure.

---

# Phase-2 — File Upload Module - Completed

### Backend

* CSV/XLSX upload
* dataset parsing
* schema detection
* metadata extraction

---

### Frontend

* drag & drop upload
* dataset preview dashboard
* schema visualization
* missing-value statistics

---

# Phase-3 — Cleaning Engine - Completed

### Missing Value Handling

Implemented:

* Mean
* Median
* Mode
* KNN Imputation

---

### Outlier Detection

Implemented:

* IQR
* Z-Score
* Winsorization

---

### Duplicate Handling

Implemented:

* detection
* removal
* latest-record retention

---

### Cleaning Logs

Implemented:

* operation logging
* timestamp tracking
* affected-row statistics

---

### Visualization Integration

Implemented:

* histogram generation
* boxplot statistics
* scatter plots
* pie charts
* bar charts

---

# Phase-4 — Rule Validation Engine - Completed

### Dynamic Rule Engine

Implemented:

* configurable rules
* operator parsing
* conditional validation
* skip logic

---

### Validation UI

Implemented:

* rule builder
* severity selection
* validation execution
* violation table

---

### Error Reporting

Implemented:

* violated rows
* error counts
* severity summaries

---

# Upcoming Development Phases

# Phase-5 — Survey Weighting & Estimation

## Planned Features

* weighted estimation
* confidence intervals
* margin of error
* survey statistics
* weighted summaries

---

# Phase-6 — Analytics Dashboard

## Planned Features

* workflow dashboards
* interactive analytics
* statistical visualizations
* quality metrics

---

# Phase-7 — AI-Assisted Summaries Using Ollama

## Planned Features

* AI-generated insights
* preprocessing recommendations
* anomaly explanations
* executive summaries

---

# Phase-8 — Report Generation

## Planned Features

* PDF reports
* HTML reports
* preprocessing summaries
* statistical summaries
* downloadable reports

---

# Phase-9 — Audit Logs & Reproducibility

## Planned Features

* workflow versioning
* reproducibility support
* audit trail dashboard
* pipeline tracking

---

# Phase-10 — Testing & Deployment

## Planned Features

### Testing

* API testing
* Playwright frontend testing
* integration testing

---

### Deployment

* frontend hosting
* backend hosting
* cloud database integration
* production environment setup

---

# Development Goals

The project focuses on:

* statistical correctness
* automated preprocessing
* enterprise-grade validation
* reproducibility
* explainable workflows
* modular architecture

rather than generic dashboard-only analytics systems.

---

# Target Outcome

A production-oriented AI-assisted survey data processing platform capable of:

* accelerating survey readiness
* reducing preprocessing errors
* automating validation workflows
* improving statistical consistency
* generating standardized analytical reports

aligned with MOSPI’s data-processing objectives.

---

# Current Highlights

## Implemented So Far

Dynamic preprocessing engine | Rule validation engine | Context-aware visualizations | Reusable chart architecture | Cleaning logs & auditability | Modular FastAPI backend | Interactive React frontend | Dataset quality analytics | Enterprise-style validation workflow

---

# Author

DAET Platform (Varun Chandra) — Developed as part of the MOSPI AI-Augmented Survey Data Processing initiative.
