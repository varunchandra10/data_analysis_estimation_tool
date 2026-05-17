from pathlib import Path
import math

from fastapi import HTTPException
import pandas as pd
import numpy as np


def validate_file_path(file_path: str):

    path = Path(file_path)

    if not path.exists():

        raise HTTPException(
            status_code=404,
            detail="Dataset file not found."
        )

    return path


def load_dataframe_from_path(file_path: str | Path):

    path = Path(file_path)
    file_name = path.name.lower()

    if file_name.endswith(".csv") or file_name.endswith(".csv.gz") or path.suffix.lower() == ".gz":

        return pd.read_csv(path)

    if path.suffix.lower() in {".xlsx", ".xls"}:

        return pd.read_excel(path)

    return pd.read_csv(path)


def safe_json_replace(data):

    """
    Replace NaN / Inf with None
    for JSON serialization.
    """

    if isinstance(data, pd.DataFrame):
        sanitized = data.replace({
            np.nan: None,
            np.inf: None,
            -np.inf: None
        })
        return safe_json_replace(
            sanitized.to_dict(orient="records")
        )

    if isinstance(data, dict):
        cleaned = {}
        for key, value in data.items():
            cleaned[key] = safe_json_replace(value)
        return cleaned

    if isinstance(data, list):
        return [
            safe_json_replace(item)
            for item in data
        ]

    if isinstance(data, tuple):
        return tuple(
            safe_json_replace(item)
            for item in data
        )

    if isinstance(data, np.generic):
        return safe_json_replace(data.item())

    if data is None:
        return None

    if isinstance(data, float) and not math.isfinite(data):
        return None

    try:
        if pd.isna(data):
            return None
    except TypeError:
        pass

    return data
