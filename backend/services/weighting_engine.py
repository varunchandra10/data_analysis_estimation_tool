from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
from scipy.stats import norm

try:
    from statsmodels.stats.weightstats import DescrStatsW
except Exception:  # pragma: no cover - optional runtime fallback
    DescrStatsW = None


def prepare_weighted_data(df: pd.DataFrame, value_column: str, weight_column: str) -> pd.DataFrame:
    working = df[[value_column, weight_column]].copy()
    working[weight_column] = pd.to_numeric(working[weight_column], errors='coerce')
    working = working.dropna(subset=[weight_column])
    working = working[np.isfinite(working[weight_column])]
    working = working[working[weight_column] > 0]
    return working


def validate_numeric_column(df: pd.DataFrame, column_name: str) -> bool:
    return pd.api.types.is_numeric_dtype(df[column_name])


def _effective_sample_size(weights: np.ndarray) -> float:
    weight_sum = float(np.sum(weights))
    squared_sum = float(np.sum(np.square(weights)))
    if weight_sum <= 0 or squared_sum <= 0:
        return 0.0
    return float((weight_sum ** 2) / squared_sum)


def _weighted_mean_variance(values: np.ndarray, weights: np.ndarray) -> tuple[float, float]:
    if DescrStatsW is not None:
        dsw = DescrStatsW(values, weights=weights, ddof=1)
        return float(dsw.mean), float(max(dsw.var, 0.0))

    weighted_mean = float(np.average(values, weights=weights))
    weighted_var = float(np.average((values - weighted_mean) ** 2, weights=weights))
    return weighted_mean, max(weighted_var, 0.0)


def calculate_weighted_mean(values: np.ndarray, weights: np.ndarray) -> float:
    return round(float(np.average(values, weights=weights)), 4)


def calculate_unweighted_mean(values: np.ndarray) -> float:
    return round(float(np.mean(values)), 4)


def calculate_standard_error(weighted_variance: float, effective_n: float) -> float:
    if effective_n <= 0:
        return 0.0
    return float(np.sqrt(max(weighted_variance, 0.0) / effective_n))


def calculate_margin_of_error(standard_error: float, confidence_level: float = 0.95) -> float:
    confidence = min(max(float(confidence_level), 0.5), 0.999)
    z_value = float(norm.ppf(1 - ((1 - confidence) / 2)))
    return round(z_value * standard_error, 4)


def calculate_confidence_interval(estimate: float, margin_of_error: float) -> dict[str, float]:
    lower = estimate - margin_of_error
    upper = estimate + margin_of_error
    return {'lower': round(float(lower), 4), 'upper': round(float(upper), 4)}


def calculate_weighted_proportions(values: pd.Series, weights: pd.Series) -> list[dict[str, Any]]:
    frame = pd.DataFrame({'category': values.astype(str), 'weight': weights.astype(float)})
    total_weight = float(frame['weight'].sum())
    total_count = int(len(frame))

    grouped = frame.groupby('category', dropna=False)['weight'].agg(['sum', 'count']).reset_index()
    grouped = grouped.sort_values('sum', ascending=False)

    results: list[dict[str, Any]] = []
    for row in grouped.itertuples(index=False):
        weighted = float(row.sum) / total_weight if total_weight > 0 else 0.0
        unweighted = float(row.count) / total_count if total_count > 0 else 0.0
        results.append(
            {
                'category': str(row.category),
                'weighted_proportion': round(weighted, 4),
                'unweighted_proportion': round(unweighted, 4),
            }
        )

    return results


def generate_weight_visualization(analysis_type: str, result: dict[str, Any]) -> list[dict[str, Any]]:
    if analysis_type == 'mean':
        return [
            {'label': 'Weighted Mean', 'value': result.get('weighted_mean', 0)},
            {'label': 'Unweighted Mean', 'value': result.get('unweighted_mean', 0)},
        ]

    if analysis_type == 'proportion':
        return [
            {
                'label': item.get('category'),
                'weighted': item.get('weighted_proportion'),
                'unweighted': item.get('unweighted_proportion'),
            }
            for item in result.get('proportions', [])
        ]

    return []


def _clean_for_mean(clean_df: pd.DataFrame, value_column: str, weight_column: str) -> tuple[np.ndarray, np.ndarray]:
    mean_df = clean_df.copy()
    mean_df[value_column] = pd.to_numeric(mean_df[value_column], errors='coerce')
    mean_df = mean_df.dropna(subset=[value_column])

    if mean_df.empty:
        raise ValueError('No valid rows for weighted mean after removing nulls/non-numeric values.')

    values = mean_df[value_column].to_numpy(dtype=float)
    weights = mean_df[weight_column].to_numpy(dtype=float)
    return values, weights


def run_weight_estimation(
    df: pd.DataFrame,
    value_column: str,
    weight_column: str,
    analysis_type: str = 'mean',
    confidence_level: float = 0.95,
) -> dict[str, Any]:
    clean_df = prepare_weighted_data(df=df, value_column=value_column, weight_column=weight_column)
    if clean_df.empty:
        raise ValueError('No valid rows after filtering null/invalid/zero weights.')

    if not validate_numeric_column(clean_df, weight_column):
        raise ValueError('Weight column must be numeric.')

    mode = (analysis_type or 'mean').strip().lower()

    if mode in {'mean', 'weighted_mean'}:
        values, weights = _clean_for_mean(clean_df, value_column, weight_column)

        weighted_mean, weighted_variance = _weighted_mean_variance(values, weights)
        unweighted_mean = float(np.mean(values))
        effective_n = _effective_sample_size(weights)
        standard_error = calculate_standard_error(weighted_variance, effective_n)
        margin_of_error = calculate_margin_of_error(standard_error, confidence_level)
        confidence_interval = calculate_confidence_interval(weighted_mean, margin_of_error)

        result = {
            'analysis_type': 'weighted_mean',
            'weighted_mean': round(weighted_mean, 4),
            'unweighted_mean': round(unweighted_mean, 4),
            'weighted_variance': round(weighted_variance, 4),
            'standard_error': round(standard_error, 4),
            'margin_of_error': round(margin_of_error, 4),
            'confidence_interval': confidence_interval,
            'effective_sample_size': round(effective_n, 4),
        }

        rows_used = int(len(values))
        visualizations = generate_weight_visualization('mean', result)

    elif mode in {'proportion', 'weighted_proportion'}:
        proportion_df = clean_df.dropna(subset=[value_column])
        if proportion_df.empty:
            raise ValueError('No valid rows for weighted proportions after removing null values.')

        values = proportion_df[value_column]
        weights = proportion_df[weight_column].to_numpy(dtype=float)
        proportions = calculate_weighted_proportions(values=values, weights=proportion_df[weight_column])
        effective_n = _effective_sample_size(weights)

        result = {
            'analysis_type': 'weighted_proportion',
            'proportions': proportions,
            'weighted_distribution': proportions,
            'effective_sample_size': round(effective_n, 4),
        }

        rows_used = int(len(proportion_df))
        visualizations = generate_weight_visualization('proportion', result)

    else:
        raise ValueError('Invalid analysis type. Use mean or proportion.')

    return {
        'rows_used': rows_used,
        'confidence_level': float(confidence_level),
        'results': result,
        'visualizations': visualizations,
    }
