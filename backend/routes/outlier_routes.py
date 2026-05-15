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

    if str(path).endswith(".csv"):

        df = pd.read_csv(path)

    else:

        df = pd.read_excel(path)

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

        df[column] = np.array(

            winsorize(
                df[column],
                limits=[0.05, 0.05]
            )
        )

    return {

        "status": "success",

        "total_outliers": len(indices),

        "thresholds": thresholds,

        "affected_rows": safe_json_replace(
            df.loc[indices].head(20)
        ),

        "visualizations": {

            "histogram": generate_histogram_data(
                series
            ),

            "boxplot": generate_boxplot_stats(
                series
            )
        }
    }