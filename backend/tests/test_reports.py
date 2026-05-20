from services.report_engine import build_pdf_report


def test_build_pdf_report_returns_bytes():
    payload = {
        "dataset": {
            "metadata": {"filename": "sample.csv", "rows": 10, "columns": 2},
            "schema": [{"column": "age", "type": "int64"}],
            "nullCounts": {"age": 0},
        },
        "cleaning": {"nullAnalysisAvailable": True, "nullCounts": {}},
        "outliers": {"rowsAfter": 10, "total_outliers": 0},
        "validation": {"available": True, "failedRules": 0, "severity_counts": {}},
        "weighting": {"weights": {}, "moe": 0.0, "confidence_interval": {"lower": 1.0, "upper": 1.0}},
        "ai": {"recommendations": []},
        "statistics": {},
    }

    pdf_bytes = build_pdf_report(payload)

    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF")
