from __future__ import annotations

import logging
from typing import Any

import numpy as np
import pandas as pd

from core.exceptions import WeightingError
from services.statistics.variance_utils import (
    calculate_effective_sample_size,
    calculate_weighted_variance,
)
from services.statistics.ci_utils import (
    calculate_confidence_interval,
    calculate_margin_of_error,
    calculate_standard_error,
    calculate_z_score,
)

try:
    from statsmodels.stats.weightstats import DescrStatsW
except ImportError:
    DescrStatsW = None

logger = logging.getLogger(__name__)


# Custom Typed Exceptions
class EmptyDatasetError(WeightingError):
    """Raised when the input dataframe is empty or becomes empty after filtering."""


class InvalidWeightsError(WeightingError):
    """Raised when weight column has invalid state (negative, non-numeric, all nulls)."""


class InsufficientDataError(WeightingError):
    """Raised when there are insufficient valid observations to perform weighting."""


class ZeroWeightSumError(WeightingError):
    """Raised when the sum of weights is zero or negative."""


def prepare_weighted_data(df: pd.DataFrame, value_column: str, weight_column: str) -> pd.DataFrame:
    """
    Cleans and prepares data for weighted calculations by filtering out non-positive,
    non-numeric, null, or infinite weights.
    """
    if df.empty:
        raise EmptyDatasetError("Input dataset is empty.")

    if value_column not in df.columns:
        raise WeightingError(f"Value column '{value_column}' does not exist.")
    if weight_column not in df.columns:
        raise WeightingError(f"Weight column '{weight_column}' does not exist.")

    working = df[[value_column, weight_column]].copy()
    
    # Clean weight column
    working[weight_column] = pd.to_numeric(working[weight_column], errors='coerce')
    working = working.dropna(subset=[weight_column])
    working = working[np.isfinite(working[weight_column])]
    
    # Filter non-positive weights
    negative_count = (working[weight_column] < 0).sum()
    if negative_count > 0:
        logger.warning(f"Filtered out {negative_count} rows with negative weights.")
    
    working = working[working[weight_column] > 0]
    
    if working.empty:
        raise EmptyDatasetError("No valid rows left after filtering invalid/non-positive weights.")

    return working


def validate_numeric_column(df: pd.DataFrame, column_name: str) -> bool:
    """Checks if a column is numeric."""
    return pd.api.types.is_numeric_dtype(df[column_name])


def calculate_weighted_proportions(
    values: pd.Series, 
    weights: pd.Series, 
    confidence_level: float = 0.95
) -> list[dict[str, Any]]:
    """
    Calculates weighted and unweighted proportions for a categorical column.
    Includes survey-grade standard error, margin of error, and confidence intervals for each category.
    Handles sparse categories, nulls, and high cardinality columns safely.
    """
    # Create aligned frame, treating actual NaNs as explicit category
    frame = pd.DataFrame({
        'category': values.fillna('[Missing]').astype(str),
        'weight': weights.astype(float)
    })

    total_weight = float(frame['weight'].sum())
    total_count = int(len(frame))

    if total_weight <= 0:
        raise ZeroWeightSumError("Total weight sum is zero or negative.")

    # Grouping is highly optimized and vectorized in pandas
    grouped = frame.groupby('category')['weight'].agg(['sum', 'count']).reset_index()
    grouped = grouped.sort_values('sum', ascending=False)

    n_eff = calculate_effective_sample_size(weights.to_numpy())
    z_val = calculate_z_score(confidence_level)

    results: list[dict[str, Any]] = []
    for row in grouped.itertuples(index=False):
        weighted_prop = float(row.sum) / total_weight if total_weight > 0 else 0.0
        unweighted_prop = float(row.count) / total_count if total_count > 0 else 0.0

        # Wald interval approximation using effective sample size
        # Handled standard error correctness for proportion
        if n_eff > 0:
            se = float(np.sqrt(max(weighted_prop * (1.0 - weighted_prop), 0.0) / n_eff))
        else:
            se = 0.0

        moe = float(z_val * se)
        lower = max(0.0, weighted_prop - moe)
        upper = min(1.0, weighted_prop + moe)

        results.append({
            'category': str(row.category),
            'weighted_proportion': round(weighted_prop, 4),
            'unweighted_proportion': round(unweighted_prop, 4),
            'standard_error': round(se, 4),
            'margin_of_error': round(moe, 4),
            'confidence_interval': {
                'lower': round(lower, 4),
                'upper': round(upper, 4)
            }
        })

    return results


def generate_weight_visualization(analysis_type: str, result: dict[str, Any]) -> list[dict[str, Any]]:
    """Generates standard visualization payloads to preserve compatibility with UI components."""
    if analysis_type == 'mean':
        return [
            {'label': 'Weighted Mean', 'value': result.get('weighted_mean', 0.0)},
            {'label': 'Unweighted Mean', 'value': result.get('unweighted_mean', 0.0)},
        ]

    if analysis_type == 'proportion':
        return [
            {
                'label': item.get('category'),
                'weighted': item.get('weighted_proportion', 0.0),
                'unweighted': item.get('unweighted_proportion', 0.0),
                'value': item.get('weighted_proportion', 0.0)  # Safe fallback for chart component yKey
            }
            for item in result.get('proportions', [])
        ]

    return []


