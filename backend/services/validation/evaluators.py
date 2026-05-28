from __future__ import annotations

import re
from typing import Any

import pandas as pd
import numpy as np

from schemas.validation_schema import (
    ValidationRule,
    SimpleRule,
    ConditionalRule,
    RangeRule,
    DependencyRule,
    UniquenessRule,
    AllowedValuesRule,
    PatternRule,
    CompositeRule
)


def _coerce_numeric(value: Any) -> Any:
    try:
        if pd.isna(value):
            return value
        return pd.to_numeric(pd.Series([value]), errors='raise').iloc[0]
    except Exception:
        return value


def _build_simple_mask(series: pd.Series, operator: str, value: Any) -> pd.Series:
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
        # numeric comparisons with NA result in False
        
        if op == '>': return left > right
        if op == '<': return left < right
        if op == '>=': return left >= right
        if op == '<=': return left <= right

    if op == '==':
        return left.astype(str).str.strip() == str(right).strip()
    if op == '!=':
        return left.astype(str).str.strip() != str(right).strip()

    return pd.Series(False, index=series.index)


def _extract_violations(df: pd.DataFrame, mask: pd.Series, column: str, rule_type: str, expected: Any, actual_series: pd.Series | None, severity: str) -> list[dict[str, Any]]:
    """Optimized violation extraction using zip on boolean masked data."""
    if mask.empty or not mask.any():
        return []

    # Get rows where mask is True
    violating_indices = df.index[mask]
    
    if actual_series is not None:
        violating_values = actual_series.loc[mask]
    else:
        violating_values = pd.Series([None] * len(violating_indices), index=violating_indices)

    violations = []
    # Zip is highly optimized at the C level in Python for iteration
    for idx, val in zip(violating_indices, violating_values):
        actual_val = None if pd.isna(val) else str(val)
        violations.append({
            'row_index': int(idx),
            'column': column,
            'rule_type': rule_type,
            'expected': expected,
            'actual': actual_val,
            'severity': severity,
        })
        
    return violations


def evaluate_simple(df: pd.DataFrame, rule: SimpleRule) -> list[dict[str, Any]]:
    if rule.column not in df.columns:
        return []

    valid_mask = _build_simple_mask(df[rule.column], rule.operator, rule.value)
    violation_mask = ~valid_mask.fillna(False)
    
    expected = 'null' if rule.operator == 'is_null' else rule.value
    return _extract_violations(df, violation_mask, rule.column, 'simple', expected, df[rule.column], rule.severity)


def evaluate_conditional(df: pd.DataFrame, rule: ConditionalRule) -> list[dict[str, Any]]:
    if_col = rule.if_clause.column
    then_col = rule.then_clause.column
    if if_col not in df.columns or then_col not in df.columns:
        return []

    if_mask = _build_simple_mask(df[if_col], rule.if_clause.operator, rule.if_clause.value).fillna(False)
    then_mask = _build_simple_mask(df[then_col], rule.then_clause.operator, rule.then_clause.value).fillna(False)
    
    violation_mask = if_mask & ~then_mask

    expected = 'null' if rule.then_clause.operator == 'is_null' else rule.then_clause.value
    return _extract_violations(df, violation_mask, then_col, 'conditional', expected, df[then_col], rule.severity)


def evaluate_range(df: pd.DataFrame, rule: RangeRule) -> list[dict[str, Any]]:
    if rule.column not in df.columns:
        return []

    numeric_series = pd.to_numeric(df[rule.column], errors='coerce')
    valid_mask = pd.Series(True, index=df.index)
    
    if rule.min_value is not None:
        valid_mask &= (numeric_series >= rule.min_value)
    if rule.max_value is not None:
        valid_mask &= (numeric_series <= rule.max_value)

    violation_mask = ~valid_mask.fillna(False)
    return _extract_violations(df, violation_mask, rule.column, 'range', {'min': rule.min_value, 'max': rule.max_value}, df[rule.column], rule.severity)


def evaluate_dependency(df: pd.DataFrame, rule: DependencyRule) -> list[dict[str, Any]]:
    if rule.source_column not in df.columns or rule.target_column not in df.columns:
        return []

    # E.g., if source_value is None, we just check truthiness. If provided, check equality.
    if rule.source_value is not None:
        trigger_mask = df[rule.source_column].astype(str).str.strip().str.lower() == str(rule.source_value).strip().lower()
    else:
        trigger_mask = df[rule.source_column].astype(str).str.strip().str.lower().isin({'yes', 'true', '1'})
        
    if rule.required:
        target_invalid_mask = df[rule.target_column].isna() | (df[rule.target_column].astype(str).str.strip() == '')
    else:
        # If required = False, it means it must be null
        target_invalid_mask = df[rule.target_column].notna() & (df[rule.target_column].astype(str).str.strip() != '')

    violation_mask = trigger_mask & target_invalid_mask
    expected = 'not_null' if rule.required else 'is_null'
    
    return _extract_violations(df, violation_mask, rule.target_column, 'dependency', expected, df[rule.target_column], rule.severity)


def evaluate_uniqueness(df: pd.DataFrame, rule: UniquenessRule) -> list[dict[str, Any]]:
    cols = rule.columns if rule.columns else ([rule.column] if rule.column else [])
    cols = [col for col in cols if col in df.columns]
    
    if not cols:
        return []

    duplicated_mask = df.duplicated(subset=cols, keep=False)
    label = ','.join(cols)
    
    if len(cols) == 1:
        actual_series = df[cols[0]]
    else:
        # Combine columns as strings for a single actual value
        actual_series = df[cols].astype(str).agg('|'.join, axis=1)
        
    return _extract_violations(df, duplicated_mask, label, 'uniqueness', 'unique', actual_series, rule.severity)


def evaluate_allowed_values(df: pd.DataFrame, rule: AllowedValuesRule) -> list[dict[str, Any]]:
    if rule.column not in df.columns:
        return []

    allowed_set = {str(val).strip() for val in rule.values}
    
    series_str = df[rule.column].astype(str).str.strip()
    valid_mask = df[rule.column].isna() | series_str.isin(allowed_set)
    
    violation_mask = ~valid_mask
    return _extract_violations(df, violation_mask, rule.column, 'allowed_values', sorted(allowed_set), df[rule.column], rule.severity)


def evaluate_pattern(df: pd.DataFrame, rule: PatternRule) -> list[dict[str, Any]]:
    if rule.column not in df.columns or not rule.regex:
        return []

    series_str = df[rule.column].astype(str)
    # Using Pandas vectorized str.match (or str.contains depending on how strict we want to be)
    # Regex matching might fail if the regex is malformed, we can wrap it if needed.
    try:
        valid_mask = df[rule.column].isna() | series_str.str.contains(rule.regex, regex=True, na=False)
    except re.error:
        valid_mask = pd.Series(True, index=df.index)
        
    violation_mask = ~valid_mask
    return _extract_violations(df, violation_mask, rule.column, 'pattern_match', rule.regex, df[rule.column], rule.severity)


def _evaluate_composite_recursive(df: pd.DataFrame, rule: CompositeRule, evaluate_fn) -> pd.Series:
    """Returns a valid mask for the composite rule."""
    if not rule.rules:
        return pd.Series(True, index=df.index)

    masks = []
    for subrule in rule.rules:
        if isinstance(subrule, CompositeRule):
            sub_mask = _evaluate_composite_recursive(df, subrule, evaluate_fn)
            masks.append(sub_mask)
        else:
            # We need the violation mask to infer the valid mask
            # But it's easier if our base functions returned masks directly.
            # As a workaround for the DSL engine, we can evaluate the subrule, 
            # extract row_indices, and build a boolean mask from violations.
            violations = evaluate_fn(df, subrule)
            violation_indices = [v['row_index'] for v in violations]
            
            valid_mask = pd.Series(True, index=df.index)
            valid_mask.loc[valid_mask.index.isin(violation_indices)] = False
            masks.append(valid_mask)

    if not masks:
        return pd.Series(True, index=df.index)
        
    if rule.operator == 'and':
        final_mask = masks[0]
        for m in masks[1:]:
            final_mask &= m
    else:
        final_mask = masks[0]
        for m in masks[1:]:
            final_mask |= m
            
    return final_mask


def evaluate_composite(df: pd.DataFrame, rule: CompositeRule, dispatcher_evaluate_fn) -> list[dict[str, Any]]:
    valid_mask = _evaluate_composite_recursive(df, rule, dispatcher_evaluate_fn)
    violation_mask = ~valid_mask.fillna(False)
    
    # For a composite rule, the column and actual are somewhat ambiguous.
    # We will use 'composite' as the column name and actual value.
    return _extract_violations(df, violation_mask, 'composite', 'composite', rule.operator, None, rule.severity)
