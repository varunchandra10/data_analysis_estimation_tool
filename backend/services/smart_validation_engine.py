from __future__ import annotations

import re
from datetime import datetime
from typing import Any

import pandas as pd

from utils.dataframe_utils import infer_schema
from utils.log_utils import log_calls


_AGE_HINTS = {'age', 'ages', 'year', 'years', 'years_old', 'dob', 'date_of_birth'}
_PERCENT_HINTS = {'percent', 'percentage', 'pct', 'rate', 'ratio', 'share', 'proportion', 'probability', 'coverage'}
_ID_HINTS = {'id', 'ids', 'identifier', 'identifiers', 'key', 'keys', 'code', 'codes', 'uuid', 'ref', 'reference'}
_SALARY_HINTS = {'salary', 'salaries', 'income', 'wage', 'wages', 'pay', 'compensation', 'earnings', 'remuneration'}
_STATUS_HINTS = {'status', 'employment', 'employed', 'working', 'active', 'is_employed', 'occupation'}
_DATE_HINTS = {'date', 'time', 'timestamp', 'created_at', 'updated_at', 'dob', 'birth'}


def _tokenize(name: str) -> set[str]:
    cleaned = re.sub(r'(?<!^)(?=[A-Z])', '_', name)
    tokens = re.split(r'[^a-zA-Z0-9]+', cleaned.lower())
    return {token for token in tokens if token}


def _name_matches(tokens: set[str], hints: set[str]) -> bool:
    return bool(tokens & hints)


def _is_date_series(series: pd.Series) -> bool:
    if pd.api.types.is_datetime64_any_dtype(series):
        return True

    sample = series.dropna().astype(str).head(20)
    if sample.empty:
        return False

    parsed = pd.to_datetime(sample, errors='coerce', infer_datetime_format=True)
    return parsed.notna().mean() >= 0.8


def _column_profile(df: pd.DataFrame, column: str) -> dict[str, Any]:
    series = df[column]
    tokens = _tokenize(column)
    non_null = series.dropna()

    profile = {
        'column': column,
        'tokens': sorted(tokens),
        'dtype': str(series.dtype),
        'missing_count': int(series.isna().sum()),
        'missing_percent': round((series.isna().mean() or 0) * 100, 2),
        'unique_count': int(series.nunique(dropna=True)),
        'unique_ratio': round(series.nunique(dropna=True) / max(len(series), 1), 4),
        'kind': 'text',
        'sample_values': [str(value) for value in non_null.head(5).tolist()],
    }

    if pd.api.types.is_numeric_dtype(series):
        profile['kind'] = 'numeric'
        clean = pd.to_numeric(non_null, errors='coerce').dropna()
        if not clean.empty:
            profile.update({
                'min': float(clean.min()),
                'max': float(clean.max()),
                'median': float(clean.median()),
                'q1': float(clean.quantile(0.25)),
                'q3': float(clean.quantile(0.75)),
                'p95': float(clean.quantile(0.95)),
                'p99': float(clean.quantile(0.99)),
            })
    elif _is_date_series(series) or _name_matches(tokens, _DATE_HINTS):
        profile['kind'] = 'date'
        parsed = pd.to_datetime(non_null, errors='coerce', infer_datetime_format=True).dropna()
        if not parsed.empty:
            profile.update({
                'min': parsed.min().isoformat(),
                'max': parsed.max().isoformat(),
            })
    elif pd.api.types.is_bool_dtype(series):
        profile['kind'] = 'categorical'
    else:
        profile['kind'] = 'categorical' if profile['unique_ratio'] < 0.5 or profile['unique_count'] < 20 else 'text'

    return profile


def _make_rule(
    column: str,
    operator: str | None,
    value: Any,
    confidence: float,
    reason: str,
    category: str,
    severity: str = 'medium',
    rule_text: str | None = None,
) -> dict[str, Any]:
    return {
        'column': column,
        'operator': operator,
        'value': value,
        'confidence': round(float(confidence), 2),
        'reason': reason,
        'category': category,
        'severity': severity,
        'rule_text': rule_text or (f'{column} {operator} {value}' if operator is not None else reason),
    }


