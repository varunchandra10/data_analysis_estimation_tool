from __future__ import annotations

import pandas as pd


def optimize_dataframe_memory(df: pd.DataFrame) -> pd.DataFrame:
    optimized = df.copy()

    for column in optimized.columns:
        series = optimized[column]

        if pd.api.types.is_integer_dtype(series):
            optimized[column] = pd.to_numeric(series, downcast='integer')
            continue

        if pd.api.types.is_float_dtype(series):
            optimized[column] = pd.to_numeric(series, downcast='float')
            continue

        if pd.api.types.is_object_dtype(series):
            non_null = series.dropna()
            if non_null.empty:
                continue

            unique_ratio = non_null.nunique() / max(len(non_null), 1)
            if unique_ratio <= 0.5:
                optimized[column] = series.astype('category')

    return optimized
