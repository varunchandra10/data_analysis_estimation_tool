from __future__ import annotations

import io
import zipfile
from pathlib import Path

import pandas as pd
from fastapi import HTTPException
from fastapi.responses import StreamingResponse

from services.versioning.engine import read_dataset_file
from services.compression_engine import compress_dataset
from services.encryption_engine import encrypt_file
from utils.dataset_storage import resolve_dataset_name

def _download_headers(filename: str) -> dict[str, str]:
    return {"Content-Disposition": f'attachment; filename="{filename}"'}

def export_dataset(source_path: Path, export_format: str, dataset_name: str | None = None) -> StreamingResponse:
    resolved_ds_name = dataset_name or resolve_dataset_name(source_path)
    try:
        from services.audit_log_service import record_audit_log
        record_audit_log(
            dataset_name=resolved_ds_name,
            action="export",
            details={"export_format": export_format, "source_path": str(source_path)},
            status="success"
        )
    except Exception:
        pass

    base_name = source_path.stem.split("_", 1)[-1] or resolved_ds_name


    if export_format == "csv":
        df = read_dataset_file(source_path)
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        data = io.BytesIO(buffer.getvalue().encode("utf-8"))
        return StreamingResponse(
            data,
            media_type="text/csv",
            headers=_download_headers(f"{base_name}.csv"),
        )

    if export_format == "xlsx":
        df = read_dataset_file(source_path)
        data = io.BytesIO()
        with pd.ExcelWriter(data, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Dataset")
        data.seek(0)
        return StreamingResponse(
            data,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers=_download_headers(f"{base_name}.xlsx"),
        )

    if export_format == "zip":
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", compression=zipfile.ZIP_DEFLATED) as zip_handle:
            zip_handle.write(source_path, arcname=Path(source_path).name)
        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers=_download_headers(f"{base_name}.zip"),
        )

    if export_format in {"enc", "encrypted", "encrypted_zip"}:
        archive_dir = source_path.parent
        zip_path = archive_dir / f"{base_name}.zip"
        compress_dataset(source_path, output_path=zip_path, remove_source=False)
        encrypted_path = encrypt_file(zip_path, output_path=zip_path.with_suffix(".zip.enc"), remove_source=False)
        with open(encrypted_path, "rb") as handle:
            encrypted_bytes = io.BytesIO(handle.read())
        encrypted_bytes.seek(0)
        return StreamingResponse(
            encrypted_bytes,
            media_type="application/octet-stream",
            headers=_download_headers(f"{base_name}.zip.enc"),
        )

    raise HTTPException(status_code=400, detail="Unsupported export format. Use csv, xlsx, zip, or encrypted_zip.")
