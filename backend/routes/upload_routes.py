from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import HTTPException

import pandas as pd
import shutil
import os

from core.config import (
    DATASETS_DIR,
    MAX_ROWS
)

from utils.file_utils import (
    safe_json_replace
)

from utils.dataframe_utils import (
    infer_schema
)

from utils.log_utils import log_calls

router = APIRouter()


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

    file_path = DATASETS_DIR / file.filename

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    try:

        if file.filename.endswith(".csv"):

            df = pd.read_csv(file_path)

        else:

            df = pd.read_excel(file_path)

        if len(df) > MAX_ROWS:

            os.remove(file_path)

            raise HTTPException(
                status_code=400,
                detail="Dataset exceeds limit."
            )

        return {

            "status": "success",

            "metadata": {

                "filename": file.filename,

                "file_path": str(file_path),

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

    except Exception as e:

        if file_path.exists():

            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )