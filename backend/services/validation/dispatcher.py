from __future__ import annotations

from typing import Any

import pandas as pd

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
from services.validation import evaluators


class RuleDispatcher:
    """
    Dispatches ValidationRules to their corresponding evaluator functions safely.
    """
    
    @classmethod
    def evaluate(cls, df: pd.DataFrame, rule: ValidationRule) -> list[dict[str, Any]]:
        # Map the discriminated union instances to their evaluators
        if isinstance(rule, SimpleRule):
            return evaluators.evaluate_simple(df, rule)
        elif isinstance(rule, ConditionalRule):
            return evaluators.evaluate_conditional(df, rule)
        elif isinstance(rule, RangeRule):
            return evaluators.evaluate_range(df, rule)
        elif isinstance(rule, DependencyRule):
            return evaluators.evaluate_dependency(df, rule)
        elif isinstance(rule, UniquenessRule):
            return evaluators.evaluate_uniqueness(df, rule)
        elif isinstance(rule, AllowedValuesRule):
            return evaluators.evaluate_allowed_values(df, rule)
        elif isinstance(rule, PatternRule):
            return evaluators.evaluate_pattern(df, rule)
        elif isinstance(rule, CompositeRule):
            return evaluators.evaluate_composite(df, rule, cls.evaluate)
        
        # If a rule slips through or is unsupported, safely return no violations.
        return []
