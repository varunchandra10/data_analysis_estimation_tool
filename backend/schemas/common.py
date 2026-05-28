from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class BaseAPIResponse(BaseModel):
    model_config = ConfigDict(extra='ignore')

    status: str = Field(default='success')
    message: str = Field(default='')
    data: Any = Field(default=None)
    meta: dict[str, Any] = Field(default_factory=dict)


def success_response(message: str, data: Any = None, meta: dict[str, Any] | None = None, **legacy: Any) -> dict[str, Any]:
    response = BaseAPIResponse(status='success', message=message, data=data, meta=meta or {})
    return {**response.model_dump(), **legacy}


def error_response(message: str, data: Any = None, meta: dict[str, Any] | None = None, **legacy: Any) -> dict[str, Any]:
    response = BaseAPIResponse(status='error', message=message, data=data, meta=meta or {})
    return {**response.model_dump(), **legacy}
