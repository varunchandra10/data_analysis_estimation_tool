from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import HTTPException

from pathlib import Path
from io import BytesIO

import pandas as pd

from core.config import MAX_ROWS

from utils.file_utils import (
    safe_json_replace
)

from utils.dataframe_utils import (
    infer_schema
)

from utils.log_utils import log_calls
from services.versioning_engine import save_stage_dataset
from utils.dataset_storage import resolve_dataset_name
from utils.file_utils import load_dataframe_from_path

router = APIRouter()


@router.post("/api/datasets/full-preview")
@log_calls
async def full_dataset_preview(payload: dict):

    try:

        file_path = payload.get("file_path")

        if not file_path:
            raise HTTPException(
                status_code=400,
                detail="file_path is required."
            )

        path = Path(file_path)
        df = load_dataframe_from_path(path)

        return {

            "status": "success",

            "metadata": {

                "file_path": str(path),

                "rows": len(df),

                "columns": len(df.columns),

            },

            "columns": list(df.columns),

            "rows": safe_json_replace(df),
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc)
        )


@router.post("/api/upload")
@log_calls
async def upload_dataset(
    file: UploadFile = File(...)
):

    if not file.filename.endswith(
        (".csv", ".xlsx")
    ):

        raise HTTPException(
            status_code=400,
            detail="Unsupported file format."
        )

    try:

        file_bytes = await file.read()
        buffer = BytesIO(file_bytes)

        if file.filename.endswith(".csv"):

            df = pd.read_csv(buffer)

        else:

            df = pd.read_excel(buffer)

        if len(df) > MAX_ROWS:

            raise HTTPException(
                status_code=400,
                detail="Dataset exceeds limit."
            )

        saved_path = save_stage_dataset(
            dataset_source=df,
            dataset_name=file.filename,
            stage_name="raw",
            file_extension=Path(file.filename).suffix,
        )

        return {

            "status": "success",

            "metadata": {

                "filename": file.filename,

                "dataset_name": resolve_dataset_name(saved_path),

                "file_path": str(saved_path),

                "rows": len(df),

                "columns": len(df.columns),

                "null_counts": (
                    df.isnull()
                    .sum()
                    .to_dict()
                )
            },

            "schema": infer_schema(df),

            "preview": safe_json_replace(
                df.head(5)
            )
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
