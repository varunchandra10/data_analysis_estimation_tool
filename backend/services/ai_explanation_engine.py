from __future__ import annotations

from typing import Any

import httpx

from core.config import OLLAMA_MODEL, OLLAMA_URL
from utils.log_utils import log_calls

TIMEOUT = 30.0


def _build_prompt(title: str, lines: list[str], instruction: str) -> str:
    content = '\n'.join(lines)
    return (
        'Explain in ONLY 3 short lines.\n'
        f'{title}\n'
        f'{content}\n'
        f'{instruction}'
    )


@log_calls
async def ask_ollama(prompt: str) -> str:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    'model': OLLAMA_MODEL,
                    'prompt': prompt,
                    'stream': False,
                },
                timeout=TIMEOUT,
            )

        if response.status_code != 200:
            return 'AI explanation unavailable (Engine Error).'

        result = response.json()
        return result.get('response', '').strip() or 'AI explanation unavailable.'
    except (httpx.ConnectError, httpx.TimeoutException):
        return 'AI explanation unavailable (Connection Timeout).'
    except Exception:
        return 'AI explanation unavailable.'


@log_calls
async def explain_missing_value_method(column: str, recommended_method: str, reason_codes: list[str]) -> str:
    prompt = _build_prompt(
        title='Missing Value Recommendation',
        lines=[
            f'Column: {column}',
            f'Recommended method: {recommended_method}',
            f'Reasons: {", ".join(reason_codes or []) or "N/A"}',
        ],
        instruction='Explain why this is appropriate for data quality and inference reliability.',
    )
    return await ask_ollama(prompt)


@log_calls
async def explain_outlier_method(column: str, outlier_method: str, reason_codes: list[str]) -> str:
    prompt = _build_prompt(
        title='Outlier Treatment Recommendation',
        lines=[
            f'Column: {column}',
            f'Recommended method: {outlier_method}',
            f'Reasons: {", ".join(reason_codes or []) or "N/A"}',
        ],
        instruction='Explain why this outlier strategy is statistically robust for survey-like data.',
    )
    return await ask_ollama(prompt)


@log_calls
async def explain_validation_issue(column: str, rule_type: str, violation_count: int) -> str:
    prompt = _build_prompt(
        title='Validation Rule Summary',
        lines=[
            f'Column: {column}',
            f'Rule type: {rule_type}',
            f'Violations: {violation_count}',
        ],
        instruction='Explain how this violates survey dependency or consistency logic and its risk.',
    )
    return await ask_ollama(prompt)


@log_calls
async def explain_weight_estimation(
    analysis_type: str,
    weighted_value: float | None,
    unweighted_value: float | None,
    margin_of_error: float | None,
) -> str:
    prompt = _build_prompt(
        title='Weighting Estimate Summary',
        lines=[
            f'Analysis type: {analysis_type}',
            f'Weighted estimate: {weighted_value}',
            f'Unweighted estimate: {unweighted_value}',
            f'Margin of error: {margin_of_error}',
        ],
        instruction='Interpret sampling imbalance and reliability of the weighted estimate.',
    )
    return await ask_ollama(prompt)


@log_calls
async def explain_quality_score(score: float | None, grade: str | None, components: dict[str, Any] | None) -> str:
    prompt = _build_prompt(
        title='Quality Score Interpretation',
        lines=[
            f'Normalized score: {score}',
            f'Grade: {grade}',
            f'Components: {components or {}}',
        ],
        instruction='Explain how validation consistency and statistical quality dimensions influenced this score.',
    )
    return await ask_ollama(prompt)
