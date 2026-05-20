from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

from core.config import BASE_DIR


TASK_STORE_DIR = BASE_DIR / 'task_store'
TASK_STORE_DIR.mkdir(parents=True, exist_ok=True)


def _task_path(task_id: str) -> Path:
    return TASK_STORE_DIR / f'{task_id}.json'


def create_task(task_type: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    task_id = str(uuid4())
    now = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    task = {
        'task_id': task_id,
        'task_type': task_type,
        'status': 'pending',
        'created_at': now,
        'updated_at': now,
        'payload': payload or {},
        'result': None,
        'error': None,
    }
    _task_path(task_id).write_text(json.dumps(task, ensure_ascii=True, indent=2), encoding='utf-8')
    return task


def update_task_status(task_id: str, status: str, result: dict[str, Any] | None = None, error: str | None = None) -> dict[str, Any]:
    task = get_task_status(task_id)
    if task is None:
        raise FileNotFoundError(f'Task not found: {task_id}')

    task['status'] = status
    task['updated_at'] = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    if result is not None:
        task['result'] = result
    if error is not None:
        task['error'] = error

    _task_path(task_id).write_text(json.dumps(task, ensure_ascii=True, indent=2), encoding='utf-8')
    return task


def get_task_status(task_id: str) -> dict[str, Any] | None:
    path = _task_path(task_id)
    if not path.exists():
        return None

    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except Exception:
        return None


def list_tasks(limit: int = 100) -> list[dict[str, Any]]:
    tasks: list[dict[str, Any]] = []
    for path in sorted(TASK_STORE_DIR.glob('*.json'), key=lambda p: p.stat().st_mtime, reverse=True):
        try:
            tasks.append(json.loads(path.read_text(encoding='utf-8')))
        except Exception:
            continue
        if len(tasks) >= limit:
            break
    return tasks
