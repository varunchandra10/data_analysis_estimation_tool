from __future__ import annotations

import logging
from typing import Any, Optional
import numpy as np
import pandas as pd

from core.exceptions import WeightingError

logger = logging.getLogger(__name__)


class IPFConvergenceError(WeightingError):
    """Raised when Iterative Proportional Fitting fails to converge within max iterations."""


class InvalidMarginalsError(WeightingError):
    """Raised when target marginals are malformed or invalid."""


def normalize_target_margins(target_margins: dict[str, dict[str, float]]) -> dict[str, dict[str, float]]:
    """
    Normalizes target marginal proportions for each dimension so they sum to 1.0.
    Accepts probabilities (summing to ~1.0) or raw census totals / percentages (summing to ~100 or total population).
    """
    normalized: dict[str, dict[str, float]] = {}

    for dim, targets in target_margins.items():
        if not isinstance(targets, dict) or not targets:
            raise InvalidMarginalsError(f"Target marginals for dimension '{dim}' must be a non-empty dictionary.")

        total = sum(float(val) for val in targets.values())
        if total <= 0:
            raise InvalidMarginalsError(f"Target marginal sum for dimension '{dim}' must be strictly positive.")

        normalized[dim] = {str(cat): float(val) / total for cat, val in targets.items()}

    return normalized


