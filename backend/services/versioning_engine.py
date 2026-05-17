from __future__ import annotations

import json
import shutil
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable

import pandas as pd

from core.config import DATASETS_DIR
from utils.log_utils import log_calls
from utils.file_utils import safe_json_replace
from utils.dataset_storage import (
    archive_dir,
    cleanup_legacy_root_directories,
    dataset_dir,
    ensure_dataset_layout,
    manifests_dir,
    processed_dir,
    resolve_dataset_name,
    sanitize_dataset_name,
    temp_root,
    versions_dir,
)


STORAGE_DIR = DATASETS_DIR
DEFAULT_PROJECT_ID = 'project_001'
DATASET_FILENAME = 'dataset.csv'
MANIFEST_SUFFIX = '_manifest.json'


def _project_dir(project_id: str = DEFAULT_PROJECT_ID) -> Path:
    return STORAGE_DIR


def _datasets_root(project_id: str = DEFAULT_PROJECT_ID) -> Path:
    return _project_dir(project_id)


def _versions_dir(project_id: str = DEFAULT_PROJECT_ID) -> Path:
    return _project_dir(project_id)


def _manifests_dir(project_id: str = DEFAULT_PROJECT_ID) -> Path:
    return _project_dir(project_id)


def _logs_dir(project_id: str = DEFAULT_PROJECT_ID) -> Path:
    return _project_dir(project_id)


def _archive_dir(project_id: str = DEFAULT_PROJECT_ID) -> Path:
    return _project_dir(project_id)


def _ai_cache_dir(project_id: str = DEFAULT_PROJECT_ID) -> Path:
    return _project_dir(project_id)


def _sanitize_dataset_name(dataset_name: str) -> str:
    return sanitize_dataset_name(dataset_name)


def _dataset_folder(project_id: str, dataset_name: str) -> Path:
    return dataset_dir(dataset_name)


def _stage_filename(dataset_name: str, stage_name: str, file_extension: str = '.csv') -> str:
    dataset_stem = _sanitize_dataset_name(dataset_name)
    normalized_extension = file_extension if file_extension.startswith('.') else f'.{file_extension}'
    return f'{stage_name}_{dataset_stem}{normalized_extension}'


def _dataset_stage_path(project_id: str, dataset_name: str, stage_name: str, file_extension: str = '.csv') -> Path:
    return processed_dir(dataset_name) / _stage_filename(dataset_name, stage_name, file_extension)


def _ensure_directories(project_id: str = DEFAULT_PROJECT_ID) -> Path:
    project_dir = _project_dir(project_id)
    project_dir.mkdir(parents=True, exist_ok=True)
    cleanup_legacy_root_directories()
    return project_dir


def _timestamp() -> str:
    return datetime.utcnow().isoformat(timespec='seconds') + 'Z'


def _manifest_path(project_id: str, version_name: str, dataset_name: str | None = None) -> Path:
    target_dataset = dataset_name or _find_dataset_name_for_version(version_name)
    return manifests_dir(target_dataset) / f'{version_name}{MANIFEST_SUFFIX}'


def _version_dataset_path(project_id: str, version_name: str, dataset_name: str | None = None) -> Path:
    target_dataset = dataset_name or _find_dataset_name_for_version(version_name)
    return versions_dir(target_dataset) / version_name / DATASET_FILENAME


def _all_dataset_names(project_id: str = DEFAULT_PROJECT_ID) -> list[str]:
    _ensure_directories(project_id)
    names: list[str] = []
    for folder in sorted(_datasets_root(project_id).glob('*')):
        if folder.is_dir():
            ensure_dataset_layout(folder.name)
            names.append(folder.name)
    return names


def _find_manifest_path(version_name: str, project_id: str = DEFAULT_PROJECT_ID) -> Path:
    for dataset_name in _all_dataset_names(project_id):
        manifest_path = manifests_dir(dataset_name) / f'{version_name}{MANIFEST_SUFFIX}'
        if manifest_path.exists():
            return manifest_path
    raise FileNotFoundError(f'Manifest not found for version: {version_name}')


def _find_dataset_name_for_version(version_name: str, project_id: str = DEFAULT_PROJECT_ID) -> str:
    manifest_path = _find_manifest_path(version_name, project_id)
    return manifest_path.parent.parent.parent.name


