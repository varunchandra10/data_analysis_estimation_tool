from __future__ import annotations

import numpy as np


def calculate_effective_sample_size(weights: np.ndarray) -> float:
    """
    Computes Kish's Effective Sample Size:
    n_eff = (sum(w))^2 / sum(w^2)
    """
    weights = np.asarray(weights, dtype=float)
    if weights.size == 0:
        return 0.0
    weight_sum = float(np.sum(weights))
    squared_sum = float(np.sum(np.square(weights)))
    if weight_sum <= 0 or squared_sum <= 0:
        return 0.0
    return (weight_sum ** 2) / squared_sum


def calculate_weighted_variance(values: np.ndarray, weights: np.ndarray, ddof: int = 1) -> float:
    """
    Computes weighted variance, matching statsmodels DescrStatsW.
    Uses:
        s_w^2 = sum(w_i * (x_i - mean_w)^2) / (sum(w_i) - ddof)
    """
    values = np.asarray(values, dtype=float)
    weights = np.asarray(weights, dtype=float)
    
    if values.size == 0 or weights.size == 0 or values.size != weights.size:
        return 0.0
        
    sum_w = float(np.sum(weights))
    if sum_w <= ddof:
        return 0.0
        
    mean_w = float(np.average(values, weights=weights))
    variance_numerator = float(np.sum(weights * (values - mean_w) ** 2))
    
    return variance_numerator / (sum_w - ddof)


def calculate_weighted_std(values: np.ndarray, weights: np.ndarray, ddof: int = 1) -> float:
    """Computes weighted standard deviation."""
    return float(np.sqrt(max(calculate_weighted_variance(values, weights, ddof=ddof), 0.0)))
