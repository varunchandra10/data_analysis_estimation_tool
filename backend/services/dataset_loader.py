from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd

from core.config import DATASETS_DIR
from core.exceptions import DatasetNotFoundError
from utils.dataframe_optimizer import optimize_dataframe_memory


def _resolve_path(file_path: str | Path) -> Path:
    path = Path(file_path)
    if not path.is_absolute():
        path = (DATASETS_DIR / path).resolve()
    return path


def infer_file_type(file_path: str | Path) -> str:
    path = Path(file_path)
    ext = path.suffix.lower()
    if path.name.endswith('.csv.gz') or ext in {'.csv', '.gz'}:
        return 'csv'
    if ext in {'.xlsx', '.xls'}:
        return 'xlsx'
    raise ValueError(f'Unsupported file type: {ext}')


def validate_dataset_path(file_path: str | Path) -> Path:
    path = _resolve_path(file_path)
    if not path.exists():
        raise DatasetNotFoundError(f'Dataset not found: {path}')
    if not path.is_file():
        raise DatasetNotFoundError(f'Dataset path is not a file: {path}')
    return path


def load_dataset(file_path: str | Path, optimize: bool = True) -> pd.DataFrame:
    path = validate_dataset_path(file_path)
    file_type = infer_file_type(path)

    if file_type == 'csv':
        df = pd.read_csv(path)
    elif file_type == 'xlsx':
        df = pd.read_excel(path)
    else:
        raise DatasetNotFoundError(f'Unsupported file format: {path.suffix}')

    if optimize:
        try:
            df = optimize_dataframe_memory(df)
        except Exception:
            pass

    return df


def load_dataset_from_buffer(buffer: Any, file_type: str, optimize: bool = True) -> pd.DataFrame:
    if file_type == 'csv':
        df = pd.read_csv(buffer)
    elif file_type == 'xlsx':
        df = pd.read_excel(buffer)
    else:
        raise ValueError(f'Unsupported file format: {file_type}')

    if optimize:
        try:
            df = optimize_dataframe_memory(df)
        except Exception:
            pass

    return df


def save_dataset(df: pd.DataFrame, file_path: str | Path) -> Path:
    path = Path(file_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    ext = path.suffix.lower()
    if ext in {'.csv', '.gz'}:
        df.to_csv(path, index=False)
    elif ext in {'.xlsx', '.xls'}:
        df.to_excel(path, index=False)
    else:
        df.to_csv(path, index=False)
    return path


def get_dataset_metadata(df: pd.DataFrame) -> dict[str, Any]:
    rows = int(df.shape[0])
    cols = int(df.shape[1])
    mem = df.memory_usage(deep=True).sum() / (1024 * 1024)
    return {'rows': rows, 'columns': cols, 'memory_usage_mb': round(float(mem), 4)}
