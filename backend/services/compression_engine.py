from __future__ import annotations

import gzip
import shutil
from pathlib import Path
from typing import Iterable

from services.versioning_engine import (
    DEFAULT_PROJECT_ID,
    get_version_path,
    list_versions,
)
from utils.dataset_storage import archive_dir
from utils.log_utils import log_calls


def _default_compressed_path(source_path: Path) -> Path:
    if source_path.suffix == ".gz":
        return source_path
    return source_path.with_name(f"{source_path.name}.gz")


def _default_decompressed_path(source_path: Path) -> Path:
    if source_path.suffix != ".gz":
        return source_path.with_suffix(".csv")
    return source_path.with_suffix("")


@log_calls
def compress_dataset(
    file_path: str | Path,
    output_path: str | Path | None = None,
    remove_source: bool = False,
) -> Path:
    source_path = Path(file_path)

    if not source_path.exists():
        raise FileNotFoundError(f"File not found: {source_path}")

    target_path = Path(output_path) if output_path else _default_compressed_path(source_path)
    target_path.parent.mkdir(parents=True, exist_ok=True)

    with open(source_path, "rb") as source_handle, gzip.open(target_path, "wb") as target_handle:
        shutil.copyfileobj(source_handle, target_handle)

    if remove_source:
        source_path.unlink()

    return target_path


@log_calls
def decompress_dataset(
    file_path: str | Path,
    output_path: str | Path | None = None,
    remove_source: bool = False,
) -> Path:
    source_path = Path(file_path)

    if not source_path.exists():
        raise FileNotFoundError(f"File not found: {source_path}")

    target_path = Path(output_path) if output_path else _default_decompressed_path(source_path)
    target_path.parent.mkdir(parents=True, exist_ok=True)

    with gzip.open(source_path, "rb") as source_handle, open(target_path, "wb") as target_handle:
        shutil.copyfileobj(source_handle, target_handle)

    if remove_source:
        source_path.unlink()

    return target_path


@log_calls
def archive_old_versions(
    project_id: str = DEFAULT_PROJECT_ID,
    keep_latest: int = 2,
    remove_source: bool = False,
) -> list[Path]:
    versions = list_versions(project_id)
    if len(versions) <= keep_latest:
        return []

    archive_dir = _archive_dir(project_id)
    archived_paths: list[Path] = []

    for version_info in versions[:-keep_latest]:
        version_name = version_info["version"]
        dataset_path = Path(get_version_path(project_id, version_name))

        if not dataset_path.exists():
            continue

        archive_path = archive_dir(str(version_info["dataset_name"])) / f"{version_name}.csv.gz"
        compressed_path = compress_dataset(
            dataset_path,
            output_path=archive_path,
            remove_source=remove_source,
        )
        archived_paths.append(compressed_path)

    return archived_paths


@log_calls
def get_archive_candidates(
    project_id: str = DEFAULT_PROJECT_ID,
    keep_latest: int = 2,
) -> list[dict[str, str]]:
    versions = list_versions(project_id)
    if len(versions) <= keep_latest:
        return []

    return [
        {
            "version": item["version"],
            "dataset_path": item["dataset_path"],
            "manifest_path": item["manifest_path"],
        }
        for item in versions[:-keep_latest]
    ]
