import json
from pathlib import Path

from fastapi import APIRouter

from schemas.common import success_response
from utils.dataset_storage import audit_log_path, ensure_dataset_layout, resolve_dataset_name

router = APIRouter()


@router.get("/api/logs/{dataset_name}")
async def get_logs(
    dataset_name: str
):

    resolved_dataset_name = resolve_dataset_name(Path(dataset_name).stem)
    ensure_dataset_layout(resolved_dataset_name)
    log_file = audit_log_path(resolved_dataset_name)

    if not log_file.exists():
        return success_response("No logs found.", data={"logs": []}, logs=[])

    with open(log_file, "r", encoding="utf-8") as f:

        logs = json.load(f)

    return success_response("Logs loaded.", data={"logs": logs}, logs=logs)
