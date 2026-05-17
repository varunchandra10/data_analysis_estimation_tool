from __future__ import annotations

import os
from pathlib import Path

from cryptography.fernet import Fernet

from core.config import BASE_DIR
from utils.log_utils import log_calls


STORAGE_DIR = BASE_DIR / "storage"
ENV_KEY_NAME = "DAET_ENCRYPTION_KEY"


def _load_key(key: str | bytes | None = None) -> bytes:
    if key is None:
        key = os.getenv(ENV_KEY_NAME)

    if not key:
        raise ValueError(
            f"Missing encryption key. Set {ENV_KEY_NAME} in the environment or pass a key explicitly."
        )

    return key.encode("utf-8") if isinstance(key, str) else key


def _default_encrypted_path(source_path: Path) -> Path:
    return source_path.with_name(f"{source_path.name}.enc")


def _default_decrypted_path(source_path: Path) -> Path:
    if source_path.suffix == ".enc":
        return source_path.with_suffix("")
    return source_path.with_name(f"{source_path.name}.decrypted")


@log_calls
def generate_key() -> str:
    return Fernet.generate_key().decode("utf-8")


@log_calls
def encrypt_file(
    file_path: str | Path,
    output_path: str | Path | None = None,
    key: str | bytes | None = None,
    remove_source: bool = False,
) -> Path:
    source_path = Path(file_path)

    if not source_path.exists():
        raise FileNotFoundError(f"File not found: {source_path}")

    target_path = Path(output_path) if output_path else _default_encrypted_path(source_path)
    target_path.parent.mkdir(parents=True, exist_ok=True)

    fernet = Fernet(_load_key(key))

    with open(source_path, "rb") as source_handle:
        encrypted_data = fernet.encrypt(source_handle.read())

    with open(target_path, "wb") as target_handle:
        target_handle.write(encrypted_data)

    if remove_source:
        source_path.unlink()

    return target_path


@log_calls
def decrypt_file(
    file_path: str | Path,
    output_path: str | Path | None = None,
    key: str | bytes | None = None,
    remove_source: bool = False,
) -> Path:
    source_path = Path(file_path)

    if not source_path.exists():
        raise FileNotFoundError(f"File not found: {source_path}")

    target_path = Path(output_path) if output_path else _default_decrypted_path(source_path)
    target_path.parent.mkdir(parents=True, exist_ok=True)

    fernet = Fernet(_load_key(key))

    with open(source_path, "rb") as source_handle:
        decrypted_data = fernet.decrypt(source_handle.read())

    with open(target_path, "wb") as target_handle:
        target_handle.write(decrypted_data)

    if remove_source:
        source_path.unlink()

    return target_path