def _normalize_dataset_source(dataset_source: Any, target_path: Path) -> Path:
    target_path.parent.mkdir(parents=True, exist_ok=True)

    if isinstance(dataset_source, pd.DataFrame):
        if target_path.suffix.lower() in {'.xlsx', '.xls'}:
            dataset_source.to_excel(target_path, index=False)
        else:
            dataset_source.to_csv(target_path, index=False)
        return target_path

    source_path = Path(dataset_source)
    if not source_path.exists():
        raise FileNotFoundError(f'Dataset source not found: {source_path}')

    if source_path.is_dir():
        raise IsADirectoryError(f'Dataset source must be a file: {source_path}')

    if source_path.suffix.lower() == '.csv':
        shutil.copy2(source_path, target_path)
        return target_path

    if source_path.suffix.lower() in {'.xlsx', '.xls'}:
        df = pd.read_excel(source_path)
        df.to_excel(target_path, index=False)
        return target_path

    shutil.copy2(source_path, target_path)
    return target_path


def _read_dataset(dataset_path: Path) -> pd.DataFrame:
    if dataset_path.suffix.lower() == '.gz' or dataset_path.name.endswith('.csv.gz'):
        return pd.read_csv(dataset_path)
    if dataset_path.suffix.lower() == '.csv':
        return pd.read_csv(dataset_path)
    if dataset_path.suffix.lower() in {'.xlsx', '.xls'}:
        return pd.read_excel(dataset_path)
    raise ValueError(f'Unsupported dataset format: {dataset_path.suffix}')


def read_dataset_file(dataset_path: str | Path) -> pd.DataFrame:
    path = Path(dataset_path)
    return _read_dataset(path)


def preview_dataset_file(dataset_path: str | Path, rows: int = 5) -> dict[str, Any]:
    df = read_dataset_file(dataset_path)
    return {
        'rows': int(df.shape[0]),
        'columns': int(df.shape[1]),
        'preview': safe_json_replace(df.head(rows)),
        'columns_list': safe_json_replace(list(df.columns)),
    }


def save_stage_dataset(
    dataset_source: Any,
    dataset_name: str,
    stage_name: str,
    file_extension: str | None = None,
    project_id: str = DEFAULT_PROJECT_ID,
) -> Path:
    _ensure_directories(project_id)

    resolved_dataset_name = resolve_dataset_name(dataset_name)
    ensure_dataset_layout(resolved_dataset_name)

    if file_extension is None:
        if isinstance(dataset_source, pd.DataFrame):
            file_extension = '.csv'
        else:
            source_path = Path(dataset_source)
            if source_path.name.endswith('.csv.gz'):
                file_extension = '.csv'
            elif source_path.suffix.lower() in {'.csv', '.xlsx', '.xls'}:
                file_extension = source_path.suffix.lower()
            else:
                file_extension = '.csv'

    target_path = _dataset_stage_path(project_id, resolved_dataset_name, stage_name, file_extension)
    return _normalize_dataset_source(dataset_source, target_path)


def _stage_order(stage_name: str) -> int:
    order = {
        'raw': 0,
        'clean': 1,
        'cleaned': 1,
        'outlier': 2,
        'outlier_detected': 2,
        'validation': 3,
        'validated': 3,
        'estimation': 4,
        'estimated': 4,
        'deduped': 5,
        'deduplicated': 5,
    }
    return order.get(stage_name, 99)


def get_dataset_folders(project_id: str = DEFAULT_PROJECT_ID) -> list[dict[str, Any]]:
    _ensure_directories(project_id)
    folders: list[dict[str, Any]] = []

    for folder in sorted(_datasets_root(project_id).glob('*')):
        if not folder.is_dir():
            continue
        ensure_dataset_layout(folder.name)
        current_processed_dir = processed_dir(folder.name)
        files = [path.name for path in sorted(current_processed_dir.iterdir()) if path.is_file()]
        files.sort(key=lambda name: (_stage_order(name.split('_', 1)[0]), name))
        folders.append({
            'dataset_name': folder.name,
            'folder_path': str(folder),
            'files': files,
        })

    return folders


