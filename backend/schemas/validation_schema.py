from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


RULE_TYPES = {
    'simple',
    'conditional',
    'range',
    'dependency',
    'uniqueness',
    'allowed_values',
    'pattern_match',
}


class ValidationCondition(BaseModel):
    model_config = ConfigDict(extra='ignore')

    column: str
    operator: str
    value: Any = None


class ValidationRule(BaseModel):
    model_config = ConfigDict(extra='ignore', populate_by_name=True)

    type: str = 'simple'

    column: str | None = None
    operator: str | None = None
    value: Any = None
    severity: str = 'medium'
    if_clause: ValidationCondition | None = Field(default=None, alias='if')
    then_clause: ValidationCondition | None = Field(default=None, alias='then')
    min_value: float | None = Field(default=None, alias='min')
    max_value: float | None = Field(default=None, alias='max')
    source_column: str | None = None
    target_column: str | None = None
    columns: list[str] = Field(default_factory=list)
    values: list[Any] = Field(default_factory=list)
    pattern: str | None = None

    @field_validator('severity')
    @classmethod
    def _validate_severity(cls, value: str) -> str:
        allowed = {'low', 'medium', 'high'}
        if value not in allowed:
            raise ValueError(f'severity must be one of {sorted(allowed)}')
        return value

    @field_validator('type')
    @classmethod
    def _validate_type(cls, value: str) -> str:
        normalized = (value or '').strip().lower()
        if normalized not in RULE_TYPES:
            raise ValueError(f'type must be one of {sorted(RULE_TYPES)}')
        return normalized

    @model_validator(mode='after')
    def _validate_required_fields(self) -> 'ValidationRule':
        if self.type == 'simple':
            if not self.column or not self.operator:
                raise ValueError('simple rules require column and operator')

        if self.type == 'conditional':
            if self.if_clause is None or self.then_clause is None:
                raise ValueError('conditional rules require if/then clauses')

        if self.type == 'range':
            if not self.column:
                raise ValueError('range rules require column')
            if self.min_value is None and self.max_value is None:
                raise ValueError('range rules require min or max')

        if self.type == 'dependency':
            if not self.source_column or not self.target_column:
                raise ValueError('dependency rules require source_column and target_column')

        if self.type == 'uniqueness':
            if not self.column and not self.columns:
                raise ValueError('uniqueness rules require column or columns')

        if self.type == 'allowed_values':
            if not self.column:
                raise ValueError('allowed_values rules require column')
            if not self.values:
                raise ValueError('allowed_values rules require values')

        if self.type == 'pattern_match':
            if not self.column or not self.pattern:
                raise ValueError('pattern_match rules require column and pattern')

        return self


class ValidationRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str
    rules: list[ValidationRule] = Field(default_factory=list)


class ValidationMetric(BaseModel):
    before: int = 0
    after: int = 0
    delta: int = 0
    reduction_percent: float = 0.0
    improved: bool = False


class ValidationResponse(BaseModel):
    status: str = 'success'
    file_path: str
    preview: list[dict[str, Any]] = Field(default_factory=list)
    total_violations: int = 0
    severity_counts: dict[str, int] = Field(default_factory=dict)
    violations: list[dict[str, Any]] = Field(default_factory=list)
