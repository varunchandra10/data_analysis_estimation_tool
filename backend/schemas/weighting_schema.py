from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class WeightRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str
    value_column: str
    weight_column: str
    analysis_type: str = 'mean'
    confidence_level: float = 0.95

    @field_validator('analysis_type')
    @classmethod
    def _validate_analysis_type(cls, value: str) -> str:
        normalized = (value or '').strip().lower()
        if normalized not in {'mean', 'weighted_mean', 'proportion', 'weighted_proportion'}:
            raise ValueError('analysis_type must be one of: mean, weighted_mean, proportion, weighted_proportion')
        return normalized

    @field_validator('confidence_level')
    @classmethod
    def _validate_confidence_level(cls, value: float) -> float:
        if not 0 < value < 1:
            raise ValueError('confidence_level must be between 0 and 1')
        return value


class StatisticsProfileRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str


class WeightResponse(BaseModel):
    status: str = 'success'
    file_path: str
    results: dict[str, Any] = Field(default_factory=dict)
    weights: dict[str, Any] = Field(default_factory=dict)


class RakeRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str
    target_margins: dict[str, dict[str, float]]
    base_weight_column: Optional[str] = None
    output_weight_column: str = 'calibrated_weight'
    max_iter: int = 100
    epsilon: float = 1e-4
    trim_lower: Optional[float] = None
    trim_upper: Optional[float] = None


class RakeResponse(BaseModel):
    status: str = 'success'
    file_path: str
    converged: bool
    iterations: int
    max_diff: float
    kish_effective_sample_size: float
    kish_design_effect: float
    sample_size: int
    weight_column: str
    weight_distribution: dict[str, float]
    marginal_comparisons: list[dict[str, Any]]
    iteration_history: list[dict[str, Any]]
