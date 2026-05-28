from __future__ import annotations

from typing import Any

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
