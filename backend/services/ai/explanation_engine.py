from __future__ import annotations

import asyncio
from typing import Any

from services.ai.ollama_client import ask_ollama
from services.ai import prompt_builder
from utils.log_utils import log_calls
from services.ai.cache_engine import save_ai_cache_section, load_ai_cache_section
from utils.dataset_storage import resolve_dataset_name
from services.dataset_loader import validate_dataset_path
from core.config import OLLAMA_MODEL


def _is_unavailable_explanation(value: Any) -> bool:
    if not isinstance(value, str):
        return True
    return value.strip().lower().startswith('ai explanation unavailable')


def _fallback_missing_text(column: str, method: str, reason_codes: list[str]) -> str:
    reasons = ', '.join(reason_codes) if reason_codes else 'missing-value distribution analysis'
    return f"Suggested '{method}' for {column} based on {reasons}."


def _fallback_outlier_text(column: str, method: str, reason_codes: list[str]) -> str:
    reasons = ', '.join(reason_codes) if reason_codes else 'distribution and spread analysis'
    return f"Suggested '{method}' outlier handling for {column} based on {reasons}."


def _fallback_validation_text(column: str, rule_type: str, count: int) -> str:
    return f"Validation check '{rule_type}' flagged {count} issue(s) for {column}."


def _fallback_weighting_text(analysis_type: str, weighted_value: float | None, unweighted_value: float | None, margin_of_error: float | None) -> str:
    if weighted_value is not None and unweighted_value is not None:
        return (
            f"{analysis_type} results are available with weighted value {weighted_value} and "
            f"unweighted value {unweighted_value}; margin of error is {margin_of_error}."
        )
    return f"{analysis_type} weighting analysis completed with available confidence statistics."


def _fallback_quality_text(score: float | None, grade: str | None, components: dict[str, Any] | None) -> str:
    if score is not None and grade is not None:
        return f"Overall quality score is {score} with grade {grade}."
    if isinstance(components, dict) and components:
        return f"Quality components computed: {', '.join(components.keys())}."
    return 'Quality score summary is available from dataset quality metrics.'


@log_calls
async def explain_missing_value_method(column: str, recommended_method: str, reason_codes: list[str]) -> str:
    prompt = prompt_builder.build_missing_value_prompt(column, recommended_method, reason_codes)
    return await ask_ollama(prompt, fallback_message='AI explanation unavailable.')


@log_calls
async def explain_outlier_method(column: str, outlier_method: str, reason_codes: list[str]) -> str:
    prompt = prompt_builder.build_outlier_prompt(column, outlier_method, reason_codes)
    return await ask_ollama(prompt, fallback_message='AI explanation unavailable.')


@log_calls
async def explain_validation_issue(column: str, rule_type: str, violation_count: int) -> str:
    prompt = prompt_builder.build_validation_prompt(column, rule_type, violation_count)
    return await ask_ollama(prompt, fallback_message='AI explanation unavailable.')


@log_calls
async def explain_weight_estimation(
    analysis_type: str,
    weighted_value: float | None,
    unweighted_value: float | None,
    margin_of_error: float | None,
) -> str:
    prompt = prompt_builder.build_weighting_prompt(analysis_type, weighted_value, unweighted_value, margin_of_error)
    return await ask_ollama(prompt, fallback_message='AI explanation unavailable.')


@log_calls
async def explain_quality_score(score: float | None, grade: str | None, components: dict[str, Any] | None) -> str:
    prompt = prompt_builder.build_quality_score_prompt(score, grade, components)
    return await ask_ollama(prompt, fallback_message='AI explanation unavailable.')


