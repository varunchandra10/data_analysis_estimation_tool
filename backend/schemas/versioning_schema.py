from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProjectCreateRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    project_id: str | None = None


class RawDatasetSaveRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str
    project_id: str | None = None
    filename: str = 'dataset.csv'


class VersionCreateRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str
    version_name: str
    project_id: str | None = None
    parent: str | None = None
    operations: list[str] = Field(default_factory=list)
    extra_manifest: dict[str, Any] | None = None


class DatasetCompressRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    project_id: str | None = None
    output_path: str | None = None
    remove_source: bool = False


class RollbackRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    version_name: str
    project_id: str | None = None
    dataset_name: str | None = None
    restore_to: str | None = None


class HashRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str
    expected_hash: str | None = None
    version_name: str | None = None
    project_id: str | None = None


class FileTransformRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str
    output_path: str | None = None
    key: str | None = None
    remove_source: bool = False


class ExportRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str
    format: str = Field(default='csv')
    dataset_name: str | None = None

    @field_validator('format')
    @classmethod
    def normalize_format(cls, value: str) -> str:
        return value.lower().strip()


class SignedDownloadTokenRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str
    dataset_name: str | None = None
    expires_seconds: int = 3600


class ArchiveOldVersionsRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    project_id: str | None = None
    keep_latest: int = 2
    key: str | None = None


class ArchiveVersionRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    version_name: str
    project_id: str | None = None
    key: str | None = None


class TempDecryptRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    archive_path: str
    project_id: str | None = None
    key: str | None = None
    output_path: str | None = None
    remove_source: bool = False


class TempCleanupRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    file_path: str


class DeleteDatasetFileRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    project_id: str | None = None


class ReportGenerateRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    version_name: str
    project_id: str | None = None
    dataset_name: str | None = None
    output_path: str | None = None


class QualityScoreRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')

    version_name: str
    project_id: str | None = None
    dataset_name: str | None = None
