from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import shutil
from pathlib import Path
import math

app = FastAPI(title="DAET API", description="Data Analysis Estimation Tool API")

# Setup CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Datasets directory relative to backend (mospi-daet/datasets)
BASE_DIR = Path(__file__).resolve().parent.parent
DATASETS_DIR = BASE_DIR / "datasets"
DATASETS_DIR.mkdir(parents=True, exist_ok=True)

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
            # For objects, check cardinality to infer if it's Categorical
            n_unique = df[col].nunique()
            n_total = max(len(df), 1)
            if n_unique < 20 or (n_unique / n_total) < 0.5:
                col_type = "Categorical"
            else:
                # Try to parse as date using the first few non-null rows
                sample = df[col].dropna().head(5)
                if not sample.empty:
                    try:
                        pd.to_datetime(sample)
                        col_type = "Date"
                    except Exception:
                        col_type = "Text"
                        
        schema.append({
            "column": col,
            "type": col_type,
            "pandas_dtype": dtype
        })
    return schema

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV and XLSX files are supported")
        
    file_path = DATASETS_DIR / file.filename
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Parse the dataset
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
            
        # Basic metadata
        rows, cols = df.shape
        
        # Calculate null counts
        null_counts = df.isnull().sum().to_dict()
        
        # Get schema inference
        schema = infer_schema(df)
        
        # Get preview data (first 5 rows), replace NaN with None for JSON serialization
        preview_df = df.head(5).replace({float('nan'): None})
        preview = preview_df.to_dict(orient="records")
        
        return {
            "status": "success",
            "metadata": {
                "filename": file.filename,
                "file_path": str(file_path),
                "rows": rows,
                "columns": cols,
                "null_counts": null_counts,
            },
            "schema": schema,
            "preview": preview
        }
        
    except Exception as e:
        # If parsing fails, remove the file
        if file_path.exists():
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to parse dataset: {str(e)}")

@app.get("/")
def root():
    return {"message": "DAET Backend is running"}
