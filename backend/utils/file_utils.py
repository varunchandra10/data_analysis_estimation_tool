from pathlib import Path
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


def safe_json_replace(data):

    """
    Replace NaN / Inf with None
    for JSON serialization.
    """

    if isinstance(data, pd.DataFrame):

        return data.replace({

            np.nan: None,
            np.inf: None,
            -np.inf: None

        }).to_dict(orient="records")

    elif isinstance(data, dict):

        cleaned = {}

        for key, value in data.items():

            if pd.isna(value):

                cleaned[key] = None

            else:

                cleaned[key] = value

        return cleaned

    return data