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

# Upcoming Development Phases

## Phase-1

* Database design
* API planning
* UI wireframes

## Phase-2

* Dataset upload module
* schema mapping
* dataset preview

## Phase-3

* preprocessing engine
* missing value handling
* outlier detection

## Phase-4

* rule validation engine

## Phase-5

* survey weighting & estimation

## Phase-6

* analytics dashboard

## Phase-7

* AI-assisted summaries using Ollama

## Phase-8

* report generation

## Phase-9

* audit logs & reproducibility

## Phase-10

* testing & deployment

---

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
