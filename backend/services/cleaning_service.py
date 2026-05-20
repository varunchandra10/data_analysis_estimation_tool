from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
from sklearn.impute import KNNImputer, SimpleImputer

from services.versioning_engine import read_dataset_file, save_stage_dataset
from utils.dataset_storage import resolve_dataset_name
from utils.file_utils import safe_json_replace, validate_file_path
from utils.log_utils import log_calls, save_cleaning_log
from utils.visualization_utils import generate_boxplot_stats, generate_histogram_data


@log_calls
async def clean_missing_values_service(payload: dict[str, Any]) -> dict[str, Any]:
    path = validate_file_path(payload.get('file_path'))
    strategies = payload.get('strategies', {})
    df = read_dataset_file(path)

    before_count = int(df.isnull().sum().sum())

    for column, strategy in strategies.items():
        if column not in df.columns:
            continue

        if strategy in {'mean', 'median', 'most_frequent'}:
            imputer = SimpleImputer(strategy=strategy)
            df[[column]] = imputer.fit_transform(df[[column]])
        elif strategy == 'knn':
            num_cols = df.select_dtypes(include=[np.number]).columns
            imputer = KNNImputer(n_neighbors=5)
            df[num_cols] = imputer.fit_transform(df[num_cols])

    saved_path = save_stage_dataset(
        dataset_source=df,
        dataset_name=resolve_dataset_name(path),
        stage_name='clean',
        file_extension=path.suffix,
    )

    rows_affected = int(before_count - df.isnull().sum().sum())
    save_cleaning_log(
        dataset_name=resolve_dataset_name(path),
        operation='Missing Value Cleaning',
        rows_affected=rows_affected,
        details={'strategies': strategies},
    )

    return {
        'status': 'success',
        'file_path': str(saved_path),
        'rows_affected': rows_affected,
        'null_counts': df.isnull().sum().to_dict(),
        'preview': safe_json_replace(df.head(5)),
    }


@log_calls
async def process_duplicates_service(payload: dict[str, Any]) -> dict[str, Any]:
    path = validate_file_path(payload.get('file_path'))
    strategy = payload.get('strategy', 'detect')
    df = read_dataset_file(path)

    original_count = len(df)
    duplicate_mask = df.duplicated(keep=False)

    if strategy == 'remove':
        df = df.drop_duplicates(keep='first')
    elif strategy == 'keep_latest':
        df = df.drop_duplicates(keep='last')

    saved_path = save_stage_dataset(
        dataset_source=df,
        dataset_name=resolve_dataset_name(path),
        stage_name='deduplicated',
    )

    removed_count = original_count - len(df)
    save_cleaning_log(
        dataset_name=resolve_dataset_name(path),
        operation='Duplicate Handling',
        rows_affected=removed_count,
    )

    return {
        'status': 'success',
        'file_path': str(saved_path),
        'duplicate_count': int(duplicate_mask.sum()),
        'removed_count': removed_count,
        'preview': safe_json_replace(df.head(5)),
    }


@log_calls
async def apply_outliers_service(payload: dict[str, Any]) -> dict[str, Any]:
    from scipy.stats import zscore
    from scipy.stats.mstats import winsorize

    path = validate_file_path(payload.get('file_path'))
    column = payload.get('column')
    method = payload.get('method')
    df = read_dataset_file(path)

    if column not in df.columns:
        raise ValueError('Invalid column.')

    series = df[column].dropna()
    indices: list[int] = []
    thresholds: dict[str, float] = {}

    if method == 'iqr':
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        low = q1 - 1.5 * iqr
        high = q3 + 1.5 * iqr
        thresholds = {'lower_bound': float(low), 'upper_bound': float(high)}
        indices = df[(df[column] < low) | (df[column] > high)].index.tolist()
    elif method == 'zscore':
        z = np.abs(zscore(series))
        indices = series.index[z > 3].tolist()
    elif method == 'winsorization':
        capped = np.array(winsorize(df[column], limits=[0.05, 0.05]))
        indices = df.index[df[column].notna() & (df[column].astype(float) != capped.astype(float))].tolist()

    df_applied = df.copy()
    if method == 'iqr':
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        low = q1 - 1.5 * iqr
        high = q3 + 1.5 * iqr
        df_applied = df_applied.drop(index=df_applied[(df_applied[column] < low) | (df_applied[column] > high)].index)
    elif method == 'zscore':
        z = np.abs(zscore(series))
        to_drop = series.index[z > 3].tolist()
        df_applied = df_applied.drop(index=to_drop)
    elif method == 'winsorization':
        df_applied[column] = np.array(winsorize(df_applied[column], limits=[0.05, 0.05]))

    saved_path = save_stage_dataset(
        dataset_source=df_applied,
        dataset_name=resolve_dataset_name(path),
        stage_name='outlier_detected',
        file_extension=path.suffix,
    )
    save_cleaning_log(
        dataset_name=resolve_dataset_name(path),
        operation='Outlier Handling',
        rows_affected=len(indices),
        details={'column': column, 'method': method, 'thresholds': thresholds},
    )

    return {
        'status': 'success',
        'file_path': str(saved_path),
        'preview': safe_json_replace(df.head(5)),
        'applied_preview': safe_json_replace(df_applied.head(5)),
        'total_outliers': len(indices),
        'thresholds': thresholds,
        'affected_rows': safe_json_replace(df.loc[indices].head(20)),
        'visualizations': {
            'histogram': generate_histogram_data(series),
            'boxplot': generate_boxplot_stats(series),
        },
    }
