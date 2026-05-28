from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class CleaningRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str
    strategies: dict[str, str] = Field(default_factory=dict)


class DuplicateRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str
    strategy: str = 'detect'


class OutlierRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str
    column: str
    method: str