def get_dataset_files(
    dataset_name: str,
    project_id: str = DEFAULT_PROJECT_ID,
) -> list[dict[str, Any]]:
    folder = _dataset_folder(project_id, dataset_name)
    if not folder.exists():
        return []

    ensure_dataset_layout(folder.name)
    current_processed_dir = processed_dir(folder.name)
    files: list[dict[str, Any]] = []
    for path in sorted(current_processed_dir.iterdir()):
        if not path.is_file():
            continue
        files.append({
            'file_name': path.name,
            'file_path': str(path),
            'stage': path.name.split('_', 1)[0],
            'size_bytes': path.stat().st_size,
        })

    files.sort(key=lambda item: (_stage_order(item['stage']), item['file_name']))
    return files


@log_calls
def delete_dataset_file(dataset_name: str, file_name: str, project_id: str = DEFAULT_PROJECT_ID) -> Path:
    folder = _dataset_folder(project_id, dataset_name)
    if not folder.exists():
        raise FileNotFoundError(f'Dataset folder not found: {folder}')

    ensure_dataset_layout(folder.name)
    target = processed_dir(folder.name) / file_name
    if not target.exists():
        raise FileNotFoundError(f'Dataset file not found: {target}')

    target.unlink()
    return target


def get_versioning_dashboard(project_id: str = DEFAULT_PROJECT_ID) -> dict[str, Any]:
    return {
        'project_id': project_id,
        'datasets': get_dataset_folders(project_id),
    }


def _extract_version_rank(version_name: str) -> tuple[int, str]:
    prefix = version_name.split('_', 1)[0]
    if prefix.startswith('v') and prefix[1:].isdigit():
        return int(prefix[1:]), version_name
    if version_name.startswith('v') and version_name[1:].isdigit():
        return int(version_name[1:]), version_name
    return -1, version_name


def _load_manifest(project_id: str, version_name: str) -> dict[str, Any]:
    manifest_path = _manifest_path(project_id, version_name)
    if not manifest_path.exists():
        raise FileNotFoundError(f'Manifest not found for version: {version_name}')
    with open(manifest_path, 'r', encoding='utf-8') as handle:
        return json.load(handle)


@log_calls
def create_project(project_id: str = DEFAULT_PROJECT_ID) -> Path:
    return _ensure_directories(project_id)


@log_calls
def compress_dataset_folder(
    dataset_name: str,
    project_id: str = DEFAULT_PROJECT_ID,
    output_path: str | Path | None = None,
    remove_source: bool = False,
) -> Path:
    folder = _dataset_folder(project_id, dataset_name)
    if not folder.exists():
        raise FileNotFoundError(f'Dataset folder not found: {folder}')

    ensure_dataset_layout(folder.name)
    current_archive_dir = archive_dir(folder.name)

    target_path = Path(output_path) if output_path else current_archive_dir / f'{folder.name}.zip'
    target_path.parent.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(target_path, 'w', compression=zipfile.ZIP_DEFLATED) as zip_handle:
        for path in folder.rglob('*'):
            if path.is_file() and path != target_path:
                zip_handle.write(path, arcname=path.relative_to(folder))

    if remove_source:
        shutil.rmtree(folder)

    return target_path


@log_calls
def save_raw_dataset(
    dataset_source: Any,
    project_id: str = DEFAULT_PROJECT_ID,
    filename: str = DATASET_FILENAME,
) -> Path:
    return save_stage_dataset(
        dataset_source=dataset_source,
        dataset_name=filename,
        stage_name='raw',
        project_id=project_id,
    )


@log_calls
def save_manifest(
    version_name: str,
    project_id: str = DEFAULT_PROJECT_ID,
    dataset_name: str | None = None,
    parent: str | None = None,
    operations: Iterable[str] | None = None,
    dataset_path: str | Path | None = None,
    extra: dict[str, Any] | None = None,
) -> Path:
    _ensure_directories(project_id)
    resolved_dataset_name = resolve_dataset_name(dataset_name or version_name)
    ensure_dataset_layout(resolved_dataset_name)

    manifest: dict[str, Any] = {
        'version': version_name,
        'dataset_name': resolved_dataset_name,
        'parent': parent,
        'created_at': _timestamp(),
        'operations': list(operations or []),
    }

    if dataset_path is not None:
        dataset_file = Path(dataset_path)
        if dataset_file.exists():
            df = _read_dataset(dataset_file)
            manifest.update({
                'rows': int(df.shape[0]),
                'columns': int(df.shape[1]),
                'dataset_path': str(dataset_file),
            })

    if extra:
        manifest.update(extra)

    manifest_path = _manifest_path(project_id, version_name, resolved_dataset_name)
    with open(manifest_path, 'w', encoding='utf-8') as handle:
        json.dump(manifest, handle, indent=4)

    return manifest_path


