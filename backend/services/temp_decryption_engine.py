from __future__ import annotations

from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from services.encryption_engine import decrypt_file
from utils.dataset_storage import temp_root
from utils.log_utils import log_calls

def _temp_workspace_dir(project_id: str) -> Path:
    temp_dir = temp_root() / project_id
    temp_dir.mkdir(parents=True, exist_ok=True)
    return temp_dir


def _default_temp_path(archive_path: Path, project_id: str) -> Path:
    temp_dir = _temp_workspace_dir(project_id)
    base_name = archive_path.name

    if base_name.endswith(".enc"):
        base_name = base_name[:-4]

    return temp_dir / base_name


@log_calls
def create_temp_workspace(project_id: str) -> Path:
    return _temp_workspace_dir(project_id)


@log_calls
def decrypt_archive_to_temp(
    archive_path: str | Path,
    project_id: str,
    key: str | bytes | None = None,
    output_path: str | Path | None = None,
    remove_source: bool = False,
) -> Path:
    source_path = Path(archive_path)

    if not source_path.exists():
        raise FileNotFoundError(f"Archive file not found: {source_path}")

    target_path = Path(output_path) if output_path else _default_temp_path(source_path, project_id)
    target_path.parent.mkdir(parents=True, exist_ok=True)

    return decrypt_file(
        source_path,
        output_path=target_path,
        key=key,
        remove_source=remove_source,
    )


@log_calls
def cleanup_temp_file(file_path: str | Path) -> bool:
    temp_path = Path(file_path)

    if temp_path.exists():
        temp_path.unlink()
        return True

    return False


@contextmanager
@log_calls
def open_decrypted_archive(
    archive_path: str | Path,
    project_id: str,
    key: str | bytes | None = None,
) -> Iterator[Path]:
    temp_path = decrypt_archive_to_temp(
        archive_path=archive_path,
        project_id=project_id,
        key=key,
    )

    try:
        yield temp_path
    finally:
        cleanup_temp_file(temp_path)


@log_calls
def load_archived_dataset_path(
    archive_path: str | Path,
    project_id: str,
    key: str | bytes | None = None,
) -> Path:
    return decrypt_archive_to_temp(
        archive_path=archive_path,
        project_id=project_id,
        key=key,
    )
