from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd


_VALID_SEVERITIES = {'low', 'medium', 'high'}


def _normalize_severity(value: str | None) -> str:
    normalized = (value or 'medium').strip().lower()
    return normalized if normalized in _VALID_SEVERITIES else 'medium'


def _coerce_numeric(value: Any) -> Any:
    try:
        return pd.to_numeric(pd.Series([value]), errors='raise').iloc[0]
    except Exception:
        return value


def _simple_mask(series: pd.Series, operator: str, value: Any) -> pd.Series:
    op = (operator or '').strip().lower()

    if op == 'is_null':
        return series.isna()
    if op == 'not_null':
        return series.notna()

    right = _coerce_numeric(value)
    left = series

    if op in {'>', '<', '>=', '<='}:
        left = pd.to_numeric(series, errors='coerce')
        right = _coerce_numeric(value)

    if op == '>':
        return left > right
    if op == '<':
        return left < right
    if op == '>=':
        return left >= right
    if op == '<=':
        return left <= right
    if op == '==':
        return left.astype(str) == str(right)
    if op == '!=':
        return left.astype(str) != str(right)

    return pd.Series(False, index=series.index)


def _extract_violations(mask: pd.Series, column: str, rule_type: str, expected: Any, actual_series: pd.Series, severity: str) -> list[dict[str, Any]]:
    if mask.empty or not mask.any():
        return []

    positions = np.flatnonzero(mask.to_numpy())
    violations: list[dict[str, Any]] = []
    for pos in positions:
        row_index = int(actual_series.index[pos]) if isinstance(actual_series.index[pos], (int, np.integer)) else int(pos)
        raw_actual = actual_series.iloc[pos]
        actual = None if pd.isna(raw_actual) else str(raw_actual)
        violations.append(
            {
                'row_index': row_index,
                'column': column,
                'rule_type': rule_type,
                'expected': expected,
                'actual': actual,
                'severity': severity,
            }
        )
    return violations


def _simple_rule(df: pd.DataFrame, rule: dict[str, Any]) -> list[dict[str, Any]]:
    column = rule.get('column')
    if column not in df.columns:
        return []

    severity = _normalize_severity(rule.get('severity'))
    operator = rule.get('operator', '==')
    value = rule.get('value')

    valid_mask = _simple_mask(df[column], operator, value)
    violation_mask = ~valid_mask.fillna(False)
    expected = 'null' if operator == 'is_null' else value
    return _extract_violations(violation_mask, column, 'simple', expected, df[column], severity)


def _conditional_rule(df: pd.DataFrame, rule: dict[str, Any]) -> list[dict[str, Any]]:
    if_clause = rule.get('if') or rule.get('if_clause') or {}
    then_clause = rule.get('then') or rule.get('then_clause') or {}

    if_col = if_clause.get('column')
    then_col = then_clause.get('column')
    if if_col not in df.columns or then_col not in df.columns:
        return []

    severity = _normalize_severity(rule.get('severity'))

    if_mask = _simple_mask(df[if_col], if_clause.get('operator', '=='), if_clause.get('value')).fillna(False)
    then_mask = _simple_mask(df[then_col], then_clause.get('operator', '=='), then_clause.get('value')).fillna(False)
    violation_mask = if_mask & ~then_mask

    expected = 'null' if then_clause.get('operator') == 'is_null' else then_clause.get('value')
    return _extract_violations(violation_mask, then_col, 'conditional', expected, df[then_col], severity)


def _range_rule(df: pd.DataFrame, rule: dict[str, Any]) -> list[dict[str, Any]]:
    column = rule.get('column')
    if column not in df.columns:
        return []

    severity = _normalize_severity(rule.get('severity'))
    minimum = rule.get('min', rule.get('min_value'))
    maximum = rule.get('max', rule.get('max_value'))

    numeric = pd.to_numeric(df[column], errors='coerce')
    valid_mask = pd.Series(True, index=df.index)
    if minimum is not None:
        valid_mask &= numeric >= float(minimum)
    if maximum is not None:
        valid_mask &= numeric <= float(maximum)

    violation_mask = ~valid_mask.fillna(False)
    return _extract_violations(violation_mask, column, 'range', {'min': minimum, 'max': maximum}, df[column], severity)


def _dependency_rule(df: pd.DataFrame, rule: dict[str, Any]) -> list[dict[str, Any]]:
    source = rule.get('source_column')
    target = rule.get('target_column')
    if source not in df.columns or target not in df.columns:
        return []

    severity = _normalize_severity(rule.get('severity'))

    trigger_mask = df[source].astype(str).str.strip().str.lower().isin({'yes', 'true', '1'})
    violation_mask = trigger_mask & df[target].isna()
    return _extract_violations(violation_mask, target, 'dependency', 'not_null', df[target], severity)


def _uniqueness_rule(df: pd.DataFrame, rule: dict[str, Any]) -> list[dict[str, Any]]:
    columns = rule.get('columns') or ([rule.get('column')] if rule.get('column') else [])
    columns = [col for col in columns if col in df.columns]
    if not columns:
        return []

    severity = _normalize_severity(rule.get('severity'))
    duplicated_mask = df.duplicated(subset=columns, keep=False)
    label = ','.join(columns)
    actual_series = df[columns[0]] if len(columns) == 1 else df[columns].astype(str).agg('|'.join, axis=1)
    return _extract_violations(duplicated_mask, label, 'uniqueness', 'unique', actual_series, severity)


def _allowed_values_rule(df: pd.DataFrame, rule: dict[str, Any]) -> list[dict[str, Any]]:
    column = rule.get('column')
    if column not in df.columns:
        return []

    severity = _normalize_severity(rule.get('severity'))
    allowed_values = {str(value) for value in (rule.get('values') or [])}

    series = df[column]
    valid_mask = series.isna() | series.astype(str).isin(allowed_values)
    violation_mask = ~valid_mask
    return _extract_violations(violation_mask, column, 'allowed_values', sorted(allowed_values), series, severity)


def _pattern_match_rule(df: pd.DataFrame, rule: dict[str, Any]) -> list[dict[str, Any]]:
    column = rule.get('column')
    if column not in df.columns:
        return []

    severity = _normalize_severity(rule.get('severity'))
    pattern = rule.get('pattern')
    if not pattern:
        return []

    series = df[column].astype(str)
    valid_mask = df[column].isna() | series.str.match(pattern, na=False)
    violation_mask = ~valid_mask
    return _extract_violations(violation_mask, column, 'pattern_match', pattern, df[column], severity)


def run_validation_dsl(df: pd.DataFrame, rules: list[dict[str, Any]]) -> dict[str, Any]:
    all_violations: list[dict[str, Any]] = []

    evaluators = {
        'simple': _simple_rule,
        'conditional': _conditional_rule,
        'range': _range_rule,
        'dependency': _dependency_rule,
        'uniqueness': _uniqueness_rule,
        'allowed_values': _allowed_values_rule,
        'pattern_match': _pattern_match_rule,
    }

    for rule in rules or []:
        rule_type = str(rule.get('type', 'simple')).strip().lower()
        evaluator = evaluators.get(rule_type)
        if evaluator is None:
            continue
        all_violations.extend(evaluator(df, rule))

    severity_counts = {'low': 0, 'medium': 0, 'high': 0}
    for violation in all_violations:
        severity = _normalize_severity(violation.get('severity'))
        severity_counts[severity] += 1

    return {
        'total_violations': len(all_violations),
        'severity_counts': severity_counts,
        'violations': all_violations,
    }