@log_calls
async def orchestrate_ai_explanations(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Entrypoint for AI explanations.
    Flow: Check Cache -> Explanation Engine -> Save Cache -> Return
    """
    path = validate_dataset_path(payload.get('file_path') or payload.get('dataset_name'))
    dataset_name = resolve_dataset_name(path)
    source_path = str(path)
    
    recommendations = payload.get('recommendations', [])
    
    cached_data = load_ai_cache_section(dataset_name, 'explanations')
    cached_explanations = cached_data.get('explanations', [])
    cached_columns = {item['column']: item for item in cached_explanations if 'column' in item}

    explanations = []
    futures = []
    
    sem = asyncio.Semaphore(3)

    async def safe_explain_missing(col: str, method: str, codes: list[str]) -> str:
        async with sem:
            try:
                response = await explain_missing_value_method(col, method, codes)
                if _is_unavailable_explanation(response):
                    return _fallback_missing_text(col, method, codes)
                return response
            except Exception:
                return _fallback_missing_text(col, method, codes)

    async def safe_explain_outlier(col: str, method: str, codes: list[str]) -> str:
        async with sem:
            try:
                response = await explain_outlier_method(col, method, codes)
                if _is_unavailable_explanation(response):
                    return _fallback_outlier_text(col, method, codes)
                return response
            except Exception:
                return _fallback_outlier_text(col, method, codes)

    async def safe_explain_validation(col: str, r_type: str, count: int) -> str:
        async with sem:
            try:
                response = await explain_validation_issue(column=col, rule_type=r_type, violation_count=count)
                if _is_unavailable_explanation(response):
                    return _fallback_validation_text(col, r_type, count)
                return response
            except Exception:
                return _fallback_validation_text(col, r_type, count)

    async def safe_explain_weighting(a_type: str, w_val: float | None, u_val: float | None, moe: float | None) -> str:
        async with sem:
            try:
                response = await explain_weight_estimation(analysis_type=a_type, weighted_value=w_val, unweighted_value=u_val, margin_of_error=moe)
                if _is_unavailable_explanation(response):
                    return _fallback_weighting_text(a_type, w_val, u_val, moe)
                return response
            except Exception:
                return _fallback_weighting_text(a_type, w_val, u_val, moe)

    async def safe_explain_quality(score: float | None, grade: str | None, comps: dict[str, Any] | None) -> str:
        async with sem:
            try:
                response = await explain_quality_score(score=score, grade=grade, components=comps)
                if _is_unavailable_explanation(response):
                    return _fallback_quality_text(score, grade, comps)
                return response
            except Exception:
                return _fallback_quality_text(score, grade, comps)

    async def run_and_set_dict_key(coro, dest_dict, key):
        dest_dict[key] = await coro

    for item in recommendations:
        column = item.get('column')
        rec = item.get('recommendations', {})
        reason_codes = item.get('reason_codes', [])

        missing_method = rec.get('missing_value_method')
        outlier_method = rec.get('outlier_method')

        cached_item = cached_columns.get(column)

        exp_entry = {
            'column': column,
            'missing_value_ai_explanation': 'No missing values detected.',
            'outlier_ai_explanation': 'No outliers detected.'
        }
        explanations.append(exp_entry)

        if missing_method:
            cached_missing = cached_item.get('missing_value_ai_explanation') if cached_item else None
            if cached_item and cached_missing and cached_missing != 'No missing values detected.' and not _is_unavailable_explanation(cached_missing):
                exp_entry['missing_value_ai_explanation'] = cached_item.get('missing_value_ai_explanation')
            else:
                coro = safe_explain_missing(column, missing_method, reason_codes)
                futures.append(run_and_set_dict_key(coro, exp_entry, 'missing_value_ai_explanation'))

        if outlier_method:
            cached_outlier = cached_item.get('outlier_ai_explanation') if cached_item else None
            if cached_item and cached_outlier and cached_outlier != 'No outliers detected.' and not _is_unavailable_explanation(cached_outlier):
                exp_entry['outlier_ai_explanation'] = cached_item.get('outlier_ai_explanation')
            else:
                coro = safe_explain_outlier(column, outlier_method, reason_codes)
                futures.append(run_and_set_dict_key(coro, exp_entry, 'outlier_ai_explanation'))

    validation_summary = payload.get('validation_summary') or {}
    weighting_summary = payload.get('weighting_summary') or {}
    quality_summary = payload.get('quality_summary') or {}

    summary_explanations: dict[str, str] = {}

    if validation_summary:
        validation_cached = cached_data.get('validation_ai_explanation')
        if validation_cached and not _is_unavailable_explanation(validation_cached):
            summary_explanations['validation_ai_explanation'] = validation_cached
        else:
            coro = safe_explain_validation(
                col=str(validation_summary.get('column', 'dataset')),
                r_type=str(validation_summary.get('rule_type', 'dsl_rules')),
                count=int(validation_summary.get('total_violations', 0)),
            )
            futures.append(run_and_set_dict_key(coro, summary_explanations, 'validation_ai_explanation'))

    if weighting_summary:
        weighting_cached = cached_data.get('weighting_ai_explanation')
        if weighting_cached and not _is_unavailable_explanation(weighting_cached):
            summary_explanations['weighting_ai_explanation'] = weighting_cached
        else:
            weighting_data = weighting_summary.get('data') if isinstance(weighting_summary, dict) and 'data' in weighting_summary else weighting_summary
            
            if isinstance(weighting_summary, dict) and 'results' in weighting_summary:
                if not isinstance(weighting_data, dict) or not weighting_data:
                    weighting_data = weighting_summary.get('results')
                
            if not isinstance(weighting_data, dict):
                weighting_data = {}

            analysis_type = str(weighting_data.get('analysis_type', weighting_summary.get('analysis_type', 'weighted_mean')))
            
            weighted_value = weighting_data.get('weighted_value')
            if weighted_value is None:
                weighted_value = weighting_data.get('weighted_mean', weighting_data.get('weighted_proportion'))
                
            unweighted_value = weighting_data.get('unweighted_value')
            if unweighted_value is None:
                unweighted_value = weighting_data.get('unweighted_mean', weighting_data.get('unweighted_proportion'))
                
            margin_of_error = weighting_data.get('margin_of_error', weighting_data.get('moe'))

            coro = safe_explain_weighting(
                a_type=analysis_type,
                w_val=weighted_value,
                u_val=unweighted_value,
                moe=margin_of_error,
            )
            futures.append(run_and_set_dict_key(coro, summary_explanations, 'weighting_ai_explanation'))

    if quality_summary:
        quality_cached = cached_data.get('quality_ai_explanation')
        if quality_cached and not _is_unavailable_explanation(quality_cached):
            summary_explanations['quality_ai_explanation'] = quality_cached
        else:
            coro = safe_explain_quality(
                score=quality_summary.get('score'),
                grade=quality_summary.get('grade'),
                comps=quality_summary.get('components'),
            )
            futures.append(run_and_set_dict_key(coro, summary_explanations, 'quality_ai_explanation'))

    if futures:
        await asyncio.gather(*futures)

    save_ai_cache_section(dataset_name, 'explanations', {
        'explanations': explanations,
        **summary_explanations
    })

    cache_used = len(futures) == 0

    return {
        'status': 'success',
        'message': 'AI explanations generated',
        'data': {
            'explanations': explanations,
            'summary_explanations': summary_explanations,
            'cache_used': cache_used,
            'model': OLLAMA_MODEL
        },
        'meta': {'source_path': source_path}
    }
