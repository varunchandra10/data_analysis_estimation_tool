from __future__ import annotations

from typing import Any
from core.database import SessionLocal
from models.audit_log_model import AuditLog
from models.dataset_model import Dataset
from utils.dataset_storage import resolve_dataset_name


def record_audit_log(dataset_name: str | None, action: str, details: dict | str | None = None, user_id: int | None = None) -> None:
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
        entry = AuditLog(dataset_id=dataset_id, user_id=user_id, action=action, details=str(details) if details is not None else None)
        db.add(entry)
        db.commit()
    except Exception:
        pass
    finally:
        try:
            db.close()
        except Exception:
            pass
