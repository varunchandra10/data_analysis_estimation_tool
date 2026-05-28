from __future__ import annotations

from typing import Any, Literal, Union

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ValidationCondition(BaseModel):
    model_config = ConfigDict(extra='ignore')

    column: str
    operator: str
    value: Any = None


class BaseRule(BaseModel):
    model_config = ConfigDict(extra='ignore', populate_by_name=True)

    severity: Literal['low', 'medium', 'high', 'critical'] = 'medium'


class SimpleRule(BaseRule):
    type: Literal['simple'] = 'simple'
    column: str
    operator: str
    value: Any = None


class ConditionalRule(BaseRule):
    type: Literal['conditional'] = 'conditional'
    if_clause: ValidationCondition = Field(alias='if')
    then_clause: ValidationCondition = Field(alias='then')


class RangeRule(BaseRule):
    type: Literal['range'] = 'range'
    column: str
    min_value: float | None = Field(default=None, alias='min')
    max_value: float | None = Field(default=None, alias='max')


class DependencyRule(BaseRule):
    type: Literal['dependency'] = 'dependency'
    source_column: str
    source_value: Any = None
    target_column: str
    required: bool = True


class UniquenessRule(BaseRule):
    type: Literal['uniqueness'] = 'uniqueness'
    column: str | None = None
    columns: list[str] = Field(default_factory=list)


class AllowedValuesRule(BaseRule):
    type: Literal['allowed_values'] = 'allowed_values'
    column: str
    values: list[Any] = Field(default_factory=list)


class PatternRule(BaseRule):
    type: Literal['pattern', 'pattern_match'] = 'pattern'
    column: str
    regex: str | None = Field(default=None, alias='pattern')


class CompositeRule(BaseRule):
    type: Literal['composite'] = 'composite'
    operator: Literal['and', 'or'] = 'and'
    rules: list[ValidationRule] = Field(default_factory=list)


ValidationRule = Union[
    SimpleRule,
    ConditionalRule,
    RangeRule,
    DependencyRule,
    UniquenessRule,
    AllowedValuesRule,
    PatternRule,
    CompositeRule,
]


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


class ValidationResponseData(BaseModel):
    total_violations: int = 0
    severity_counts: dict[str, int] = Field(default_factory=dict)
    violations: list[dict[str, Any]] = Field(default_factory=list)


class ValidationResponse(BaseModel):
    status: str = 'success'
    message: str = 'Validation completed'
    file_path: str | None = None
    preview: list[dict[str, Any]] = Field(default_factory=list)
    data: ValidationResponseData
    meta: dict[str, Any] = Field(default_factory=dict)
