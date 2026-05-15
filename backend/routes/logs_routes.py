from fastapi import APIRouter

import json

from pathlib import Path

from core.config import (
    LOGS_DIR
)

router = APIRouter()


@router.get("/api/logs/{dataset_name}")
async def get_logs(
    dataset_name: str
):

    log_file = (

        LOGS_DIR /

        f"{Path(dataset_name).stem}_logs.json"
    )

    if not log_file.exists():

        return {
            "logs": []
        }

    with open(log_file, "r") as f:

        logs = json.load(f)

    return {
        "logs": logs
    }