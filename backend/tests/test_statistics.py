from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
import pytest

from core.exceptions import WeightingError
from services.statistics.variance_utils import (
    calculate_effective_sample_size,
    calculate_weighted_variance,
    calculate_weighted_std,
)
from services.statistics.ci_utils import (
    calculate_confidence_interval,
    calculate_margin_of_error,
    calculate_standard_error,
    calculate_z_score,
    calculate_t_score,
)
from services.statistics.weighting_engine import (
    run_weight_estimation,
    prepare_weighted_data,
    EmptyDatasetError,
    InvalidWeightsError,
    InsufficientDataError,
    ZeroWeightSumError,
)

try:
    from statsmodels.stats.weightstats import DescrStatsW
except ImportError:
    DescrStatsW = None


def test_effective_sample_size():
    # Equal weights -> ESS equals sample size
    w_equal = np.array([2.0, 2.0, 2.0, 2.0])
    assert np.isclose(calculate_effective_sample_size(w_equal), 4.0)

    # Skewed weights -> ESS is smaller
    w_skewed = np.array([1.0, 1.0, 8.0])
    # (10)^2 / (1 + 1 + 64) = 100 / 66 = 1.51515
    assert np.isclose(calculate_effective_sample_size(w_skewed), 100.0 / 66.0)

    # Empty array
    assert calculate_effective_sample_size(np.array([])) == 0.0

    # Negative sum or zero sum
    assert calculate_effective_sample_size(np.array([0.0, 0.0])) == 0.0


def test_weighted_variance_and_std():
    values = np.array([10.0, 20.0, 30.0])
    weights = np.array([1.0, 2.0, 1.0])

    # Unbiased weighted variance (ddof=1) - matching statsmodels default
    # Mean = (10*1 + 20*2 + 30*1) / 4 = 80 / 4 = 20.0
    # Num = 1*(10-20)^2 + 2*(20-20)^2 + 1*(30-20)^2 = 100 + 0 + 100 = 200.0
    # Denom = 4 - 1 = 3.0
    # Var = 200 / 3.0 = 66.6667
    var_unbiased = calculate_weighted_variance(values, weights, ddof=1)
    assert np.isclose(var_unbiased, 200.0 / 3.0)

    # Std
    assert np.isclose(calculate_weighted_std(values, weights, ddof=1), np.sqrt(200.0 / 3.0))

    # Biased population variance (ddof=0)
    # Var = 200.0 / 4.0 = 50.0
    var_biased = calculate_weighted_variance(values, weights, ddof=0)
    assert np.isclose(var_biased, 50.0)

    # Parity with statsmodels if available
    if DescrStatsW is not None:
        dsw = DescrStatsW(values, weights=weights, ddof=1)
        assert np.isclose(var_unbiased, dsw.var)
        assert np.isclose(float(dsw.mean), 20.0)


def test_ci_helpers():
    # Z-scores
    z_95 = calculate_z_score(0.95)
    assert np.isclose(z_95, 1.9599639845400542)

    z_90 = calculate_z_score(0.90)
    assert np.isclose(z_90, 1.6448536269514722)

    # T-scores
    t_95_df10 = calculate_t_score(0.95, df=10)
    assert np.isclose(t_95_df10, 2.2281388519649385)

    # SE
    assert np.isclose(calculate_standard_error(80.0, 4.0), np.sqrt(80.0 / 4.0))
    assert calculate_standard_error(80.0, 0.0) == 0.0

    # MoE
    se = 2.0
    moe_z = calculate_margin_of_error(se, 0.95)
    assert np.isclose(moe_z, z_95 * se)

    moe_t = calculate_margin_of_error(se, 0.95, df=10)
    assert np.isclose(moe_t, t_95_df10 * se)

    # CI
    ci = calculate_confidence_interval(100.0, 5.0)
    assert ci == {'lower': 95.0, 'upper': 105.0}


