import numpy as np
import pandas as pd

from scipy.stats import skew
from scipy.stats import zscore
from utils.log_utils import log_calls


# =========================================================
# SAFE NUMERIC CHECK
# =========================================================

@log_calls
def is_numeric(series):

    return pd.api.types.is_numeric_dtype(series)


# =========================================================
# CALCULATE OUTLIER PERCENT
# =========================================================

@log_calls
def calculate_outlier_percent(series):

    try:

        clean_series = series.dropna()

        if clean_series.empty:
            return 0.0

        Q1 = clean_series.quantile(0.25)

        Q3 = clean_series.quantile(0.75)

        IQR = Q3 - Q1

        lower_bound = Q1 - (1.5 * IQR)

        upper_bound = Q3 + (1.5 * IQR)

        outliers = clean_series[
            (clean_series < lower_bound) |
            (clean_series > upper_bound)
        ]

        outlier_percent = (
            len(outliers) / len(clean_series)
        ) * 100

        return round(float(outlier_percent), 2)

    except Exception:

        return 0.0


# =========================================================
# DETECT DISTRIBUTION TYPE
# =========================================================

@log_calls
def detect_distribution(skewness):

    if skewness > 1:

        return "right_skewed"

    elif skewness < -1:

        return "left_skewed"

    return "symmetric"


# =========================================================
# ANALYZE SINGLE COLUMN
# =========================================================

@log_calls
def analyze_column(df, column, col_type):

    try:

        series = df[column]

        total_rows = len(df)

        missing_count = int(
            series.isnull().sum()
        )

        missing_percent = round(
            (missing_count / total_rows) * 100,
            2
        )

        unique_count = int(
            series.nunique(dropna=True)
        )

        unique_ratio = round(
            unique_count / max(total_rows, 1),
            4
        )

        analysis = {

            "column": column,

            "type": col_type,

            "statistics": {

                "missing_percent": missing_percent,

                "unique_count": unique_count,

                "unique_ratio": unique_ratio

            }

        }

        # =====================================================
        # NUMERICAL ANALYSIS
        # =====================================================

        if is_numeric(series):

            clean_series = series.dropna()

            if not clean_series.empty:

                variance = round(
                    float(clean_series.var()),
                    4
                )

                skewness = round(
                    float(skew(clean_series)),
                    4
                )

                outlier_percent = calculate_outlier_percent(
                    clean_series
                )

                distribution = detect_distribution(
                    skewness
                )

                analysis["statistics"].update({

                    "mean": round(
                        float(clean_series.mean()),
                        4
                    ),

                    "median": round(
                        float(clean_series.median()),
                        4
                    ),

                    "std": round(
                        float(clean_series.std()),
                        4
                    ),

                    "min": round(
                        float(clean_series.min()),
                        4
                    ),

                    "max": round(
                        float(clean_series.max()),
                        4
                    ),

                    "variance": variance,

                    "skewness": skewness,

                    "distribution": distribution,

                    "outlier_percent": outlier_percent

                })

        return analysis

    except Exception as e:

        return {

            "column": column,

            "type": col_type,

            "error": str(e)

        }


# =========================================================
# GENERATE RECOMMENDATIONS
# =========================================================

