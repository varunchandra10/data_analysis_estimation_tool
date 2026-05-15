from fastapi import APIRouter

import pandas as pd

from utils.file_utils import (
    validate_file_path,
    safe_json_replace
)

from utils.log_utils import (
    save_cleaning_log
)

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

    if str(path).endswith(".csv"):

        df = pd.read_csv(path)

    else:

        df = pd.read_excel(path)

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

    removed_count = (
        original_count - len(df)
    )

    save_cleaning_log(

        dataset_name=path.name,

        operation="Duplicate Handling",

        rows_affected=removed_count
    )

    return {

        "status": "success",

        "duplicate_count": int(
            duplicate_mask.sum()
        ),

        "removed_count": removed_count,

        "preview": safe_json_replace(
            df.head(5)
        )
    }