from __future__ import annotations

import hashlib
from pathlib import Path


def generate_sha256(file_path: str | Path, chunk_size: int = 8192) -> str:
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    digest = hashlib.sha256()

    with open(path, "rb") as handle:
        while True:
            chunk = handle.read(chunk_size)
            if not chunk:
                break
            digest.update(chunk)

    return digest.hexdigest()
