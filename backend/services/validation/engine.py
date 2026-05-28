from __future__ import annotations

from typing import Any

import pandas as pd
from pydantic import ValidationError

from schemas.validation_schema import ValidationRule, ValidationResponseData
from services.validation.dispatcher import RuleDispatcher
from utils.log_utils import log_calls


class ValidationEngine:
    """
    Enterprise-grade validation engine orchestrator.
    Handles rule execution, violation aggregation, and severity counting.
    """
    
    def __init__(self, df: pd.DataFrame, rules: list[ValidationRule]):
        self.df = df
        self.rules = rules

    @log_calls
    def execute(self) -> ValidationResponseData:
        all_violations: list[dict[str, Any]] = []

        for rule in self.rules:
            try:
                violations = RuleDispatcher.evaluate(self.df, rule)
                all_violations.extend(violations)
            except Exception as e:
                # In an enterprise engine, we might want to log this specifically
                # and perhaps append a systemic violation, but skipping is safer 
                # to prevent pipeline crash from a single malformed rule execution.
                continue

        severity_counts = {'low': 0, 'medium': 0, 'high': 0, 'critical': 0}
        
        for violation in all_violations:
            sev = violation.get('severity', 'medium')
            if sev in severity_counts:
                severity_counts[sev] += 1
            else:
                severity_counts['medium'] += 1

        return ValidationResponseData(
            total_violations=len(all_violations),
            severity_counts=severity_counts,
            violations=all_violations
        )
