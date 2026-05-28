from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class PipelineRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str
    project_id: str | None = None
    confidence_level: float = 0.95


class PipelineStage(BaseModel):
    stage: str
    status: str
    version: str | None = None
    file_path: str | None = None
    timestamp: str | None = None
    rows: int | None = None
    rows_affected: int | None = None
    total_outliers: int | None = None
    total_violations: int | None = None


class PipelineResponse(BaseModel):
    status: str = 'success'
    pipeline_status: str = 'completed'
    dataset_name: str | None = None
    current_version: str | None = None
    steps_completed: list[str] = Field(default_factory=list)
    stage_results: list[PipelineStage] = Field(default_factory=list)
    version_lineage: list[dict[str, Any]] = Field(default_factory=list)
    report_path: str | None = None
    report_size_bytes: int | None = None
    summary: dict[str, Any] = Field(default_factory=dict)
