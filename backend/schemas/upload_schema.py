from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class UploadRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str | None = None
    filename: str | None = None


class UploadMetadata(BaseModel):
    filename: str
    dataset_name: str
    file_path: str
    rows: int
    columns: int
    null_counts: dict[str, int] = Field(default_factory=dict)


class UploadResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra='ignore')

    status: str = 'success'
    metadata: UploadMetadata
    schema_: list[dict[str, Any]] = Field(default_factory=list, alias='schema')
    preview: list[dict[str, Any]] = Field(default_factory=list)
