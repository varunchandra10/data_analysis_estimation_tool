# DAET Frontend (Data Analysis & Estimation Tool)

DAET Frontend is an enterprise-grade React analytics interface designed for survey preprocessing, data cleaning, validation, version lineage tracking, and AI-assisted insight generation. It provides researchers and analysts with an interactive, responsive environment to ingest datasets, analyze data quality, apply cleaning pipelines, and track changes across dataset iterations.

---

## 🚀 Key Features

* **Dataset Ingestion & Preview:** Drag-and-drop CSV upload with high-speed paginated grid previews and structural metadata summaries.
* **Interactive Analytics Dashboard:** Real-time visualization of dataset health, missing values, variable correlation matrices, and distribution metrics.
* **Advanced Cleaning Pipelines:** Dedicated wizards for null imputation (mean/median/mode/constant/interpolation), outlier detection (IQR/Z-Score), deduplication, and custom logic rules.
* **AI-Assisted Insights:** Local LLM/AI integration displaying natural language explanations and cleaning recommendations directly on data quality cards.
* **Version Control & Lineage:** Git-like version timeline with interactive node graphs showing parent-child lineage and single-click rollbacks.
* **Enterprise Reporting Engine:** Direct PDF report generation summarizing quality scores, cleaning operations, and audit trails.
* **Responsive Dark/Light UI:** Immersive, modern layout featuring smooth sidebar transitions, responsive charting grids, and theme persistence.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | React 19 (Vite) | High-performance component-based frontend framework utilizing the React Compiler. |
| **Styling & Theme** | TailwindCSS v4 | Utility-first styling engine with native Vite integration and light/dark theme variables. |
| **State Management** | Zustand & Context API | Hybrid state structure: global transient state via Zustand, scoped contexts for AI and datasets. |
| **Data Visualization** | Recharts | Declarative charting library for dataset statistics, histograms, scatter plots, and box plots. |
| **Interactive Graphs** | React Flow | Node-based interactive canvas used to visualize pipeline steps and dataset version lineage. |
| **API client** | Axios | Custom-configured client with interceptors for request orchestration and token handling. |
| **Routing** | React Router v7 | Declarative frontend routing, layout nesting, and URL-state synchronization. |
| **Animations** | Framer Motion | Hardware-accelerated fluid transitions, sidebar toggles, and micro-animations. |
| **File Handling** | React Dropzone | Optimized HTML5 drag-and-drop engine for seamless CSV uploads. |
| **Testing Suite** | Playwright | End-to-end E2E testing framework for UI integration and workflow verification. |
| **Icons** | Lucide React | Clean, scalable SVG icon set matching modern enterprise design systems. |

---

## 📐 Architecture & Design Patterns

The frontend utilizes a clean, decoupled architecture:
* **Modular Components:** UI layout is separated into presentation panels, functional analytics cards, charts, and workflow wizards.
* **Custom Hooks Separation:** Business logic, API polling, and asynchronous mutation states are encapsulated in custom React hooks, keeping components purely presentational.
* **Centralized API Client:** Unified HTTP communication layer using a configured Axios client to handle base configurations, request/response interceptors, and error propagation.
* **Contextual State Orchestration:** Global configurations (Authentication, Theme, Project) are managed via custom Context providers, while state-heavy features (like dataset lineage) leverage custom hooks and contexts.

---

## 📁 Directory Structure

```
src/
├── assets/              # Static media files, global icons, and theme assets.
├── components/          # Reusable UI panels, analytics cards, and workflow widgets.
│   ├── UI/              # Shell layout elements (Navbar, Sidebar, Landingpage, Loader).
│   ├── charts/          # Custom chart wrappers (Recharts, PipelineGraph, Correlation Heatmap).
│   ├── cleaning/        # Cleaning action wizards (Imputation, Outliers, Validation, Weighting).
│   └── common/          # Low-level UI primitives (buttons, inputs, tooltips).
├── context/             # React Context providers for global scope (Theme, Auth, AI, Dataset, Version).
├── hooks/               # Custom hooks for API polling, dataset lifecycle, and dashboard orchestration.
├── pages/               # Route-level views mapping directly to dashboard paths.
│   ├── analysis/        # Statistical computation and exploratory engine view.
│   ├── cleaning/        # Null, anomaly, deduping, and logic validation interfaces.
│   ├── data/            # Dataset explorer, data grid, and preview pages.
│   ├── home/            # Core dashboard landing page and initial views.
│   ├── ingestion/       # CSV drop-zones and dataset upload wizard.
│   └── versioning/      # Version control panel and interactive lineage graph.
├── services/
│   └── api/             # Centralized Axios API client and endpoint-specific wrappers.
└── utils/               # Common helper utilities (PDF generator, tooltips, session helpers).
```

---

## 🖼️ Screenshots & Previews

### Dashboard
![Dashboard Preview](docs/screenshots/dashboard.png)
*Enterprise dashboard providing real-time data completeness metrics, outlier alerts, and metadata cards.*

### AI Insights
![AI Insights Preview](docs/screenshots/ai_insights.png)
*Context-aware AI cards offering descriptive cleaning suggestions and explainable anomaly alerts.*

### Version Lineage
![Version Lineage Preview](docs/screenshots/version_lineage.png)
*Interactive lineage graph showing version histories, parent-child nodes, and rollback states.*

### Reports
![Reports Preview](docs/screenshots/reports.png)
*Clean PDF layout showing data quality scores, cleaning actions taken, and the audit timeline.*

### Validation Workflow
![Validation Workflow Preview](docs/screenshots/validation_workflow.png)
*Multi-step wizard UI for executing and reviewing custom verification rules on variables.*

---

## ⚙️ Getting Started

### Prerequisites
* Node.js (v18+)
* npm (v9+)

### Installation
1. Clone the repository and navigate to the frontend directory:
   ```bash
   git clone https://github.com/varunchandra10/data_analysis_estimation_tool.git
   cd data_analysis_estimation_tool/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173`.*

4. Run Playwright E2E Tests:
   ```bash
   npx playwright test
   ```

---

## ✨ Engineering Highlights

* **AI Explainability Card UI:** Dynamically displays context-specific AI comments and auto-generated data transformation recommendations to bridge data science with business intelligence.
* **Stateful Git-like Versioning Lineage:** Implemented visual DAGs (Directed Acyclic Graphs) using React Flow allowing easy branch navigation and state recovery.
* **Enterprise Dashboard Grid:** Modular layout designed for sub-second reactivity and fluid resizing across screens using Tailwind Grid and Flex layout systems.
* **Robust Runtime Safety:** Strictly typed mock structures and defensive rendering prevent application crashes due to corrupted CSV uploads or unexpected API schemas.
* **Optimized Visual Transitions:** Utilizing Framer Motion to animate UI tab switches and sidebar states to guarantee a premium, native-app feel.
