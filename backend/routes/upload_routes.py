from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from core.database import get_db_session


from pathlib import Path
from io import BytesIO

import pandas as pd

from core.config import MAX_ROWS
from schemas.common import success_response
from schemas.upload_schema import UploadRequest

from utils.file_utils import (
    safe_json_replace,
    resolve_safe_path
)

from utils.dataframe_utils import (
    infer_schema
)

from utils.log_utils import log_calls
from services.versioning.engine import save_stage_dataset
from utils.dataset_storage import resolve_dataset_name
from services.dataset_loader import load_dataset, validate_dataset_path, load_dataset_from_buffer
from models.dataset_model import Dataset
from core.database import SessionLocal
from utils.hash_utils import generate_sha256


router = APIRouter()


@router.post("/api/datasets/full-preview")
@log_calls
async def full_dataset_preview(payload: UploadRequest):

    try:

        file_path = payload.file_path

        if not file_path:
            raise HTTPException(
                status_code=400,
                detail="file_path is required."
            )

        path = validate_dataset_path(Path(file_path))
        df = load_dataset(path, optimize=True)

        data = {
            "metadata": {
                "file_path": str(path),
                "rows": len(df),
                "columns": len(df.columns),
            },
            "columns": list(df.columns),
            "rows": safe_json_replace(df),
        }
        return success_response("Dataset preview loaded.", data=data, metadata=data["metadata"], columns=data["columns"], rows=data["rows"])

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
    file: UploadFile = File(...),
    db: Session = Depends(get_db_session)
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
        file_type = 'csv' if file.filename.endswith('.csv') else 'xlsx'

        df = load_dataset_from_buffer(buffer, file_type, optimize=True)

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

        safe_saved_path = resolve_safe_path(saved_path)
        checksum = generate_sha256(safe_saved_path)
        size = safe_saved_path.stat().st_size
        
        # Insert dataset row in DB
        try:
            dataset_name = resolve_dataset_name(safe_saved_path)
            from models.project_model import Project
            proj = db.query(Project).filter(Project.id == 1).first()
            project_id = proj.id if proj else None

            db_dataset = db.query(Dataset).filter(Dataset.dataset_name == dataset_name).first()
            if not db_dataset:
                db_dataset = Dataset(
                    project_id=project_id,
                    dataset_name=dataset_name,
                    file_path=str(safe_saved_path),
                    version="raw",
                    status="raw",
                    checksum=checksum,
                    size=size,
                    mime_type="text/csv" if file.filename.endswith(".csv") else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                )
                db.add(db_dataset)
                db.commit()
                db.refresh(db_dataset)
            else:
                db_dataset.file_path = str(safe_saved_path)
                db_dataset.checksum = checksum
                db_dataset.size = size
                db_dataset.version = "raw"
                db_dataset.status = "raw"
                db.commit()
                db.refresh(db_dataset)
        except Exception as e:
            if safe_saved_path.exists():
                safe_saved_path.unlink()
            raise HTTPException(status_code=500, detail=f"Database synchronization failed: {e}")


        metadata = {
            "filename": file.filename,
            "dataset_name": resolve_dataset_name(safe_saved_path),
            "file_path": str(safe_saved_path),
            "rows": len(df),
            "columns": len(df.columns),
            "null_counts": df.isnull().sum().to_dict(),
        }
        schema = infer_schema(df)
        preview = safe_json_replace(df.head(5))
        return success_response("Dataset uploaded successfully.", data={"metadata": metadata, "schema": schema, "preview": preview}, metadata=metadata, schema=schema, preview=preview)

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