def _top_categories(series: pd.Series, limit: int = 5) -> list[str]:
    values = series.dropna().astype(str).str.strip()
    counts = values.value_counts()
    return [str(item) for item in counts.head(limit).index.tolist()]


@log_calls
def suggest_validation_rules(df: pd.DataFrame, dataset_name: str | None = None, source_path: str | None = None) -> dict[str, Any]:
    schema = infer_schema(df)
    profiles = {item['column']: _column_profile(df, item['column']) for item in schema}
    suggestions: list[dict[str, Any]] = []

    numeric_columns = [name for name, profile in profiles.items() if profile['kind'] == 'numeric']
    categorical_columns = [name for name, profile in profiles.items() if profile['kind'] in {'categorical', 'text'}]
    date_columns = [name for name, profile in profiles.items() if profile['kind'] == 'date']

    for column, profile in profiles.items():
        tokens = set(profile['tokens'])
        series = df[column]

        # Age constraints
        if _name_matches(tokens, _AGE_HINTS) and profile['kind'] == 'numeric':
            suggestions.extend([
                _make_rule(column, '>=', 0, 99.0, 'Age fields should not be negative.', 'age_range', 'high', f'{column} >= 0'),
                _make_rule(column, '<=', 120, 97.0, 'Age fields typically cap around 120.', 'age_range', 'high', f'{column} <= 120'),
            ])

        # Percentage / ratio constraints
        if _name_matches(tokens, _PERCENT_HINTS) and profile['kind'] == 'numeric':
            upper = 1 if float(profile.get('max', 0) or 0) <= 1.5 else 100
            confidence = 98.0 if upper == 100 else 96.0
            suggestions.extend([
                _make_rule(column, '>=', 0, confidence, 'Percent-style columns should not be negative.', 'percentage_range', 'high', f'{column} >= 0'),
                _make_rule(column, '<=', upper, confidence, f'Percent-style columns should stay within 0 and {upper}.', 'percentage_range', 'high', f'{column} <= {upper}'),
            ])

        # Salary constraints
        if _name_matches(tokens, _SALARY_HINTS) and profile['kind'] == 'numeric':
            upper_bound = profile.get('p99') or profile.get('max') or 0
            upper_bound = round(float(upper_bound) * 1.5, 2)
            suggestions.extend([
                _make_rule(column, '>=', 0, 99.0, 'Salary-like fields should be non-negative.', 'salary_range', 'high', f'{column} >= 0'),
                _make_rule(column, '<=', upper_bound, 78.0, 'Salary-like fields have a strong upper bound in this dataset.', 'salary_range', 'medium', f'{column} <= {upper_bound}'),
            ])

        # Date constraints
        if profile['kind'] == 'date':
            today = datetime.utcnow().date().isoformat()
            suggestions.extend([
                _make_rule(column, '>=', '1900-01-01', 88.0, 'Date fields should not predate the modern record set.', 'date_range', 'medium', f'{column} >= 1900-01-01'),
                _make_rule(column, '<=', today, 93.0, 'Future dates usually indicate malformed timestamps.', 'date_range', 'high', f'{column} <= {today}'),
            ])

        # ID constraints
        if _name_matches(tokens, _ID_HINTS) or profile['unique_ratio'] >= 0.95:
            if profile['missing_count'] > 0:
                suggestions.append(_make_rule(column, 'not_null', None, 94.0, 'Identifier fields should never be empty.', 'identifier', 'high', f'{column} not_null'))
            suggestions.append({
                'column': column,
                'operator': None,
                'value': None,
                'confidence': 91.0,
                'reason': 'Identifier fields should remain unique across records.',
                'category': 'identifier',
                'severity': 'high',
                'rule_text': f'{column} should be unique',
            })

        # Categorical consistency
        if profile['kind'] == 'categorical':
            values = _top_categories(series)
            if values:
                normalized = {item.strip().lower() for item in values}
                if len(normalized) != len(values):
                    suggestions.append({
                        'column': column,
                        'operator': None,
                        'value': values,
                        'confidence': 84.0,
                        'reason': 'Category values appear to vary only by casing or spacing.',
                        'category': 'categorical_consistency',
                        'severity': 'medium',
                        'rule_text': f'{column} values should be normalized to: {", ".join(values)}',
                    })

    # Logical inconsistency: employment/status vs salary
    salary_column = next((name for name in numeric_columns if _name_matches(set(profiles[name]['tokens']), _SALARY_HINTS)), None)
    status_column = next((name for name in categorical_columns if _name_matches(set(profiles[name]['tokens']), _STATUS_HINTS)), None)
    if salary_column and status_column:
        salary_series = pd.to_numeric(df[salary_column], errors='coerce')
        status_series = df[status_column].astype(str).str.strip().str.lower()
        negative_status_mask = status_series.isin({'no', 'n', 'false', 'unemployed', 'inactive'})
        positive_status_mask = status_series.isin({'yes', 'y', 'true', 'employed', 'active'})
        negative_salary_rate = (salary_series[negative_status_mask] > 0).mean() if negative_status_mask.any() else 0
        positive_null_rate = salary_series[positive_status_mask].isna().mean() if positive_status_mask.any() else 0

        if negative_status_mask.any() and negative_salary_rate > 0.05:
            suggestions.append({
                'column': salary_column,
                'operator': None,
                'value': None,
                'confidence': round(min(98.0, 70.0 + negative_salary_rate * 100), 2),
                'reason': f'When {status_column} is negative, {salary_column} should usually be null or zero.',
                'category': 'logical_inconsistency',
                'severity': 'high',
                'rule_text': f'if {status_column} in {{No, Unemployed, False}} then {salary_column} is_null',
            })

        if positive_status_mask.any() and positive_null_rate > 0.05:
            suggestions.append({
                'column': salary_column,
                'operator': 'not_null',
                'value': None,
                'confidence': round(min(97.0, 72.0 + positive_null_rate * 100), 2),
                'reason': f'When {status_column} is positive, {salary_column} should usually be present.',
                'category': 'logical_inconsistency',
                'severity': 'high',
                'rule_text': f'if {status_column} in {{Yes, Employed, True}} then {salary_column} not_null',
            })

    # Duplicate / ID style consistency suggestions for any highly unique column
    for column, profile in profiles.items():
        if profile['unique_ratio'] >= 0.98 and profile['kind'] != 'date':
            suggestions.append({
                'column': column,
                'operator': 'not_null',
                'value': None,
                'confidence': 90.0,
                'reason': 'Near-unique columns should remain populated and stable.',
                'category': 'identifier',
                'severity': 'medium',
                'rule_text': f'{column} should be not_null and unique',
            })

    # De-duplicate and sort by confidence.
    seen: set[tuple[str, str | None, str]] = set()
    unique_suggestions: list[dict[str, Any]] = []
    for item in suggestions:
        key = (item['column'], item.get('operator'), str(item.get('rule_text')))
        if key in seen:
            continue
        seen.add(key)
        unique_suggestions.append(item)

    unique_suggestions.sort(key=lambda item: (-float(item.get('confidence', 0)), item['column'], item.get('category', '')))

    return {
        'status': 'success',
        'dataset_name': dataset_name,
        'source_path': source_path,
        'columns_analyzed': len(profiles),
        'suggestions': unique_suggestions,
        'summary': {
            'age_rules': sum(1 for item in unique_suggestions if item['category'] == 'age_range'),
            'percentage_rules': sum(1 for item in unique_suggestions if item['category'] == 'percentage_range'),
            'date_rules': sum(1 for item in unique_suggestions if item['category'] == 'date_range'),
            'id_rules': sum(1 for item in unique_suggestions if item['category'] == 'identifier'),
            'salary_rules': sum(1 for item in unique_suggestions if item['category'] == 'salary_range'),
            'logical_rules': sum(1 for item in unique_suggestions if item['category'] == 'logical_inconsistency'),
            'categorical_rules': sum(1 for item in unique_suggestions if item['category'] == 'categorical_consistency'),
        },
        'profiles': list(profiles.values()),
    }