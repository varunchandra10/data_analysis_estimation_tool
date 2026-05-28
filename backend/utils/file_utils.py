from pathlib import Path
import math

from fastapi import HTTPException
import pandas as pd
import numpy as np

from core.config import REPORTS_DIR
from utils.dataset_storage import DATASETS_ROOT, TEMP_ROOT


def resolve_safe_path(path: str | Path, allowed_roots: list[Path] = None) -> Path:
    p = Path(path)
    if not p.is_absolute():
        p = DATASETS_ROOT / p
    
    resolved = p.resolve(strict=False)
    
    if allowed_roots is None:
        from core.config import BASE_DIR
        ai_cache_root = BASE_DIR / "backend" / "ai_cache"
        allowed_roots = [
            DATASETS_ROOT.resolve(strict=False),
            REPORTS_DIR.resolve(strict=False),
            TEMP_ROOT.resolve(strict=False),
            ai_cache_root.resolve(strict=False),
        ]
    else:
        allowed_roots = [Path(r).resolve(strict=False) for r in allowed_roots]
        
    is_safe = False
    for root in allowed_roots:
        try:
            resolved.relative_to(root)
            is_safe = True
            break
        except ValueError:
            continue
            
    if not is_safe:
        raise HTTPException(
            status_code=403,
            detail="Access to the requested file path is not allowed."
        )
    return resolved


def validate_file_path(file_path: str):
    path = resolve_safe_path(file_path)
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset file not found."
        )
    return path


def load_dataframe_from_path(file_path: str | Path):
    path = resolve_safe_path(file_path)
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