def run_iterative_proportional_fitting(
    df: pd.DataFrame,
    target_margins: dict[str, dict[str, float]],
    base_weight_column: Optional[str] = None,
    output_weight_column: str = "calibrated_weight",
    max_iter: int = 100,
    epsilon: float = 1e-4,
    trim_lower: Optional[float] = None,
    trim_upper: Optional[float] = None,
) -> dict[str, Any]:
    """
    Executes survey calibration via true multidimensional Iterative Proportional Fitting (Raking).

    Parameters:
    - df: Input pandas DataFrame
    - target_margins: Dict mapping column names to target category proportions, e.g.:
        {"gender": {"M": 0.49, "F": 0.51}, "region": {"Urban": 0.35, "Rural": 0.65}}
    - base_weight_column: Optional existing design weight column to scale from.
    - output_weight_column: Column name for the resulting calibrated weights.
    - max_iter: Maximum number of raking iterations.
    - epsilon: Convergence threshold based on maximum absolute weight change between iterations.
    - trim_lower: Optional minimum weight clamp threshold.
    - trim_upper: Optional maximum weight clamp threshold.

    Returns:
    - Dictionary with calibrated weights, diagnostics, Kish ESS, and marginal comparisons.
    """
    if df.empty:
        raise WeightingError("Cannot run IPF raking on an empty dataset.")

    if not target_margins:
        raise InvalidMarginalsError("At least one dimension with target marginals is required.")

    # Validate target columns exist in dataset
    for dim in target_margins.keys():
        if dim not in df.columns:
            raise InvalidMarginalsError(f"Target dimension column '{dim}' not found in dataset columns.")

    normalized_targets = normalize_target_margins(target_margins)
    n_records = len(df)

    # 1. Initialize base weights w^(0)
    if base_weight_column and base_weight_column in df.columns:
        raw_weights = pd.to_numeric(df[base_weight_column], errors="coerce").fillna(1.0).to_numpy(dtype=float)
        # Ensure positive weights
        raw_weights = np.where(raw_weights > 0, raw_weights, 1.0)
        weights = raw_weights.copy()
    else:
        weights = np.ones(n_records, dtype=float)

    # Pre-extract category series as clean string arrays
    categories_per_dim: dict[str, np.ndarray] = {
        dim: df[dim].fillna("[Missing]").astype(str).to_numpy()
        for dim in normalized_targets.keys()
    }

    # Verify that all sample categories have target proportions defined
    for dim, targets in normalized_targets.items():
        sample_cats = set(np.unique(categories_per_dim[dim]))
        target_cats = set(targets.keys())
        missing_in_target = sample_cats - target_cats
        if missing_in_target:
            # Assign uniform small epsilon share or redistribute
            logger.warning(
                f"Dimension '{dim}' has sample categories not in targets: {missing_in_target}. Defaulting target to equal small share."
            )
            # Rebalance targets to include missing sample categories with 0.001
            rebalanced = dict(targets)
            for m in missing_in_target:
                rebalanced[m] = 0.001
            total = sum(rebalanced.values())
            normalized_targets[dim] = {k: v / total for k, v in rebalanced.items()}

    # 2. Iterative Raking Loop
    converged = False
    iteration_history = []
    final_iteration = 0
    final_max_diff = float("inf")

    for t in range(1, max_iter + 1):
        prev_weights = weights.copy()

        for dim, targets in normalized_targets.items():
            sample_cats = categories_per_dim[dim]
            total_weight = np.sum(weights)
            if total_weight <= 0:
                raise WeightingError("Total weight sum collapsed to zero during raking.")

            # Calculate current weighted proportion for each category
            for cat, target_prop in targets.items():
                cat_mask = (sample_cats == cat)
                cat_weight_sum = np.sum(weights[cat_mask])

                if cat_weight_sum > 0:
                    current_prop = cat_weight_sum / total_weight
                    factor = target_prop / current_prop
                    weights[cat_mask] *= factor

        # Optional trimming to prevent extreme outlier weights
        if trim_lower is not None:
            weights = np.maximum(weights, float(trim_lower))
        if trim_upper is not None:
            weights = np.minimum(weights, float(trim_upper))

        # Check convergence: max absolute difference across all observations
        max_diff = float(np.max(np.abs(weights - prev_weights)))
        iteration_history.append({"iteration": t, "max_diff": round(max_diff, 6)})
        final_iteration = t
        final_max_diff = max_diff

        if max_diff < epsilon:
            converged = True
            break

    # 3. Post-calibration normalization: preserve original population or sample scale
    # Standard survey practice: scale weights so sum(weights) == n_records
    target_sum = float(n_records)
    current_sum = float(np.sum(weights))
    if current_sum > 0:
        weights = weights * (target_sum / current_sum)

    # 4. Compute Statistical Diagnostics
    # Kish Effective Sample Size n_eff = (sum w)^2 / sum(w^2)
    sum_w = float(np.sum(weights))
    sum_w_sq = float(np.sum(weights ** 2))
    kish_ess = (sum_w ** 2) / sum_w_sq if sum_w_sq > 0 else 0.0
    kish_deff = n_records / kish_ess if kish_ess > 0 else 1.0

    # 5. Build Marginal Comparison Table
    marginal_comparisons: list[dict[str, Any]] = []
    total_calibrated_weight = float(np.sum(weights))

    for dim, targets in normalized_targets.items():
        sample_cats = categories_per_dim[dim]
        for cat, target_prop in targets.items():
            cat_mask = (sample_cats == cat)
            unweighted_count = int(np.sum(cat_mask))
            unweighted_prop = unweighted_count / n_records if n_records > 0 else 0.0

            calibrated_cat_weight = float(np.sum(weights[cat_mask]))
            calibrated_prop = (
                calibrated_cat_weight / total_calibrated_weight
                if total_calibrated_weight > 0
                else 0.0
            )

            marginal_comparisons.append({
                "dimension": dim,
                "category": cat,
                "unweighted_proportion": round(unweighted_prop, 4),
                "target_proportion": round(target_prop, 4),
                "calibrated_proportion": round(calibrated_prop, 4),
                "residual_error": round(abs(calibrated_prop - target_prop), 5),
            })

    result_df = df.copy()
    result_df[output_weight_column] = np.round(weights, 5)

    return {
        "converged": converged,
        "iterations": final_iteration,
        "max_diff": round(final_max_diff, 6),
        "kish_effective_sample_size": round(kish_ess, 2),
        "kish_design_effect": round(kish_deff, 3),
        "sample_size": n_records,
        "weight_column": output_weight_column,
        "weight_distribution": {
            "min": round(float(np.min(weights)), 4),
            "max": round(float(np.max(weights)), 4),
            "mean": round(float(np.mean(weights)), 4),
            "median": round(float(np.median(weights)), 4),
            "std": round(float(np.std(weights)), 4),
            "p5": round(float(np.percentile(weights, 5)), 4),
            "p95": round(float(np.percentile(weights, 95)), 4),
        },
        "marginal_comparisons": marginal_comparisons,
        "iteration_history": iteration_history[:15],
        "df": result_df,
    }

