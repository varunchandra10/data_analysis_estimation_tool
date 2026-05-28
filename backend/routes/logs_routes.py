import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from schemas.common import success_response
from utils.dataset_storage import audit_log_path, ensure_dataset_layout, resolve_dataset_name
from core.database import SessionLocal
from models.dataset_model import Dataset
from models.audit_log_model import AuditLog

router = APIRouter()


@router.get("/api/logs/{dataset_name}")
async def get_logs(
    dataset_name: str
):
    resolved_dataset_name = resolve_dataset_name(Path(dataset_name).stem)
    
    db = SessionLocal()
    try:
        ds = db.query(Dataset).filter(Dataset.dataset_name == resolved_dataset_name).first()
        if not ds:
            # Fallback to JSON logs if dataset not in DB
            log_file = audit_log_path(resolved_dataset_name)
            if log_file.exists():
                try:
                    with open(log_file, "r", encoding="utf-8") as f:
                        return success_response("Logs loaded from JSON fallback.", data={"logs": json.load(f)})
                except Exception:
                    pass
            return success_response("No logs found.", data={"logs": []}, logs=[])
            
        db_logs = db.query(AuditLog).filter(AuditLog.dataset_id == ds.id).order_by(AuditLog.created_at.asc()).all()
        
        logs = []
        for log in db_logs:
            try:
                details = json.loads(log.details_json) if log.details_json else {}
            except Exception:
                details = {}
            
            rows_affected = details.get("rows_affected", 0)
            logs.append({
                "operation": log.operation,
                "rows_affected": rows_affected,
                "timestamp": log.created_at.strftime("%Y-%m-%d %H:%M:%S") if log.created_at else "",
                "details": details,
                "status": log.status,
                "actor": log.actor
            })
            
        if not logs:
            # Fallback to JSON logs if DB returns empty
            log_file = audit_log_path(resolved_dataset_name)
            if log_file.exists():
                try:
                    with open(log_file, "r", encoding="utf-8") as f:
                        logs = json.load(f)
                except Exception:
                    pass

        return success_response("Logs loaded.", data={"logs": logs}, logs=logs)
    finally:
        db.close()

