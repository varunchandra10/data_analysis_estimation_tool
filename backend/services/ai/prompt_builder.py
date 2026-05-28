from __future__ import annotations

from typing import Any

def _build_base_prompt(title: str, lines: list[str], instruction: str) -> str:
    """
    Centralized utility to construct standard AI prompts.
    No network calls or business logic should reside here.
    """
    content = '\n'.join(lines)
    return (
        'Explain in ONLY 3 short lines.\n'
        f'{title}\n'
        f'{content}\n'
        f'{instruction}'
    )

def build_missing_value_prompt(column: str, recommended_method: str, reason_codes: list[str]) -> str:
    return _build_base_prompt(
        title='Missing Value Recommendation',
        lines=[
            f'Column: {column}',
            f'Recommended method: {recommended_method}',
            f'Reasons: {", ".join(reason_codes or []) or "N/A"}',
        ],
        instruction='Explain why this is appropriate for data quality and inference reliability.',
    )

def build_outlier_prompt(column: str, outlier_method: str, reason_codes: list[str]) -> str:
    return _build_base_prompt(
        title='Outlier Treatment Recommendation',
        lines=[
            f'Column: {column}',
            f'Recommended method: {outlier_method}',
            f'Reasons: {", ".join(reason_codes or []) or "N/A"}',
        ],
        instruction='Explain why this outlier strategy is statistically robust for survey-like data.',
    )

def build_validation_prompt(column: str, rule_type: str, violation_count: int) -> str:
    return _build_base_prompt(
        title='Validation Rule Summary',
        lines=[
            f'Column: {column}',
            f'Rule type: {rule_type}',
            f'Violations: {violation_count}',
        ],
        instruction='Explain how this violates survey dependency or consistency logic and its risk.',
    )

def build_weighting_prompt(
    analysis_type: str,
    weighted_value: float | None,
    unweighted_value: float | None,
    margin_of_error: float | None,
) -> str:
    return _build_base_prompt(
        title='Weighting Estimate Summary',
        lines=[
            f'Analysis type: {analysis_type}',
            f'Weighted estimate: {weighted_value}',
            f'Unweighted estimate: {unweighted_value}',
            f'Margin of error: {margin_of_error}',
        ],
        instruction='Interpret sampling imbalance and reliability of the weighted estimate.',
    )

def build_quality_score_prompt(score: float | None, grade: str | None, components: dict[str, Any] | None) -> str:
    return _build_base_prompt(
        title='Quality Score Interpretation',
        lines=[
            f'Normalized score: {score}',
            f'Grade: {grade}',
            f'Components: {components or {}}',
        ],
        instruction='Explain how validation consistency and statistical quality dimensions influenced this score.',
    )
