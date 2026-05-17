from __future__ import annotations

import json
import re
import tempfile
from pathlib import Path

from core.config import BASE_DIR


DATASETS_ROOT = BASE_DIR / "backend" / "datasets"
SERVER_LOGS_ROOT = BASE_DIR / "backend" / "logs"
TEMP_ROOT = Path(tempfile.gettempdir()) / "daet"

PROCESSED_DIRNAME = "processed"
ARCHIVE_DIRNAME = "archive"
LOGS_DIRNAME = "logs"
VERSIONS_DIRNAME = "versions"
MANIFESTS_DIRNAME = "manifests"
AI_CACHE_FILENAME = "ai_cache.json"
AUDIT_LOG_FILENAME = "audit_log.json"

STAGE_PREFIXES = {
    "raw",
    "clean",
    "cleaned",
    "outlier",
    "outlier_detected",
    "validation",
    "validated",
    "estimation",
    "estimated",
    "deduped",
    "deduplicated",
}


def sanitize_dataset_name(dataset_name: str) -> str:
    dataset_stem = Path(dataset_name).stem
    dataset_stem = re.sub(r"[^A-Za-z0-9._-]+", "_", dataset_stem).strip("._-")
    return dataset_stem or "dataset"


def _strip_stage_prefix(dataset_name: str) -> str:
    normalized = sanitize_dataset_name(dataset_name)

    for stage_name in sorted(STAGE_PREFIXES, key=len, reverse=True):
        prefix = f"{stage_name}_"
        if normalized.startswith(prefix):
            stripped = normalized[len(prefix):].strip("._-")
            if stripped:
                return stripped

    return normalized


def dataset_dir(dataset_name: str) -> Path:
    return DATASETS_ROOT / _strip_stage_prefix(dataset_name)


def processed_dir(dataset_name: str) -> Path:
    return dataset_dir(dataset_name) / PROCESSED_DIRNAME


def archive_dir(dataset_name: str) -> Path:
    return dataset_dir(dataset_name) / ARCHIVE_DIRNAME


def dataset_logs_dir(dataset_name: str) -> Path:
    return dataset_dir(dataset_name) / LOGS_DIRNAME


def versions_dir(dataset_name: str) -> Path:
    return processed_dir(dataset_name) / VERSIONS_DIRNAME


def manifests_dir(dataset_name: str) -> Path:
    return processed_dir(dataset_name) / MANIFESTS_DIRNAME


def ai_cache_path(dataset_name: str) -> Path:
    return dataset_dir(dataset_name) / AI_CACHE_FILENAME


def audit_log_path(dataset_name: str) -> Path:
    return dataset_logs_dir(dataset_name) / AUDIT_LOG_FILENAME


def temp_root() -> Path:
    TEMP_ROOT.mkdir(parents=True, exist_ok=True)
    return TEMP_ROOT


def resolve_dataset_name(dataset_ref: str | Path) -> str:
    path = Path(dataset_ref)

    for parent in [path.parent, *path.parents]:
        if parent == parent.parent:
            break

        if parent.name in {PROCESSED_DIRNAME, ARCHIVE_DIRNAME, LOGS_DIRNAME}:
            return parent.parent.name

        if parent.name in {VERSIONS_DIRNAME, MANIFESTS_DIRNAME} and parent.parent.name == PROCESSED_DIRNAME:
            return parent.parent.parent.name

        if parent.parent == DATASETS_ROOT:
            return parent.name

    return _strip_stage_prefix(path.name)


def ensure_dataset_layout(dataset_name: str) -> Path:
    root = dataset_dir(dataset_name)

    for directory in (
        DATASETS_ROOT,
        SERVER_LOGS_ROOT,
        root,
        processed_dir(dataset_name),
        archive_dir(dataset_name),
        dataset_logs_dir(dataset_name),
        versions_dir(dataset_name),
        manifests_dir(dataset_name),
    ):
        directory.mkdir(parents=True, exist_ok=True)

    _migrate_legacy_stage_files(root)

    legacy_processed_cache = processed_dir(dataset_name) / AI_CACHE_FILENAME
    cache_file = ai_cache_path(dataset_name)
    if legacy_processed_cache.exists() and not cache_file.exists():
        legacy_processed_cache.replace(cache_file)

    if not cache_file.exists():
        with open(cache_file, "w", encoding="utf-8") as handle:
            json.dump(
                {
                    "generated_at": None,
                    "missing_values": {},
                    "outliers": {},
                    "validation": {},
                    "weighting": {},
                    "dataset_summary": {},
                },
                handle,
                indent=4,
            )

    return root


def _migrate_legacy_stage_files(root: Path) -> None:
    processed_root = root / PROCESSED_DIRNAME

    for path in list(root.iterdir()):
        if path == processed_root:
            continue

        if path.is_file():
            if path.name == AI_CACHE_FILENAME:
                continue
            target = processed_root / path.name
            if not target.exists():
                path.replace(target)


def cleanup_legacy_root_directories() -> None:
    for name in ("ai_cache", "archive", "logs", "manifests", "versions", "temp_workspace", "project_001"):
        legacy_path = DATASETS_ROOT / name
        if legacy_path.exists() and legacy_path.is_dir():
            try:
                next(legacy_path.iterdir())
            except StopIteration:
                legacy_path.rmdir()
