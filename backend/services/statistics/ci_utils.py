from __future__ import annotations

import numpy as np
from scipy.stats import norm, t


def calculate_z_score(confidence_level: float) -> float:
    """Calculates the two-tailed critical Z-score for a given confidence level."""
    confidence = min(max(float(confidence_level), 0.5), 0.999)
    return float(norm.ppf(1 - ((1 - confidence) / 2)))


def calculate_t_score(confidence_level: float, df: float) -> float:
    """Calculates the two-tailed critical t-score for a given confidence level and degrees of freedom."""
    confidence = min(max(float(confidence_level), 0.5), 0.999)
    if df <= 0:
        return calculate_z_score(confidence)
    return float(t.ppf(1 - ((1 - confidence) / 2), df=df))


def calculate_standard_error(variance: float, n_eff: float) -> float:
    """
    Computes standard error of the weighted mean:
    SE = sqrt(variance / n_eff)
    """
    if n_eff <= 0 or variance < 0:
        return 0.0
    return float(np.sqrt(variance / n_eff))


def calculate_margin_of_error(standard_error: float, confidence_level: float = 0.95, df: float | None = None) -> float:
    """
    Computes margin of error. If degrees of freedom (df) is provided, uses t-distribution.
    Otherwise uses Z-distribution.
    """
    if df is not None and df > 0:
        critical_value = calculate_t_score(confidence_level, df)
    else:
        critical_value = calculate_z_score(confidence_level)
    return float(critical_value * standard_error)


def calculate_confidence_interval(estimate: float, margin_of_error: float) -> dict[str, float]:
    """Computes the confidence interval limits."""
    lower = estimate - margin_of_error
    upper = estimate + margin_of_error
    return {
        'lower': float(lower),
        'upper': float(upper)
    }