@log_calls
def generate_recommendation(column_analysis):

    stats = column_analysis.get(
        "statistics",
        {}
    )

    column_type = column_analysis.get(
        "type",
        "Unknown"
    )

    recommendations = {

        "missing_value_method": None,

        "outlier_method": None,

        "validation_priority": "low",

        "warnings": [],

        "reason_codes": [],

        "confidence": 70

    }

    missing_percent = stats.get(
        "missing_percent",
        0
    )

    unique_ratio = stats.get(
        "unique_ratio",
        0
    )

    skewness = abs(
        stats.get("skewness", 0)
    )

    outlier_percent = stats.get(
        "outlier_percent",
        0
    )

    distribution = stats.get(
        "distribution",
        "unknown"
    )

    # =====================================================
    # MISSING VALUE RECOMMENDATIONS
    # =====================================================

    if column_type == "Numerical":

        # HIGH SKEWNESS
        if skewness > 1:

            recommendations[
                "missing_value_method"
            ] = "median"

            recommendations[
                "reason_codes"
            ].append("high_skewness")

            recommendations[
                "confidence"
            ] += 10

        # LOW SKEWNESS
        elif skewness <= 1 and missing_percent < 10:

            recommendations[
                "missing_value_method"
            ] = "mean"

            recommendations[
                "reason_codes"
            ].append("symmetric_distribution")

            recommendations[
                "confidence"
            ] += 5

        else:

            recommendations[
                "missing_value_method"
            ] = "median"

    # =====================================================
    # CATEGORICAL COLUMNS
    # =====================================================

    elif column_type in [

        "Categorical",
        "Text"

    ]:

        recommendations[
            "missing_value_method"
        ] = "most_frequent"

        recommendations[
            "reason_codes"
        ].append("categorical_column")

    # =====================================================
    # HIGH MISSING VALUES
    # =====================================================

    if missing_percent > 40:

        recommendations[
            "warnings"
        ].append(
            "High missing percentage detected"
        )

        recommendations[
            "reason_codes"
        ].append(
            "high_missing_percentage"
        )

        recommendations[
            "validation_priority"
        ] = "high"

        recommendations[
            "confidence"
        ] += 10

    # =====================================================
    # OUTLIER RECOMMENDATIONS
    # =====================================================

    if column_type == "Numerical":

        # HIGH OUTLIERS
        if outlier_percent > 15:

            recommendations[
                "outlier_method"
            ] = "winsorization"

            recommendations[
                "reason_codes"
            ].append(
                "high_outlier_percentage"
            )

            recommendations[
                "confidence"
            ] += 10

        # SKEWED DATA
        elif skewness > 1:

            recommendations[
                "outlier_method"
            ] = "iqr"

            recommendations[
                "reason_codes"
            ].append(
                "skewed_distribution"
            )

            recommendations[
                "confidence"
            ] += 5

        # NORMAL DISTRIBUTION
        elif distribution == "symmetric":

            recommendations[
                "outlier_method"
            ] = "zscore"

            recommendations[
                "reason_codes"
            ].append(
                "normal_distribution"
            )

            recommendations[
                "confidence"
            ] += 5

    # =====================================================
    # IDENTIFIER COLUMN DETECTION
    # =====================================================

    if unique_ratio > 0.95:

        recommendations[
            "warnings"
        ].append(
            "Possible identifier column"
        )

        recommendations[
            "reason_codes"
        ].append(
            "high_unique_ratio"
        )

    # =====================================================
    # LOW VARIANCE WARNING
    # =====================================================

    variance = stats.get(
        "variance",
        None
    )

    if variance is not None:

        if variance < 0.01:

            recommendations[
                "warnings"
            ].append(
                "Low variance column"
            )

            recommendations[
                "reason_codes"
            ].append(
                "low_variance"
            )

    # =====================================================
    # FINAL CONFIDENCE CAP
    # =====================================================

    recommendations["confidence"] = min(
        recommendations["confidence"],
        100
    )

    return recommendations


# =========================================================
# BUILD DATASET RECOMMENDATIONS
# =========================================================

@log_calls
def build_dataset_recommendations(df, schema):

    dataset_recommendations = []

    for col_info in schema:

        column = col_info.get("column")

        col_type = col_info.get("type")

        if column not in df.columns:
            continue

        # ANALYSIS
        analysis = analyze_column(

            df=df,

            column=column,

            col_type=col_type

        )

        # RECOMMENDATIONS
        recommendations = generate_recommendation(
            analysis
        )

        # MERGE
        final_output = {

            **analysis,

            "recommendations": recommendations

        }

        dataset_recommendations.append(
            final_output
        )

    return dataset_recommendations