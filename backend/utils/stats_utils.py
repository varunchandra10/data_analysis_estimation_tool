import pandas as pd
import numpy as np

from scipy.stats import (
    skew,
    kurtosis
)


def get_comprehensive_stats(df):

    """
    Generate dataset statistics
    for dashboard analytics.
    """

    numeric_df = df.select_dtypes(
        include=[np.number]
    )

    numerical_stats = []

    # =================================================
    # NUMERICAL STATS
    # =================================================

    for col in numeric_df.columns:

        series = numeric_df[col].dropna()

        if series.empty:
            continue

        numerical_stats.append({

            "column": col,

            "mean": float(series.mean()),

            "median": float(series.median()),

            "std": float(series.std()),

            "min": float(series.min()),

            "max": float(series.max()),

            "skew": float(skew(series)),

            "kurtosis": float(
                kurtosis(series)
            ),

            "q1": float(
                series.quantile(0.25)
            ),

            "q3": float(
                series.quantile(0.75)
            )

        })

    # =================================================
    # CATEGORICAL STATS
    # =================================================

    categorical_stats = []

    non_numeric = df.select_dtypes(
        exclude=[np.number]
    )

    for col in non_numeric.columns:

        top_values = (
            df[col]
            .value_counts()
            .head(10)
            .to_dict()
        )

        categorical_stats.append({

            "column": col,

            "unique_count": int(
                df[col].nunique()
            ),

            "top_frequencies": [

                {
                    "value": str(k),
                    "count": int(v)
                }

                for k, v in top_values.items()
            ]
        })

    # =================================================
    # CORRELATION MATRIX
    # =================================================

    correlation_matrix = []

    if len(numeric_df.columns) > 1:

        corr = (
            numeric_df
            .corr()
            .replace({np.nan: 0})
            .to_dict()
        )

        for row_name, cols in corr.items():

            for col_name, val in cols.items():

                correlation_matrix.append({

                    "x": row_name,

                    "y": col_name,

                    "value": round(float(val), 3)

                })

    return {

        "numerical": numerical_stats,

        "categorical": categorical_stats,

        "correlation": correlation_matrix

    }