@log_calls
def create_version(
    dataset_source: Any,
    version_name: str,
    project_id: str = DEFAULT_PROJECT_ID,
    parent: str | None = None,
    operations: Iterable[str] | None = None,
    extra_manifest: dict[str, Any] | None = None,
) -> dict[str, Any]:
    _ensure_directories(project_id)
    resolved_dataset_name = resolve_dataset_name(dataset_source)
    ensure_dataset_layout(resolved_dataset_name)

    version_dir = versions_dir(resolved_dataset_name) / version_name
    dataset_path = version_dir / DATASET_FILENAME

    if version_dir.exists() or _manifest_path(project_id, version_name, resolved_dataset_name).exists():
        raise FileExistsError(f'Version already exists: {version_name}')

    _normalize_dataset_source(dataset_source, dataset_path)

    manifest_path = save_manifest(
        version_name=version_name,
        project_id=project_id,
        dataset_name=resolved_dataset_name,
        parent=parent,
        operations=operations,
        dataset_path=dataset_path,
        extra=extra_manifest,
    )

    return {
        'project_id': project_id,
        'dataset_name': resolved_dataset_name,
        'version': version_name,
        'parent': parent,
        'version_dir': str(version_dir),
        'dataset_path': str(dataset_path),
        'manifest_path': str(manifest_path),
    }


@log_calls
def list_versions(project_id: str = DEFAULT_PROJECT_ID) -> list[dict[str, Any]]:
    _ensure_directories(project_id)

    versions: list[dict[str, Any]] = []
    for dataset_name in _all_dataset_names(project_id):
        for manifest_path in sorted(manifests_dir(dataset_name).glob(f'*{MANIFEST_SUFFIX}')):
            with open(manifest_path, 'r', encoding='utf-8') as handle:
                manifest = json.load(handle)
            version_name = manifest.get('version') or manifest_path.stem.replace('_manifest', '')
            versions.append({
                'version': version_name,
                'dataset_name': dataset_name,
                'manifest_path': str(manifest_path),
                'dataset_path': str(_version_dataset_path(project_id, version_name, dataset_name)),
                'created_at': manifest.get('created_at'),
                'parent': manifest.get('parent'),
                'operations': manifest.get('operations', []),
                'hash': manifest.get('hash'),
            })

    versions.sort(key=lambda item: (
        _extract_version_rank(item['version'])[0],
        item.get('created_at') or '',
        item['version'],
    ))
    return versions


@log_calls
def get_latest_version(project_id: str = DEFAULT_PROJECT_ID) -> dict[str, Any] | None:
    versions = list_versions(project_id)
    if not versions:
        return None
    return versions[-1]


@log_calls
def rollback_version(
    version_name: str,
    project_id: str = DEFAULT_PROJECT_ID,
    restore_to: str | Path | None = None,
) -> Path:
    _ensure_directories(project_id)

    dataset_path = _version_dataset_path(project_id, version_name)
    if not dataset_path.exists():
        raise FileNotFoundError(f'Version dataset not found: {version_name}')

    if restore_to is None:
        restore_dir = temp_root()
        restore_dir.mkdir(parents=True, exist_ok=True)
        restore_to = restore_dir / f'rollback_{version_name}_{datetime.utcnow().strftime("%Y%m%d%H%M%S")}.csv'

    restore_path = Path(restore_to)
    restore_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(dataset_path, restore_path)
    return restore_path


@log_calls
def get_manifest(project_id: str, version_name: str) -> dict[str, Any]:
    return _load_manifest(project_id, version_name)


@log_calls
def get_version_path(project_id: str, version_name: str) -> Path:
    return _version_dataset_path(project_id, version_name)