def test_prepare_weighted_data():
    df = pd.DataFrame({
        'val': [1.0, 2.0, 3.0, 4.0, 5.0],
        'weight': [1.0, -1.0, 0.0, np.nan, 2.0]
    })
    cleaned = prepare_weighted_data(df, 'val', 'weight')
    
    # Should only keep rows 0 and 4 (positive, non-null numeric weights)
    assert len(cleaned) == 2
    assert cleaned.iloc[0]['val'] == 1.0
    assert cleaned.iloc[1]['val'] == 5.0

    # Error handling
    with pytest.raises(EmptyDatasetError):
        prepare_weighted_data(pd.DataFrame(), 'val', 'weight')

    with pytest.raises(WeightingError):
        prepare_weighted_data(df, 'missing_val', 'weight')


def test_run_weight_estimation_mean():
    df = pd.DataFrame({
        'val': [10.0, 20.0, 30.0],
        'weight': [1.0, 2.0, 1.0]
    })

    result = run_weight_estimation(df, 'val', 'weight', analysis_type='mean', confidence_level=0.95)

    # Assert new contract structure
    assert result['status'] == 'success'
    assert result['message'] == 'Weighting analysis completed'
    assert 'data' in result
    assert 'meta' in result

    data = result['data']
    assert data['analysis_type'] == 'weighted_mean'
    assert data['rows_used'] == 3
    assert np.isclose(data['weighted_mean'], 20.0)
    assert np.isclose(data['unweighted_mean'], 20.0)
    assert np.isclose(data['weighted_variance'], 200.0 / 3.0)
    assert np.isclose(data['effective_sample_size'], round(16.0 / 6.0, 4))  # (4)^2 / (1^2 + 2^2 + 1^2) = 16/6 = 2.6667
    
    # Legacy keys compatibility
    assert result['rows_used'] == 3
    assert result['confidence_level'] == 0.95
    assert result['results']['weighted_mean'] == 20.0
    assert len(result['visualizations']) == 2
    assert 'weights' in result
    assert len(result['weights']) == 3


def test_run_weight_estimation_proportion():
    df = pd.DataFrame({
        'category': ['A', 'B', 'A', 'C', 'B'],
        'weight': [1.0, 2.0, 1.0, 1.0, 5.0]
    })

    result = run_weight_estimation(df, 'category', 'weight', analysis_type='proportion', confidence_level=0.95)

    assert result['status'] == 'success'
    data = result['data']
    assert data['analysis_type'] == 'weighted_proportion'
    assert data['rows_used'] == 5
    
    # Check category results
    props = data['proportions']
    assert len(props) == 3
    
    # Categories: A (sum=2), B (sum=7), C (sum=1). Total weight = 10.
    # Sorted by sum desc: B, A, C.
    assert props[0]['category'] == 'B'
    assert props[0]['weighted_proportion'] == 0.7
    assert props[1]['category'] == 'A'
    assert props[1]['weighted_proportion'] == 0.2
    assert props[2]['category'] == 'C'
    assert props[2]['weighted_proportion'] == 0.1

    # Standard error, margin of error, and confidence interval existence
    for prop in props:
        assert 'standard_error' in prop
        assert 'margin_of_error' in prop
        assert 'confidence_interval' in prop
        assert 0.0 <= prop['confidence_interval']['lower'] <= 1.0
        assert 0.0 <= prop['confidence_interval']['upper'] <= 1.0


def test_edge_cases_exceptions():
    # Empty DataFrame
    with pytest.raises(EmptyDatasetError):
        run_weight_estimation(pd.DataFrame(columns=['val', 'weight']), 'val', 'weight')

    # All null values
    df_null = pd.DataFrame({
        'val': [np.nan, np.nan],
        'weight': [1.0, 2.0]
    })
    with pytest.raises(InsufficientDataError):
        run_weight_estimation(df_null, 'val', 'weight', analysis_type='mean')

    # Non-numeric weights
    df_str_weights = pd.DataFrame({
        'val': [1.0, 2.0],
        'weight': ['abc', 'def']
    })
    with pytest.raises(EmptyDatasetError):
        run_weight_estimation(df_str_weights, 'val', 'weight')

    # Zero-sum weights
    df_zero_weights = pd.DataFrame({
        'val': [1.0, 2.0],
        'weight': [0.0, 0.0]
    })
    with pytest.raises(EmptyDatasetError):
        run_weight_estimation(df_zero_weights, 'val', 'weight')
