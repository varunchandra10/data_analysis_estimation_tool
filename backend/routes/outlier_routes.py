from fastapi import APIRouter
from fastapi import HTTPException

import pandas as pd
import numpy as np

from scipy.stats import zscore
from scipy.stats.mstats import winsorize

from utils.file_utils import (
    validate_file_path,
    safe_json_replace
)

from utils.visualization_utils import (
    generate_histogram_data,
    generate_boxplot_stats
)

from services.versioning_engine import save_stage_dataset, read_dataset_file
from utils.dataset_storage import resolve_dataset_name

router = APIRouter()


@router.post("/api/outliers/detect")
async def detect_outliers(
    payload: dict
):

    path = validate_file_path(
        payload.get("file_path")
    )

    column = payload.get("column")

    method = payload.get("method")

    df = read_dataset_file(path)

    if column not in df.columns:

        raise HTTPException(
            status_code=400,
            detail="Invalid column."
        )

    series = df[column].dropna()

    indices = []

    thresholds = {}

    if method == "iqr":

        q1 = series.quantile(0.25)

        q3 = series.quantile(0.75)

        iqr = q3 - q1

        low = q1 - 1.5 * iqr

        high = q3 + 1.5 * iqr

        thresholds = {

            "lower_bound": float(low),

            "upper_bound": float(high)

        }

        indices = df[
            (df[column] < low)
            |
            (df[column] > high)
        ].index.tolist()

    elif method == "zscore":

        z = np.abs(zscore(series))

        indices = series.index[
            z > 3
        ].tolist()

    elif method == "winsorization":

        # For detection we do not modify the original dataframe; compute capped series for visualization only
        capped = np.array(
            winsorize(
                df[column],
                limits=[0.05, 0.05]
            )
        )

        # compute indices where original differs from capped as the affected rows
        indices = df.index[df[column].notna() & (df[column].astype(float) != capped.astype(float))].tolist()

    # Do NOT save a staged dataset on detection. Return diagnostics only.

    # Build a temporary applied dataframe for preview (do not save yet)
    df_applied = df.copy()
    if method == "iqr":
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        low = q1 - 1.5 * iqr
        high = q3 + 1.5 * iqr
        df_applied = df_applied.drop(index=df_applied[(df_applied[column] < low) | (df_applied[column] > high)].index)
    elif method == "zscore":
        z = np.abs(zscore(series))
        to_drop = series.index[z > 3].tolist()
        df_applied = df_applied.drop(index=to_drop)
    elif method == "winsorization":
        df_applied[column] = np.array(winsorize(df_applied[column], limits=[0.05, 0.05]))

    return {
        "status": "success",
        "file_path": str(path),
        "preview": safe_json_replace(df.head(5)),
        "applied_preview": safe_json_replace(df_applied.head(5)),
        "total_outliers": len(indices),
        "thresholds": thresholds,
        "affected_rows": safe_json_replace(df.loc[indices].head(20)),
        "visualizations": {
            "histogram": generate_histogram_data(series),
            "boxplot": generate_boxplot_stats(series)
        }
    }



@router.post("/api/outliers/apply")
async def apply_outliers(payload: dict):

    path = validate_file_path(payload.get("file_path"))
    column = payload.get("column")
    method = payload.get("method")

    df = read_dataset_file(path)

    if column not in df.columns:
        raise HTTPException(status_code=400, detail="Invalid column.")

    series = df[column].dropna()

    indices = []

    if method == "iqr":
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        low = q1 - 1.5 * iqr
        high = q3 + 1.5 * iqr
        indices = df[(df[column] < low) | (df[column] > high)].index.tolist()

        # drop the outlier rows
        df = df.drop(index=indices)

    elif method == "zscore":
        z = np.abs(zscore(series))
        indices = series.index[z > 3].tolist()
        df = df.drop(index=indices)

    elif method == "winsorization":
        df[column] = np.array(
            winsorize(
                df[column],
                limits=[0.05, 0.05]
            )
        )

    saved_path = save_stage_dataset(
        dataset_source=df,
        dataset_name=resolve_dataset_name(path),
        stage_name="outlier",
        file_extension=path.suffix,
    )

    return {
        "status": "success",
        "file_path": str(saved_path),
        "total_outliers": len(indices),
        "preview": safe_json_replace(df.head(5))
    }
