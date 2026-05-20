from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AIRecommendationRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str
    schema_: list[dict[str, Any]] = Field(default_factory=list, alias='schema')


class AIRecommendationResponse(BaseModel):
    status: str = 'success'
    source_path: str | None = None
    cached: bool = False
    recommendations: list[dict[str, Any]] = Field(default_factory=list)


class AIExplanationRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    recommendations: list[dict[str, Any]] = Field(default_factory=list)
    validation_summary: dict[str, Any] = Field(default_factory=dict)
    weighting_summary: dict[str, Any] = Field(default_factory=dict)
    quality_summary: dict[str, Any] = Field(default_factory=dict)


class AIExplanationResponse(BaseModel):
    status: str = 'success'
    explanations: list[dict[str, Any]] = Field(default_factory=list)
