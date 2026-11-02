import numpy as np
import pandas as pd
import pytest
from services.statistics.ipf_engine import (
    run_iterative_proportional_fitting,
    normalize_target_margins,
    InvalidMarginalsError,
)
from core.exceptions import WeightingError


def test_normalize_target_margins():
    # Percentage input summing to 100
    targets = {
        "gender": {"M": 49.0, "F": 51.0},
        "region": {"Urban": 30.0, "Rural": 70.0},
    }
    normalized = normalize_target_margins(targets)
    assert pytest.approx(sum(normalized["gender"].values()), 1e-6) == 1.0
    assert pytest.approx(normalized["gender"]["M"], 1e-6) == 0.49
    assert pytest.approx(normalized["gender"]["F"], 1e-6) == 0.51

    assert pytest.approx(sum(normalized["region"].values()), 1e-6) == 1.0
    assert pytest.approx(normalized["region"]["Urban"], 1e-6) == 0.30
    assert pytest.approx(normalized["region"]["Rural"], 1e-6) == 0.70


def test_ipf_convergence_and_parity():
    # Construct synthetic sample with disproportionate representation:
    # 80 males, 20 females (unweighted male = 80%)
    # 70 urban, 30 rural (unweighted urban = 70%)
    np.random.seed(42)
    n = 100
    genders = ["M"] * 80 + ["F"] * 20
    regions = ["Urban"] * 70 + ["Rural"] * 30
    np.random.shuffle(genders)
    np.random.shuffle(regions)

    df = pd.DataFrame({
        "gender": genders,
        "region": regions,
        "income": np.random.normal(50000, 10000, n),
    })

    # Census targets: 50% M / 50% F, 40% Urban / 60% Rural
    targets = {
        "gender": {"M": 0.50, "F": 0.50},
        "region": {"Urban": 0.40, "Rural": 0.60},
    }

    result = run_iterative_proportional_fitting(
        df=df,
        target_margins=targets,
        output_weight_column="calibrated_weight",
        max_iter=100,
        epsilon=1e-5,
    )

    assert result["converged"] is True
    assert result["iterations"] < 25
    assert result["max_diff"] < 1e-5
    assert "calibrated_weight" in result["df"].columns

    # Verify that calibrated weights sum to sample size
    calibrated_weights = result["df"]["calibrated_weight"].to_numpy()
    assert pytest.approx(np.sum(calibrated_weights), 1e-2) == n

    # Verify marginal parity: weighted proportions must match census targets within tolerance
    total_w = np.sum(calibrated_weights)

    # Gender parity
    male_w = np.sum(calibrated_weights[df["gender"] == "M"]) / total_w
    female_w = np.sum(calibrated_weights[df["gender"] == "F"]) / total_w
    assert pytest.approx(male_w, abs=1e-3) == 0.50
    assert pytest.approx(female_w, abs=1e-3) == 0.50

    # Region parity
    urban_w = np.sum(calibrated_weights[df["region"] == "Urban"]) / total_w
    rural_w = np.sum(calibrated_weights[df["region"] == "Rural"]) / total_w
    assert pytest.approx(urban_w, abs=1e-3) == 0.40
    assert pytest.approx(rural_w, abs=1e-3) == 0.60

    # Verify Kish ESS and Deff
    assert result["kish_effective_sample_size"] > 0
    assert result["kish_effective_sample_size"] <= n
    assert result["kish_design_effect"] >= 1.0


def test_ipf_empty_dataset_and_invalid_margins():
    empty_df = pd.DataFrame()
    with pytest.raises(WeightingError):
        run_iterative_proportional_fitting(empty_df, {"col": {"A": 0.5, "B": 0.5}})

    df = pd.DataFrame({"gender": ["M", "F"]})
    with pytest.raises(InvalidMarginalsError):
        run_iterative_proportional_fitting(df, {})

    with pytest.raises(InvalidMarginalsError):
        run_iterative_proportional_fitting(df, {"non_existent_column": {"A": 0.5, "B": 0.5}})

