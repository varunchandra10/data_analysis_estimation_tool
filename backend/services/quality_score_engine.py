from __future__ import annotations

from typing import Any


QUALITY_WEIGHTS = {
    'missing': 30.0,
    'duplicates': 20.0,
    'outliers': 20.0,
    'validation': 30.0,
}


def _clamp_percent(value: float) -> float:
    return max(0.0, min(100.0, float(value)))


def _component_score(weight: float, violation_percent: float) -> float:
    # Deterministic inverted scoring where lower violation rates earn more points.
    return round(weight * (1.0 - (_clamp_percent(violation_percent) / 100.0)), 2)


def _grade(score: float) -> str:
    if score >= 90:
        return 'Excellent'
    if score >= 75:
        return 'Good'
    if score >= 60:
        return 'Fair'
    if score >= 40:
        return 'Poor'
    return 'Critical'


def compute_normalized_quality_score(
    missing_percent: float,
    duplicate_percent: float,
    outlier_percent: float,
    validation_violation_percent: float,
) -> dict[str, Any]:
    components = {
        'missing': _component_score(QUALITY_WEIGHTS['missing'], missing_percent),
        'duplicates': _component_score(QUALITY_WEIGHTS['duplicates'], duplicate_percent),
        'outliers': _component_score(QUALITY_WEIGHTS['outliers'], outlier_percent),
        'validation': _component_score(QUALITY_WEIGHTS['validation'], validation_violation_percent),
    }

    score = round(sum(components.values()), 2)

    return {
        'score': score,
        'grade': _grade(score),
        'components': components,
        'weights': QUALITY_WEIGHTS.copy(),
        'inputs': {
            'missing_percent': _clamp_percent(missing_percent),
            'duplicate_percent': _clamp_percent(duplicate_percent),
            'outlier_percent': _clamp_percent(outlier_percent),
            'validation_violation_percent': _clamp_percent(validation_violation_percent),
        },
    }
