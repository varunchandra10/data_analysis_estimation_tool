from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from core.config import BASE_DIR


CACHE_ROOT = BASE_DIR / 'backend' / 'cache'
CACHE_ROOT.mkdir(parents=True, exist_ok=True)


def _cache_file(namespace: str, key: str) -> Path:
    digest = hashlib.sha256(key.encode('utf-8')).hexdigest()
    namespace_dir = CACHE_ROOT / namespace
    namespace_dir.mkdir(parents=True, exist_ok=True)
    return namespace_dir / f'{digest}.json'


def get_cache(namespace: str, key: str) -> dict[str, Any] | None:
    path = _cache_file(namespace, key)
    if not path.exists():
        return None

    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except Exception:
        return None


def set_cache(namespace: str, key: str, value: dict[str, Any]) -> None:
    path = _cache_file(namespace, key)
    path.write_text(json.dumps(value, ensure_ascii=True, indent=2), encoding='utf-8')


def invalidate_cache(namespace: str, key: str | None = None) -> None:
    if key is not None:
        path = _cache_file(namespace, key)
        if path.exists():
            path.unlink()
        return

    namespace_dir = CACHE_ROOT / namespace
    if not namespace_dir.exists():
        return

    for file_path in namespace_dir.glob('*.json'):
        file_path.unlink()
