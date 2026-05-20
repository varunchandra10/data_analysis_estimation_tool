from __future__ import annotations

from typing import Any

import hashlib
import json

from services.ai_cache_engine import append_ai_cache_entry, get_ai_cache_section, update_ai_cache_section
from services.ai_explanation_engine import (
    explain_missing_value_method,
    explain_outlier_method,
    explain_quality_score,
    explain_validation_issue,
    explain_weight_estimation,
)
from services.recommendation_engine import build_dataset_recommendations
from utils.dataset_storage import resolve_dataset_name
from services.dataset_loader import load_dataset, validate_dataset_path
from utils.hash_utils import generate_sha256
from utils.log_utils import log_calls


def _source_cache_key(source_path: str) -> str:
    return source_path.replace('\\', '/')


def _schema_signature(schema: list[dict]) -> str:
    normalized_schema = [
        {'column': item.get('column'), 'type': item.get('type'), 'pandas_dtype': item.get('pandas_dtype')}
        for item in (schema or [])
    ]
    payload = json.dumps(normalized_schema, sort_keys=True)
    return hashlib.sha256(payload.encode('utf-8')).hexdigest()


def _profile_cache_key(source_path: str, file_hash: str, schema: list[dict]) -> str:
    return json.dumps(
        {'source_path': _source_cache_key(source_path), 'file_hash': file_hash, 'schema_signature': _schema_signature(schema)},
        sort_keys=True,
    )


def _build_cache_sections(recommendations: list[dict], source_path: str, schema: list[dict], file_hash: str) -> dict[str, dict]:
    missing_values: dict[str, dict] = {}
    outliers: dict[str, dict] = {}
    validation: dict[str, dict] = {}
    weighting: dict[str, dict] = {}

    for item in recommendations:
        column = item.get('column')
        if not column:
            continue

        recommendation = item.get('recommendations', {})
        stats = item.get('statistics', {})

        missing_values[column] = {
            'method': recommendation.get('missing_value_method'),
            'confidence': recommendation.get('confidence'),
            'reason_codes': recommendation.get('reason_codes', []),
            'warnings': recommendation.get('warnings', []),
            'missing_percent': stats.get('missing_percent'),
        }
        outliers[column] = {
            'method': recommendation.get('outlier_method'),
            'confidence': recommendation.get('confidence'),
            'reason_codes': recommendation.get('reason_codes', []),
            'warnings': recommendation.get('warnings', []),
            'outlier_percent': stats.get('outlier_percent'),
            'distribution': stats.get('distribution'),
        }
        validation[column] = {'priority': recommendation.get('validation_priority'), 'reason_codes': recommendation.get('reason_codes', []), 'warnings': recommendation.get('warnings', [])}
        weighting[column] = {'priority': recommendation.get('weight_estimation_priority'), 'reason_codes': recommendation.get('reason_codes', []), 'warnings': recommendation.get('warnings', []), 'distribution': stats.get('distribution')}

    dataset_summary = {
        'source_path': source_path,
        'file_hash': file_hash,
        'schema_signature': _schema_signature(schema),
        'schema_columns': len(schema or []),
        'recommendation_count': len(recommendations),
        'recommendations': recommendations,
    }

    return {
        'missing_values': missing_values,
        'outliers': outliers,
        'validation': validation,
        'weighting': weighting,
        'dataset_summary': dataset_summary,
        'profiles': {
            _profile_cache_key(source_path, file_hash, schema): {
                'source_path': source_path,
                'file_hash': file_hash,
                'schema_signature': _schema_signature(schema),
                'missing_values': missing_values,
                'outliers': outliers,
                'validation': validation,
                'weighting': weighting,
                'dataset_summary': dataset_summary,
            }
        },
    }


@log_calls
async def ai_recommendations_service(payload: dict[str, Any]) -> dict[str, Any]:
    path = validate_dataset_path(payload.get('file_path'))
    schema = payload.get('schema', payload.get('schema_', []))
    dataset_name = resolve_dataset_name(path)
    source_path = str(path)
    file_hash = generate_sha256(path)
    profile_key = _profile_cache_key(source_path, file_hash, schema)

    cached_profiles = get_ai_cache_section(dataset_name, 'profiles', {}) or {}
    cached_profile = cached_profiles.get(profile_key)
    if cached_profile and cached_profile.get('dataset_summary', {}).get('recommendations'):
        return {'status': 'success', 'source_path': source_path, 'cached': True, 'recommendations': cached_profile['dataset_summary']['recommendations']}

    df = load_dataset(path, optimize=True)
    recommendations = build_dataset_recommendations(df=df, schema=schema)
    cache_sections = _build_cache_sections(recommendations=recommendations, source_path=source_path, schema=schema, file_hash=file_hash)

    for section_name, section_data in cache_sections.items():
        if section_name == 'profiles':
            for key, value in section_data.items():
                append_ai_cache_entry(dataset_name, 'profiles', key, value)
        else:
            update_ai_cache_section(dataset_name, section_name, section_data)

    return {'status': 'success', 'source_path': source_path, 'cached': False, 'recommendations': recommendations}


@log_calls
async def ai_explanations_service(payload: dict[str, Any]) -> dict[str, Any]:
    recommendations = payload.get('recommendations', [])
    explanations = []

    for item in recommendations:
        column = item.get('column')
        rec = item.get('recommendations', {})
        reason_codes = item.get('reason_codes', [])

        missing_method = rec.get('missing_value_method')
        missing_exp = 'No missing values detected.'
        if missing_method:
            missing_exp = await explain_missing_value_method(column, missing_method, reason_codes)

        outlier_method = rec.get('outlier_method')
        outlier_exp = 'No outliers detected.'
        if outlier_method:
            outlier_exp = await explain_outlier_method(column, outlier_method, reason_codes)

        explanations.append({'column': column, 'missing_value_ai_explanation': missing_exp, 'outlier_ai_explanation': outlier_exp})

    validation_summary = payload.get('validation_summary') or {}
    weighting_summary = payload.get('weighting_summary') or {}
    quality_summary = payload.get('quality_summary') or {}

    summary_explanations: dict[str, str] = {}

    if validation_summary:
        summary_explanations['validation_ai_explanation'] = await explain_validation_issue(
            column=str(validation_summary.get('column', 'dataset')),
            rule_type=str(validation_summary.get('rule_type', 'dsl_rules')),
            violation_count=int(validation_summary.get('total_violations', 0)),
        )

    if weighting_summary:
        summary_explanations['weighting_ai_explanation'] = await explain_weight_estimation(
            analysis_type=str(weighting_summary.get('analysis_type', 'weighted_mean')),
            weighted_value=weighting_summary.get('weighted_value'),
            unweighted_value=weighting_summary.get('unweighted_value'),
            margin_of_error=weighting_summary.get('margin_of_error'),
        )

    if quality_summary:
        summary_explanations['quality_ai_explanation'] = await explain_quality_score(
            score=quality_summary.get('score'),
            grade=quality_summary.get('grade'),
            components=quality_summary.get('components'),
        )

    return {'status': 'success', 'explanations': explanations, **summary_explanations}
