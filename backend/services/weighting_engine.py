import numpy as np
import pandas as pd

from scipy.stats import norm


# =========================================================
# CLEAN DATA
# =========================================================

def prepare_weighted_data(

    df,
    value_column,
    weight_column

):

    clean_df = df[
        [value_column, weight_column]
    ].dropna()

    return clean_df


# =========================================================
# VALIDATE NUMERIC
# =========================================================

def validate_numeric_column(

    df,
    column_name

):

    return pd.api.types.is_numeric_dtype(
        df[column_name]
    )


# =========================================================
# CALCULATE WEIGHTED MEAN
# =========================================================

def calculate_weighted_mean(

    values,
    weights

):

    weighted_mean = np.average(
        values,
        weights=weights
    )

    return round(
        float(weighted_mean),
        4
    )


# =========================================================
# CALCULATE UNWEIGHTED MEAN
# =========================================================

def calculate_unweighted_mean(values):

    return round(
        float(values.mean()),
        4
    )


# =========================================================
# STANDARD ERROR
# =========================================================

def calculate_standard_error(values):

    std_error = (

        values.std()

        /

        np.sqrt(len(values))

    )

    return float(std_error)


# =========================================================
# MARGIN OF ERROR
# =========================================================

def calculate_margin_of_error(

    standard_error,
    confidence_level=0.95

):

    z_value = norm.ppf(

        1 - ((1 - confidence_level) / 2)

    )

    moe = z_value * standard_error

    return round(
        float(moe),
        4
    )


# =========================================================
# CONFIDENCE INTERVAL
# =========================================================

def calculate_confidence_interval(

    estimate,
    margin_of_error

):

    lower = estimate - margin_of_error

    upper = estimate + margin_of_error

    return {

        "lower": round(
            float(lower),
            4
        ),

        "upper": round(
            float(upper),
            4
        )
    }


# =========================================================
# WEIGHTED PROPORTIONS
# =========================================================

def calculate_weighted_proportions(

    values,
    weights

):

    unique_values = values.unique()

    proportions = []

    total_weight = weights.sum()

    for category in unique_values:

        mask = values == category

        weighted_prop = (

            weights[mask].sum()

            /

            total_weight

        )

        unweighted_prop = mask.mean()

        proportions.append({

            "category": str(category),

            "weighted_proportion": round(
                float(weighted_prop),
                4
            ),

            "unweighted_proportion": round(
                float(unweighted_prop),
                4
            )
        })

    return proportions


# =========================================================
# VISUALIZATION DATA
# =========================================================

def generate_weight_visualization(

    analysis_type,
    result

):

    visualization_data = []

    # =====================================================
    # WEIGHTED MEAN CHART
    # =====================================================

    if analysis_type == "mean":

        visualization_data = [

            {

                "label": "Weighted Mean",

                "value": result.get(
                    "weighted_mean",
                    0
                )
            },

            {

                "label": "Unweighted Mean",

                "value": result.get(
                    "unweighted_mean",
                    0
                )
            }
        ]

    # =====================================================
    # PROPORTION CHART
    # =====================================================

    elif analysis_type == "proportion":

        for item in result.get(
            "proportions",
            []
        ):

            visualization_data.append({

                "label": item.get(
                    "category"
                ),

                "weighted": item.get(
                    "weighted_proportion"
                ),

                "unweighted": item.get(
                    "unweighted_proportion"
                )
            })

    return visualization_data


# =========================================================
# COMPLETE WEIGHT ESTIMATION
# =========================================================

def run_weight_estimation(

    df,
    value_column,
    weight_column,
    analysis_type="mean",
    confidence_level=0.95

):

    # =====================================================
    # CLEAN DATA
    # =====================================================

    clean_df = prepare_weighted_data(

        df=df,

        value_column=value_column,

        weight_column=weight_column
    )

    values = clean_df[value_column]

    weights = clean_df[weight_column]

    # =====================================================
    # VALIDATE WEIGHTS
    # =====================================================

    if not validate_numeric_column(

        clean_df,
        weight_column

    ):

        raise Exception(
            "Weight column must be numeric"
        )

    # =====================================================
    # WEIGHTED MEAN
    # =====================================================

    if analysis_type == "mean":

        if not validate_numeric_column(

            clean_df,
            value_column

        ):

            raise Exception(
                "Mean requires numeric values"
            )

        weighted_mean = calculate_weighted_mean(

            values,
            weights
        )

        unweighted_mean = calculate_unweighted_mean(
            values
        )

        std_error = calculate_standard_error(
            values
        )

        margin_of_error = calculate_margin_of_error(

            std_error,
            confidence_level
        )

        confidence_interval = (
            calculate_confidence_interval(

                weighted_mean,

                margin_of_error
            )
        )

        result = {

            "analysis_type": "weighted_mean",

            "weighted_mean": weighted_mean,

            "unweighted_mean": unweighted_mean,

            "margin_of_error": margin_of_error,

            "confidence_interval":
            confidence_interval
        }

    # =====================================================
    # WEIGHTED PROPORTIONS
    # =====================================================

    elif analysis_type == "proportion":

        proportions = calculate_weighted_proportions(

            values,
            weights
        )

        result = {

            "analysis_type":
            "weighted_proportion",

            "proportions":
            proportions
        }

    else:

        raise Exception(
            "Invalid analysis type"
        )

    # =====================================================
    # VISUALIZATION
    # =====================================================

    visualizations = generate_weight_visualization(

        analysis_type,
        result
    )

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {

        "rows_used": len(clean_df),

        "confidence_level": confidence_level,

        "results": result,

        "visualizations":
        visualizations
    }