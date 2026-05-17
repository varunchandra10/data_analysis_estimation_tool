from fastapi import APIRouter

import pandas as pd

from utils.file_utils import (
    validate_file_path,
    safe_json_replace
)

from utils.log_utils import (
    save_cleaning_log
)

from services.versioning_engine import save_stage_dataset, read_dataset_file
from utils.dataset_storage import resolve_dataset_name

router = APIRouter()


@router.post("/api/duplicates/process")
async def process_duplicates(
    payload: dict
):

    path = validate_file_path(
        payload.get("file_path")
    )

    strategy = payload.get(
        "strategy",
        "detect"
    )

    df = read_dataset_file(path)

    original_count = len(df)

    duplicate_mask = df.duplicated(
        keep=False
    )

    if strategy == "remove":

        df = df.drop_duplicates(
            keep="first"
        )

    elif strategy == "keep_latest":

        df = df.drop_duplicates(
            keep="last"
        )

    saved_path = save_stage_dataset(
        dataset_source=df,
        dataset_name=resolve_dataset_name(path),
        stage_name="deduplicated"
    )

    removed_count = (
        original_count - len(df)
    )

    save_cleaning_log(

        dataset_name=resolve_dataset_name(path),

        operation="Duplicate Handling",

        rows_affected=removed_count
    )

    return {

        "status": "success",

        "file_path": str(saved_path),

        "duplicate_count": int(
            duplicate_mask.sum()
        ),

        "removed_count": removed_count,

        "preview": safe_json_replace(
            df.head(5)
        )
    }
