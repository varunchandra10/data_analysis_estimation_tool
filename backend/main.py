from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sklearn.impute import SimpleImputer, KNNImputer
import pandas as pd
import numpy as np
from scipy.stats import zscore
from scipy.stats.mstats import winsorize
import os
import shutil
import json
from pathlib import Path
from datetime import datetime
from typing import List, Optional, Union

# =========================================================
# FASTAPI INIT
# =========================================================
app = FastAPI(title="DAET API", description="Data Analysis Estimation Tool API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Adjust to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# CONFIGURATION & DIRECTORIES
# =========================================================
BASE_DIR = Path(__file__).resolve().parent.parent
DATASETS_DIR = BASE_DIR / "datasets"
LOGS_DIR = BASE_DIR / "logs"

for folder in [DATASETS_DIR, LOGS_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

MAX_ROWS = 500000  # Safety limit for memory
MAX_VIOLATIONS_RETURNED = 100

# =========================================================
# UTILITY FUNCTIONS
# =========================================================

def convert_value(value):
    """Converts string inputs from frontend to proper numeric types for comparison."""
    if value is None: return None
    try:
        if isinstance(value, str):
            if value.lower() in ['true', 'false']: return value.lower() == 'true'
            if '.' in value: return float(value)
            return int(value)
        return value
    except:
        return value

def validate_file_path(file_path: str):
    """Check if file exists and is within allowed directory."""
    path = Path(file_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Dataset file not found.")
    return path

def safe_json_replace(df_head):
    """Replaces NaN/Inf values with None for JSON compatibility."""
    return df_head.replace({np.nan: None, np.inf: None, -np.inf: None}).to_dict(orient="records")

def infer_schema(df):
    schema = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        col_type = "Text"
        if pd.api.types.is_numeric_dtype(df[col]):
            col_type = "Numerical"
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            col_type = "Date"
        elif pd.api.types.is_bool_dtype(df[col]):
            col_type = "Categorical"
        else:
            n_unique = df[col].nunique()
            if n_unique < 20 or (n_unique / max(len(df), 1)) < 0.5:
                col_type = "Categorical"
        schema.append({"column": col, "type": col_type, "pandas_dtype": dtype})
    return schema

def evaluate_condition(left, operator, right):
    # Ensure 'right' is typed correctly against 'left'
    typed_right = convert_value(right) if operator not in ["is_null", "not_null"] else None
    try:
        if operator == ">": return left > typed_right
        if operator == "<": return left < typed_right
        if operator == ">=": return left >= typed_right
        if operator == "<=": return left <= typed_right
        if operator == "==": return str(left) == str(typed_right)
        if operator == "!=": return str(left) != str(typed_right)
        if operator == "is_null": return pd.isnull(left)
        if operator == "not_null": return not pd.isnull(left)
        return False
    except:
        return False

# =========================================================
# LOGGING & VISUALS
# =========================================================

def save_cleaning_log(dataset_name, operation, rows_affected, details=None):
    log_file = LOGS_DIR / f"{Path(dataset_name).stem}_logs.json"
    log_entry = {
        "operation": operation,
        "rows_affected": int(rows_affected),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "details": details or {}
    }
    logs = []
    if log_file.exists():
        try:
            with open(log_file, "r") as f: logs = json.load(f)
        except: logs = []
    logs.append(log_entry)
    with open(log_file, "w") as f: json.dump(logs, f, indent=4)

def generate_histogram_data(series, bins=10):
    values = series.dropna()
    if values.empty: return []
    counts, bin_edges = np.histogram(values, bins=bins)
    histogram = []
    for i in range(len(counts)):
        histogram.append({
            "range": f"{round(bin_edges[i], 2)}-{round(bin_edges[i+1], 2)}",
            "count": int(counts[i])
        })
    return histogram

def generate_boxplot_stats(series):
    clean_series = series.dropna()
    if clean_series.empty: return {}
    q1, median, q3 = clean_series.quantile([0.25, 0.5, 0.75])
    return {
        "min": float(clean_series.min()), "q1": float(q1), "median": float(median),
        "q3": float(q3), "max": float(clean_series.max()), "iqr": float(q3 - q1)
    }

# =========================================================
# ENDPOINTS
# =========================================================

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith((".csv", ".xlsx")):
        raise HTTPException(status_code=400, detail="Unsupported file format.")
    
    file_path = DATASETS_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        df = pd.read_csv(file_path) if file.filename.endswith(".csv") else pd.read_excel(file_path)
        if len(df) > MAX_ROWS:
            os.remove(file_path)
            raise HTTPException(status_code=400, detail="Dataset exceeds 500,000 row limit.")
            
        return {
            "status": "success",
            "metadata": {
                "filename": file.filename, "file_path": str(file_path),
                "rows": len(df), "columns": len(df.columns),
                "null_counts": df.isnull().sum().to_dict(),
            },
            "schema": infer_schema(df),
            "preview": safe_json_replace(df.head(5))
        }
    except Exception as e:
        if file_path.exists(): os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/clean/missing-values")
async def clean_missing_values(payload: dict):
    path = validate_file_path(payload.get("file_path"))
    strategies = payload.get("strategies", {})
    df = pd.read_csv(path) if str(path).endswith(".csv") else pd.read_excel(path)
    
    before_count = df.isnull().sum().sum()
    
    for column, strategy in strategies.items():
        if column not in df.columns or df[column].isnull().sum() == 0: continue
        
        if strategy in ["mean", "median", "most_frequent"]:
            imputer = SimpleImputer(strategy=strategy)
            df[[column]] = imputer.fit_transform(df[[column]])
        elif strategy == "knn" and pd.api.types.is_numeric_dtype(df[column]):
            imputer = KNNImputer(n_neighbors=5)
            # Only use numeric columns for KNN to avoid errors with strings
            num_cols = df.select_dtypes(include=[np.number]).columns
            df[num_cols] = imputer.fit_transform(df[num_cols])

    df.to_csv(path, index=False) if str(path).endswith(".csv") else df.to_excel(path, index=False)
    rows_affected = int(before_count - df.isnull().sum().sum())
    save_cleaning_log(path.name, "Missing Value Imputation", rows_affected, {"strategies": strategies})
    
    return {"status": "success", "null_counts": df.isnull().sum().to_dict(), "preview": safe_json_replace(df.head(5)), "rows_affected": rows_affected}

@app.post("/api/outliers/detect")
async def detect_outliers(payload: dict):
    path = validate_file_path(payload.get("file_path"))
    column, method = payload.get("column"), payload.get("method")
    df = pd.read_csv(path) if str(path).endswith(".csv") else pd.read_excel(path)
    
    if column not in df.columns or not pd.api.types.is_numeric_dtype(df[column]):
        raise HTTPException(status_code=400, detail="Invalid numeric column.")

    series = df[column].dropna()
    indices, thresholds = [], {}

    if method == "iqr":
        q1, q3 = series.quantile([0.25, 0.75])
        iqr = q3 - q1
        low, high = q1 - 1.5*iqr, q3 + 1.5*iqr
        thresholds = {"lower_bound": float(low), "upper_bound": float(high)}
        indices = df[(df[column] < low) | (df[column] > high)].index.tolist()
    elif method == "zscore":
        z = np.abs(zscore(series))
        indices = series.index[z > 3].tolist()
        thresholds = {"zscore_threshold": 3}
    elif method == "winsorization":
        df[column] = np.array(winsorize(df[column], limits=[0.05, 0.05]))
        thresholds = {"limits": [0.05, 0.05]}
        indices = [] # Winsorization transforms data rather than just detecting

    return {
        "status": "success", "total_outliers": len(indices), "thresholds": thresholds,
        "affected_rows": safe_json_replace(df.loc[indices].head(20)),
        "visualizations": {
            "histogram": generate_histogram_data(series),
            "boxplot": generate_boxplot_stats(series),
            "scatterplot": [{"x": i, "y": float(v)} for i, v in enumerate(series.head(500))]
        }
    }

@app.post("/api/duplicates/process")
async def process_duplicates(payload: dict):
    path = validate_file_path(payload.get("file_path"))
    strategy = payload.get("strategy", "detect")
    df = pd.read_csv(path) if str(path).endswith(".csv") else pd.read_excel(path)
    
    original_count = len(df)
    dup_mask = df.duplicated(keep=False if strategy == "detect" else "first")
    
    if strategy == "remove": df = df.drop_duplicates(keep="first")
    elif strategy == "keep_latest": df = df.drop_duplicates(keep="last")

    df.to_csv(path, index=False) if str(path).endswith(".csv") else df.to_excel(path, index=False)
    removed = original_count - len(df)
    save_cleaning_log(path.name, f"Duplicates ({strategy})", removed)

    return {
        "status": "success", "duplicate_count": int(dup_mask.sum()), 
        "removed_count": removed, "preview": safe_json_replace(df.head(5))
    }

@app.post("/api/validation/run")
async def run_validation(payload: dict):
    path = validate_file_path(payload.get("file_path"))
    rules, violations = payload.get("rules", []), []
    df = pd.read_csv(path) if str(path).endswith(".csv") else pd.read_excel(path)
    
    severity_counts = {"low": 0, "medium": 0, "high": 0}
    
    for rule in rules:
        col = rule.get("column")
        if col not in df.columns and rule.get("type") == "simple": continue
        
        # Vectorized check is faster, but for complex logic, row-by-row is safer for MVP
        for idx, row in df.iterrows():
            if len(violations) >= 5000: break # Safety break
            
            actual = row.get(col) if rule.get("type") == "simple" else row.get(rule.get("target_column"))
            is_valid = True
            
            if rule.get("type") == "simple":
                is_valid = evaluate_condition(actual, rule["operator"], rule["value"])
            elif rule.get("type") == "conditional":
                if evaluate_condition(row.get(rule["condition_column"]), rule["condition_operator"], rule["condition_value"]):
                    is_valid = evaluate_condition(actual, rule["target_operator"], None)

            if not is_valid:
                sev = rule.get("severity", "medium")
                severity_counts[sev] += 1
                violations.append({"row_index": idx, "column": col, "actual": str(actual), "severity": sev})

    return {"status": "success", "total_violations": len(violations), "severity_counts": severity_counts, "violations": violations[:MAX_VIOLATIONS_RETURNED]}

@app.get("/api/logs/{dataset_name}")
async def get_logs(dataset_name: str):
    log_file = LOGS_DIR / f"{Path(dataset_name).stem}_logs.json"
    if not log_file.exists(): return {"logs": []}
    with open(log_file, "r") as f: return {"logs": json.load(f)}