import numpy as np
import pandas as pd
import pytest

from core.config import MAX_VIOLATIONS_RETURNED
from schemas.validation_schema import SimpleRule
from services.validation.engine import ValidationEngine
from services.cleaning_service import clean_missing_values_service


def test_validation_engine_caps_violations():
    # 500 rows that all fail the rule (age >= 18, but age is 10)
    n_rows = 500
    df = pd.DataFrame({
        "age": [10] * n_rows,
        "name": [f"person_{i}" for i in range(n_rows)],
    })

    rule = SimpleRule(
        column="age",
        operator=">=",
        value=18,
        severity="high",
    )

    engine = ValidationEngine(df=df, rules=[rule])
    result = engine.execute()

    # Total count must record all 500 violations
    assert result.total_violations == 500
    assert result.severity_counts["high"] == 500

    # But violations list must be capped at MAX_VIOLATIONS_RETURNED (100)
    assert len(result.violations) == MAX_VIOLATIONS_RETURNED
    assert len(result.violations) == 100


@pytest.mark.asyncio
async def test_knn_imputation_isolated_to_target_column():
    # Create dataset where both colA and colB have nulls
    # colA has null at index 1
    # colB has null at index 3
    df = pd.DataFrame({
        "colA": [10.0, np.nan, 30.0, 40.0, 50.0],
        "colB": [100.0, 200.0, 300.0, np.nan, 500.0],
    })

    # User explicitly requests KNN ONLY for colA
    payload = {
        "in_memory": True,
        "df": df,
        "file_path": "memory_dataset.csv",
        "strategies": {
            "colA": "knn"
        }
    }

    result = await clean_missing_values_service(payload)
    result_df = result["df"]

    # colA must now have 0 nulls (imputed)
    assert result_df["colA"].isnull().sum() == 0
    # colB must NOT have been imputed by KNN side-effect! Index 3 must still be null!
    assert pd.isna(result_df.loc[3, "colB"])
    assert result_df["colB"].isnull().sum() == 1

