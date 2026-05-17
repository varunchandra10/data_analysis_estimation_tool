from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from services.compression_engine import compress_dataset
from services.encryption_engine import encrypt_file
from services.versioning_engine import DEFAULT_PROJECT_ID, list_versions
from utils.dataset_storage import archive_dir, resolve_dataset_name
from utils.log_utils import log_calls


def _manifest_path(version_info: dict[str, object]) -> Path:
    return Path(str(version_info["manifest_path"]))


def _update_manifest_archive_metadata(
    version_info: dict[str, object],
    archive_path: Path,
) -> None:
    manifest_path = _manifest_path(version_info)
    if not manifest_path.exists():
        return

    with open(manifest_path, "r", encoding="utf-8") as handle:
        manifest = json.load(handle)

    manifest["archived"] = True
    manifest["archived_at"] = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    manifest["archive_path"] = str(archive_path)

    with open(manifest_path, "w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=4)


@log_calls
def archive_version(
    version_name: str,
    project_id: str = DEFAULT_PROJECT_ID,
    key: str | bytes | None = None,
) -> Path:
    versions = list_versions(project_id)
    version_info = next((item for item in versions if item["version"] == version_name), None)

    if version_info is None:
        raise FileNotFoundError(f"Version not found: {version_name}")

    dataset_path = Path(version_info["dataset_path"])
    if not dataset_path.exists():
        raise FileNotFoundError(f"Version dataset not found: {dataset_path}")

    dataset_name = resolve_dataset_name(str(version_info["dataset_name"]))
    current_archive_dir = archive_dir(dataset_name)
    compressed_path = current_archive_dir / f"{version_name}.csv.gz"
    encrypted_path = current_archive_dir / f"{version_name}.csv.gz.enc"

    compress_dataset(
        dataset_path,
        output_path=compressed_path,
        remove_source=True,
    )

    encrypt_file(
        compressed_path,
        output_path=encrypted_path,
        key=key,
        remove_source=True,
    )

    _update_manifest_archive_metadata(version_info, encrypted_path)
    return encrypted_path


@log_calls
def archive_old_versions(
    project_id: str = DEFAULT_PROJECT_ID,
    keep_latest: int = 2,
    key: str | bytes | None = None,
) -> list[Path]:
    versions = list_versions(project_id)
    if len(versions) <= keep_latest:
        return []

    archived_paths: list[Path] = []

    for version_info in versions[:-keep_latest]:
        archived_paths.append(
            archive_version(
                version_name=version_info["version"],
                project_id=project_id,
                key=key,
            )
        )

    return archived_paths


@log_calls
def get_archive_status(
    project_id: str = DEFAULT_PROJECT_ID,
    keep_latest: int = 2,
) -> dict[str, object]:
    versions = list_versions(project_id)
    archived_files = sorted(
        path.name
        for item in versions
        for path in archive_dir(str(item["dataset_name"])).glob("*.enc")
    )

    return {
        "project_id": project_id,
        "keep_latest": keep_latest,
        "active_versions": [item["version"] for item in versions[-keep_latest:]],
        "archived_versions": [item["version"] for item in versions[:-keep_latest]],
        "archive_files": archived_files,
    }