def run_weight_estimation(
    df: pd.DataFrame,
    value_column: str,
    weight_column: str,
    analysis_type: str = 'mean',
    confidence_level: float = 0.95,
) -> dict[str, Any]:
    """
    Refactored, survey-grade entrypoint for weighting estimation.
    Executes calculations (weighted mean or proportions), cross-validates against statsmodels,
    and returns a payload satisfying both the legacy and the new standardized response contracts.
    """
    # 1. Input preparation and validation
    clean_df = prepare_weighted_data(df=df, value_column=value_column, weight_column=weight_column)
    
    # 2. Strict type validations
    if not validate_numeric_column(clean_df, weight_column):
        raise InvalidWeightsError("Weight column must contain numeric data.")

    mode = (analysis_type or 'mean').strip().lower()

    if mode in {'mean', 'weighted_mean'}:
        # Ensure values are numeric for mean calculations
        mean_df = clean_df.copy()
        mean_df[value_column] = pd.to_numeric(mean_df[value_column], errors='coerce')
        mean_df = mean_df.dropna(subset=[value_column])

        if mean_df.empty:
            raise InsufficientDataError("No numeric values found in the target column after clearing NaNs.")

        values = mean_df[value_column].to_numpy(dtype=float)
        weights = mean_df[weight_column].to_numpy(dtype=float)

        if len(values) < 1:
            raise InsufficientDataError("Dataset must contain at least one observation for weighted mean.")

        # Compute core metrics using modular utilities
        weighted_mean = float(np.average(values, weights=weights))
        weighted_variance = calculate_weighted_variance(values, weights, ddof=1)
        unweighted_mean = float(np.mean(values))
        effective_n = calculate_effective_sample_size(weights)
        standard_error = calculate_standard_error(weighted_variance, effective_n)
        
        # Determine degrees of freedom for small sample t-adjustments
        df_t = effective_n - 1 if effective_n > 1 else None
        margin_of_error = calculate_margin_of_error(standard_error, confidence_level, df=df_t)
        confidence_interval = calculate_confidence_interval(weighted_mean, margin_of_error)

        # Statsmodels Sanity Validation Check
        if DescrStatsW is not None:
            try:
                dsw = DescrStatsW(values, weights=weights, ddof=1)
                sm_mean = float(dsw.mean)
                sm_var = float(max(dsw.var, 0.0))
                
                # Check convergence/parity within epsilon threshold
                if not np.isclose(weighted_mean, sm_mean, atol=1e-5):
                    logger.warning(f"Weighted mean parity gap detected: Local {weighted_mean} vs Statsmodels {sm_mean}")
                if not np.isclose(weighted_variance, sm_var, atol=1e-5):
                    logger.warning(f"Weighted variance parity gap detected: Local {weighted_variance} vs Statsmodels {sm_var}")
            except Exception as e:
                logger.error(f"Statsmodels validation failure: {str(e)}")

        results_data = {
            'analysis_type': 'weighted_mean',
            'rows_used': len(values),
            'effective_sample_size': round(effective_n, 4),
            'weighted_mean': round(weighted_mean, 4),
            'unweighted_mean': round(unweighted_mean, 4),
            'weighted_variance': round(weighted_variance, 4),
            'standard_error': round(standard_error, 4),
            'margin_of_error': round(margin_of_error, 4),
            'confidence_interval': {
                'lower': round(confidence_interval['lower'], 4),
                'upper': round(confidence_interval['upper'], 4),
            },
        }

        visualizations = generate_weight_visualization('mean', results_data)
        rows_used = len(values)

    elif mode in {'proportion', 'weighted_proportion'}:
        # Categorical support
        proportion_df = clean_df.dropna(subset=[value_column])
        if proportion_df.empty:
            raise InsufficientDataError("No observations left for proportion analysis after dropping nulls.")

        values_series = proportion_df[value_column]
        weights_series = proportion_df[weight_column]
        weights_arr = weights_series.to_numpy(dtype=float)

        proportions = calculate_weighted_proportions(
            values=values_series, 
            weights=weights_series, 
            confidence_level=confidence_level
        )
        effective_n = calculate_effective_sample_size(weights_arr)

        results_data = {
            'analysis_type': 'weighted_proportion',
            'rows_used': len(proportion_df),
            'effective_sample_size': round(effective_n, 4),
            'proportions': proportions,
            'weighted_distribution': proportions,
        }

        visualizations = generate_weight_visualization('proportion', results_data)
        rows_used = len(proportion_df)

    else:
        raise WeightingError(f"Unsupported analysis type: '{analysis_type}'")

    # Convert weights to dict for report consumption
    weights_dict = {str(k): float(v) for k, v in zip(clean_df.index, clean_df[weight_column])}

    # Dual contract output structure:
    # 1. Satisfies new standardized response contract
    # 2. Preserves legacy root-level and nested structure to prevent breaking downstream modules
    return {
        'status': 'success',
        'message': 'Weighting analysis completed',
        'data': {
            **results_data,
            'visualizations': visualizations
        },
        'meta': {
            'confidence_level': float(confidence_level)
        },
        
        # Legacy compatibility keys:
        'rows_used': rows_used,
        'confidence_level': float(confidence_level),
        'results': results_data,
        'visualizations': visualizations,
        'weights': weights_dict,
    }
