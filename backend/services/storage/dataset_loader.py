from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path
from typing import Any
import pandas as pd

from core.exceptions import DatasetNotFoundError
from utils.dataframe_optimizer import optimize_dataframe_memory
from utils.file_utils import resolve_safe_path
from utils.hash_utils import generate_sha256
from utils.log_utils import logger
from core.database import SessionLocal
from models.dataset_model import Dataset
from models.version_model import Version

def infer_file_type(file_path: str | Path) -> str:
    path = Path(file_path)
    ext = path.suffix.lower()
    if path.name.endswith('.csv.gz') or ext in {'.csv', '.gz'}:
        return 'csv'
    if ext in {'.xlsx', '.xls'}:
        return 'xlsx'
    raise ValueError(f'Unsupported file type: {ext}')


def validate_dataset_path(file_path: str | Path) -> Path:
    path = resolve_safe_path(file_path)
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
        except Exception as opt_err:
            logger.debug(f'load_dataset: memory optimization skipped for {path}: {opt_err}')

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
        except Exception as opt_err:
            logger.debug(f'load_dataset_from_buffer: memory optimization skipped: {opt_err}')

    return df


def save_dataset(df: pd.DataFrame, file_path: str | Path) -> Path:
    target_path = resolve_safe_path(file_path)
    target_path.parent.mkdir(parents=True, exist_ok=True)
    
    # 1. Write atomically to a temp file in the same directory first
    temp_fd, temp_path_str = tempfile.mkstemp(
        dir=str(target_path.parent),
        suffix=target_path.suffix,
        prefix="temp_save_"
    )
    os.close(temp_fd)
    temp_path = Path(temp_path_str)
    
    try:
        ext = target_path.suffix.lower()
        if ext in {'.csv', '.gz'}:
            df.to_csv(temp_path, index=False)
        elif ext in {'.xlsx', '.xls'}:
            df.to_excel(temp_path, index=False)
        else:
            df.to_csv(temp_path, index=False)
            
        # 2. Rename/move temp file to target path (atomic replace)
        shutil.move(str(temp_path), str(target_path))
    except Exception as e:
        if temp_path.exists():
            try:
                temp_path.unlink()
            except Exception:
                pass
        raise e
        
    # 3. Update checksum in database if registry exists
    try:
        checksum = generate_sha256(target_path)
        size = target_path.stat().st_size
    except Exception as io_err:
        logger.error(f"Failed to generate checksum/size for file {target_path}: {io_err}", exc_info=True)
        raise io_err

    db = SessionLocal()
    try:
        ds = db.query(Dataset).filter(Dataset.file_path == str(target_path)).first()
        if ds:
            ds.checksum = checksum
            ds.size = size
        
        ver = db.query(Version).filter(Version.file_path == str(target_path)).first()
        if ver:
            ver.checksum = checksum
        
        db.commit()
    except Exception as db_err:
        db.rollback()
        logger.error(f"Database error during save_dataset checksum synchronization for {target_path}: {db_err}", exc_info=True)
    finally:
        db.close()
        
    return target_path


def get_dataset_metadata(df: pd.DataFrame) -> dict[str, Any]:
    rows = int(df.shape[0])
    cols = int(df.shape[1])
    mem = df.memory_usage(deep=True).sum() / (1024 * 1024)
    return {'rows': rows, 'columns': cols, 'memory_usage_mb': round(float(mem), 4)}
