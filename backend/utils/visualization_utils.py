import numpy as np


def generate_histogram_data(
    series,
    bins=10
):

    values = series.dropna()

    if values.empty:

        return []

    counts, bin_edges = np.histogram(
        values,
        bins=bins
    )

    histogram = []

    for i in range(len(counts)):

        histogram.append({

            "range": (
                f"{round(bin_edges[i], 2)}"
                f"-"
                f"{round(bin_edges[i + 1], 2)}"
            ),

            "count": int(counts[i])

        })

    return histogram


def generate_boxplot_stats(series):

    clean_series = series.dropna()

    if clean_series.empty:

        return {}

    q1 = clean_series.quantile(0.25)

    median = clean_series.quantile(0.50)

    q3 = clean_series.quantile(0.75)

    return {

        "min": float(clean_series.min()),

        "q1": float(q1),

        "median": float(median),

        "q3": float(q3),

        "max": float(clean_series.max()),

        "iqr": float(q3 - q1)

    }