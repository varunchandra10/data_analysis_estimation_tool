from __future__ import annotations

import json
from typing import Any
from core.database import SessionLocal
from models.audit_log_model import AuditLog
from models.dataset_model import Dataset
from utils.dataset_storage import audit_log_path, ensure_dataset_layout, resolve_dataset_name
from utils.log_utils import logger


def record_audit_log(
    dataset_name: str | None,
    action: str,
    details: dict | str | None = None,
    user_id: int | None = None,
    version_id: int | None = None,
    status: str = "success",
    actor: str | None = None,
) -> None:
    entry_payload = {
        'operation': action,
        'rows_affected': 0,
        'details': details if isinstance(details, dict) else {'note': details} if details is not None else {},
        'status': status,
        'actor': actor or ('user_' + str(user_id) if user_id else 'system'),
        'timestamp': None,
    }

    db = None
    try:
        db = SessionLocal()
        dataset_id = None
        if dataset_name:
            try:
                resolved = resolve_dataset_name(dataset_name)
                ds = db.query(Dataset).filter(Dataset.dataset_name == resolved).first()
                dataset_id = ds.id if ds else None
            except Exception:
                dataset_id = None

        if version_id is None and dataset_id is not None:
            from models.version_model import Version
            latest_version = db.query(Version).filter(Version.dataset_id == dataset_id).order_by(Version.created_at.desc()).first()
            version_id = latest_version.id if latest_version else None

        if actor is None:
            if user_id:
                from models.user_model import User
                u = db.query(User).filter(User.id == user_id).first()
                actor = u.username if u else f"user_{user_id}"
            else:
                actor = "system"

        details_str = str(details) if details is not None else None
        details_json_str = json.dumps(details) if isinstance(details, dict) else (details if isinstance(details, str) else None)

        if dataset_id is not None:
            entry = AuditLog(
                dataset_id=dataset_id,
                user_id=user_id,
                version_id=version_id,
                action=action,
                operation=action,
                actor=actor,
                status=status,
                details=details_str,
                details_json=details_json_str
            )
            db.add(entry)
            db.commit()
            return

        if dataset_name:
            resolved_name = resolve_dataset_name(dataset_name)
            ensure_dataset_layout(resolved_name)
            log_file = audit_log_path(resolved_name)

            existing_logs: list[dict[str, Any]] = []
            if log_file.exists():
                try:
                    with open(log_file, 'r', encoding='utf-8') as handle:
                        loaded = json.load(handle)
                        if isinstance(loaded, list):
                            existing_logs = loaded
                except Exception:
                    existing_logs = []

            from datetime import datetime

            entry_payload.update({
                'rows_affected': int(entry_payload.get('details', {}).get('rows_affected', 0) or 0),
                'timestamp': datetime.utcnow().isoformat(timespec='seconds') + 'Z',
            })
            existing_logs.append(entry_payload)

            with open(log_file, 'w', encoding='utf-8') as handle:
                json.dump(existing_logs, handle, indent=2, ensure_ascii=False)
    except Exception as e:
        if db:
            try:
                db.rollback()
            except Exception:
                pass
        logger.error(f"Failed to record audit log: {e}", exc_info=True)
    finally:
        if db:
            try:
                db.close()
            except Exception:
                pass

