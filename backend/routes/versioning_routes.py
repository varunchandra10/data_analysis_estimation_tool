from __future__ import annotations

import io
import json
import zipfile
from pathlib import Path

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.responses import FileResponse

from schemas.common import success_response
from schemas.versioning_schema import (
    ArchiveOldVersionsRequest,
    ArchiveVersionRequest,
    DatasetCompressRequest,
    DeleteDatasetFileRequest,
    ExportRequest,
    FileTransformRequest,
    HashRequest,
    ProjectCreateRequest,
    QualityScoreRequest,
    RawDatasetSaveRequest,
    ReportGenerateRequest,
    RollbackRequest,
    SignedDownloadTokenRequest,
    TempCleanupRequest,
    TempDecryptRequest,
    VersionCreateRequest,
)
from services.archive_manager import (
    archive_old_versions,
    archive_version,
    get_archive_status,
)
from services.compression_engine import compress_dataset, decompress_dataset
from services.encryption_engine import decrypt_file, encrypt_file
from services.temp_decryption_engine import cleanup_temp_file, decrypt_archive_to_temp
from services.versioning_engine import (
    DEFAULT_PROJECT_ID,
    create_project,
    create_version,
    compare_versions,
    get_dataset_files,
    get_dataset_folders,
    get_versioning_dashboard,
    get_latest_version,
    get_manifest,
    get_version_path,
    list_versions,
    rollback_version,
    preview_dataset_file,
    read_dataset_file,
    save_raw_dataset,
    compress_dataset_folder,
    delete_dataset_file,
    compute_quality_score,
    # report
)
from services.auth_service import get_current_user
from models.dataset_model import Dataset
from core.database import SessionLocal
from services.report_engine import generate_report
from services.archive_manager import archive_old_versions as archive_old_versions_service
from services.compression_engine import compress_dataset as compress_dataset_service
from services.encryption_engine import encrypt_file as encrypt_file_service
from services.signed_download_service import generate_signed_token, validate_signed_token
from utils.file_utils import safe_json_replace, validate_file_path
from utils.hash_utils import generate_sha256
from utils.dataset_storage import resolve_dataset_name
from services.export_service import export_dataset

router = APIRouter()


def _ensure_owner(dataset_name: str, current_user) -> None:
    try:
        db = SessionLocal()
        ds = db.query(Dataset).filter(Dataset.dataset_name == resolve_dataset_name(dataset_name)).first()
        if ds and ds.owner_id and current_user and getattr(current_user, 'id', None) != ds.owner_id:
            raise HTTPException(status_code=403, detail='Forbidden: not dataset owner')
    finally:
        try:
            db.close()
        except Exception:
            pass


def _download_headers(filename: str) -> dict[str, str]:
    return {"Content-Disposition": f'attachment; filename="{filename}"'}


def _project_id(payload: object) -> str:
    return getattr(payload, "project_id", None) or DEFAULT_PROJECT_ID


@router.post("/api/versioning/project/create")
async def api_create_project(payload: ProjectCreateRequest):
    try:
        project_dir = create_project(_project_id(payload))
        return success_response("Project created.", data={"project_dir": str(project_dir)}, project_dir=str(project_dir))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/raw/save")
async def api_save_raw_dataset(payload: RawDatasetSaveRequest):
    try:
        source_path = validate_file_path(payload.file_path)
        raw_path = save_raw_dataset(
            dataset_source=source_path,
            project_id=_project_id(payload),
            filename=payload.filename,
        )
        return success_response("Raw dataset saved.", data={"raw_path": str(raw_path)}, raw_path=str(raw_path))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/version/create")
async def api_create_version(payload: VersionCreateRequest):
    try:
        source_path = validate_file_path(payload.file_path)
        result = create_version(
            dataset_source=source_path,
            version_name=payload.version_name,
            project_id=_project_id(payload),
            parent=payload.parent,
            operations=payload.operations,
            extra_manifest=payload.extra_manifest,
        )
        return success_response("Version created.", data={"result": result}, result=result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/versions")
async def api_list_versions(project_id: str = DEFAULT_PROJECT_ID):
    try:
        versions = list_versions(project_id)
        return success_response("Versions loaded.", data={"versions": versions}, versions=versions)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/latest")
async def api_latest_version(project_id: str = DEFAULT_PROJECT_ID):
    try:
        latest = get_latest_version(project_id)
        return success_response("Latest version loaded.", data={"latest": latest}, latest=latest)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/compare")
async def api_compare_versions(
    left_version: str,
    right_version: str,
    project_id: str = DEFAULT_PROJECT_ID,
    dataset_name: str | None = None,
):
    try:
        comparison = compare_versions(
                left_version=left_version,
                right_version=right_version,
                project_id=project_id,
                dataset_name=dataset_name,
            )
        return success_response("Versions compared.", data={"comparison": comparison}, comparison=comparison)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/datasets")
async def api_dataset_folders(project_id: str = DEFAULT_PROJECT_ID):
    try:
        datasets = get_dataset_folders(project_id)
        return success_response("Datasets loaded.", data={"datasets": datasets}, datasets=datasets)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/datasets/{dataset_name}")
async def api_dataset_files(dataset_name: str, project_id: str = DEFAULT_PROJECT_ID):
    try:
        files = get_dataset_files(dataset_name, project_id)
        return success_response("Dataset files loaded.", data={"dataset": dataset_name, "files": files}, dataset=dataset_name, files=files)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/datasets/{dataset_name}/overview")
async def api_dataset_overview(dataset_name: str, project_id: str = DEFAULT_PROJECT_ID):
    try:
        dashboard = get_versioning_dashboard(project_id)
        dataset = next((item for item in dashboard["datasets"] if item["dataset_name"] == dataset_name), None)
        return success_response("Dataset overview loaded.", data={"dataset": dataset}, dataset=dataset)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/datasets/{dataset_name}/compress")
async def api_compress_dataset_folder(dataset_name: str, payload: DatasetCompressRequest | None = None):
    try:
        compressed_path = compress_dataset_folder(
            dataset_name=dataset_name,
            project_id=(payload.project_id if payload else None) or DEFAULT_PROJECT_ID,
            output_path=payload.output_path if payload else None,
            remove_source=payload.remove_source if payload else False,
        )
        return success_response("Dataset compressed.", data={"compressed_path": str(compressed_path)}, compressed_path=str(compressed_path))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/manifest/{version_name}")
async def api_get_manifest(version_name: str, project_id: str = DEFAULT_PROJECT_ID):
    try:
        manifest = get_manifest(project_id, version_name)
        return success_response("Manifest loaded.", data={"manifest": manifest}, manifest=manifest)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/datasets/{dataset_name}/files/{file_name}/preview")
async def api_dataset_file_preview(dataset_name: str, file_name: str, project_id: str = DEFAULT_PROJECT_ID):
    try:
        file_path = get_dataset_files(dataset_name, project_id)
        selected = next((item for item in file_path if item["file_name"] == file_name), None)
        if selected is None:
            raise HTTPException(status_code=404, detail="Dataset file not found.")

        preview = preview_dataset_file(selected["file_path"])
        return success_response(
            "Dataset file preview loaded.",
            data={
                "dataset_name": dataset_name,
                "file_name": file_name,
                "file_path": selected["file_path"],
                "preview": preview["preview"],
                "rows": preview["rows"],
                "columns": preview["columns"],
                "columns_list": preview["columns_list"],
            },
            dataset_name=dataset_name,
            file_name=file_name,
            file_path=selected["file_path"],
            preview=preview["preview"],
            rows=preview["rows"],
            columns=preview["columns"],
            columns_list=preview["columns_list"],
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/datasets/{dataset_name}/files/{file_name}/analytics")
async def api_dataset_file_analytics(dataset_name: str, file_name: str, project_id: str = DEFAULT_PROJECT_ID):
    try:
        file_path = get_dataset_files(dataset_name, project_id)
        selected = next((item for item in file_path if item["file_name"] == file_name), None)
        if selected is None:
            raise HTTPException(status_code=404, detail="Dataset file not found.")

        df = read_dataset_file(selected["file_path"])
        analytics = safe_json_replace({
                "rows": int(df.shape[0]),
                "columns": int(df.shape[1]),
                "column_types": {column: str(dtype) for column, dtype in df.dtypes.items()},
                "missing_counts": df.isna().sum().to_dict(),
                "summary": df.describe(include="all").to_dict(),
            })
        return success_response(
            "Dataset file analytics loaded.",
            data={"dataset_name": dataset_name, "file_name": file_name, "file_path": selected["file_path"], "analytics": analytics},
            dataset_name=dataset_name,
            file_name=file_name,
            file_path=selected["file_path"],
            analytics=analytics,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/rollback")
async def api_rollback_version(payload: RollbackRequest, current_user=Depends(get_current_user)):
    try:
        _ensure_owner(payload.dataset_name, current_user)
        restore_path = rollback_version(
            version_name=payload.version_name,
            project_id=_project_id(payload),
            dataset_name=payload.dataset_name,
            restore_to=payload.restore_to,
        )
        return success_response("Version rolled back.", data={"restore_path": str(restore_path)}, restore_path=str(restore_path))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/hash/generate")
async def api_generate_hash(payload: HashRequest):
    try:
        source_path = validate_file_path(payload.file_path)
        digest = generate_sha256(source_path)
        return success_response("Hash generated.", data={"hash": digest}, hash=digest)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/hash/verify")
async def api_verify_hash(payload: HashRequest):
    try:
        source_path = validate_file_path(payload.file_path)
        actual_hash = generate_sha256(source_path)
        expected_hash = payload.expected_hash

        if expected_hash is None and payload.version_name:
            expected_hash = get_manifest(_project_id(payload), payload.version_name).get("hash")

        matches = expected_hash == actual_hash if expected_hash else None
        return success_response(
            "Hash verified.",
            data={"actual_hash": actual_hash, "expected_hash": expected_hash, "matches": matches},
            actual_hash=actual_hash,
            expected_hash=expected_hash,
            matches=matches,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/compress")
async def api_compress_dataset(payload: FileTransformRequest):
    try:
        source_path = validate_file_path(payload.file_path)
        compressed_path = compress_dataset(
            source_path,
            output_path=payload.output_path,
            remove_source=payload.remove_source,
        )
        return success_response("Dataset compressed.", data={"compressed_path": str(compressed_path)}, compressed_path=str(compressed_path))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/export")
async def api_export_dataset(payload: ExportRequest, current_user=Depends(get_current_user)):
    try:
        source_path = validate_file_path(payload.file_path)
        _ensure_owner(payload.dataset_name or resolve_dataset_name(source_path), current_user)
        export_format = payload.format
        dataset_name = payload.dataset_name or resolve_dataset_name(source_path)

        return export_dataset(source_path, export_format, dataset_name)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/download-token")
async def api_create_signed_download(payload: SignedDownloadTokenRequest, current_user=Depends(get_current_user)):
    try:
        source_path = validate_file_path(payload.file_path)
        _ensure_owner(payload.dataset_name or resolve_dataset_name(source_path), current_user)
        token = generate_signed_token(
            file_path=str(source_path),
            expires_seconds=payload.expires_seconds,
            extra={'dataset_name': payload.dataset_name or resolve_dataset_name(source_path)},
        )
        return success_response(
            "Signed download token created.",
            data={
                "token": token,
                "file_name": Path(source_path).name,
                "expires_seconds": payload.expires_seconds,
            },
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/download")
async def api_download_signed_file(token: str):
    try:
        payload = validate_signed_token(token)
        source_path = validate_file_path(payload["file_path"])
        return FileResponse(
            path=source_path,
            filename=Path(source_path).name,
            media_type="application/octet-stream",
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/api/versioning/archive/old/export")
async def api_archive_old_versions_export(payload: ArchiveOldVersionsRequest):
    try:
        archived_paths = archive_old_versions_service(
            project_id=_project_id(payload),
            keep_latest=payload.keep_latest,
            key=payload.key,
        )
        archived = [str(path) for path in archived_paths]
        return success_response("Old versions archived.", data={"archived_paths": archived}, archived_paths=archived)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/decompress")
async def api_decompress_dataset(payload: FileTransformRequest):
    try:
        source_path = validate_file_path(payload.file_path)
        decompressed_path = decompress_dataset(
            source_path,
            output_path=payload.output_path,
            remove_source=payload.remove_source,
        )
        return success_response("Dataset decompressed.", data={"decompressed_path": str(decompressed_path)}, decompressed_path=str(decompressed_path))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/encrypt")
async def api_encrypt_dataset(payload: FileTransformRequest):
    try:
        source_path = validate_file_path(payload.file_path)
        encrypted_path = encrypt_file(
            source_path,
            output_path=payload.output_path,
            key=payload.key,
            remove_source=payload.remove_source,
        )
        return success_response("Dataset encrypted.", data={"encrypted_path": str(encrypted_path)}, encrypted_path=str(encrypted_path))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/decrypt")
async def api_decrypt_dataset(payload: FileTransformRequest):
    try:
        source_path = validate_file_path(payload.file_path)
        decrypted_path = decrypt_file(
            source_path,
            output_path=payload.output_path,
            key=payload.key,
            remove_source=payload.remove_source,
        )
        return success_response("Dataset decrypted.", data={"decrypted_path": str(decrypted_path)}, decrypted_path=str(decrypted_path))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/archive/version")
async def api_archive_version(payload: ArchiveVersionRequest):
    try:
        archive_path = archive_version(
            version_name=payload.version_name,
            project_id=_project_id(payload),
            key=payload.key,
        )
        return success_response("Version archived.", data={"archive_path": str(archive_path)}, archive_path=str(archive_path))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/archive/old")
async def api_archive_old_versions(payload: ArchiveOldVersionsRequest):
    try:
        archived_paths = archive_old_versions(
            project_id=_project_id(payload),
            keep_latest=payload.keep_latest,
            key=payload.key,
        )
        archived = [str(path) for path in archived_paths]
        return success_response("Old versions archived.", data={"archived_paths": archived}, archived_paths=archived)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/archive/status")
async def api_archive_status(project_id: str = DEFAULT_PROJECT_ID, keep_latest: int = 2):
    try:
        archive_status = get_archive_status(project_id, keep_latest)
        return success_response("Archive status loaded.", data={"archive_status": archive_status}, archive_status=archive_status)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/temp/decrypt")
async def api_temp_decrypt(payload: TempDecryptRequest):
    try:
        archive_path = validate_file_path(payload.archive_path)
        temp_path = decrypt_archive_to_temp(
            archive_path=archive_path,
            project_id=_project_id(payload),
            key=payload.key,
            output_path=payload.output_path,
            remove_source=payload.remove_source,
        )
        return success_response("Archive decrypted to temp.", data={"temp_path": str(temp_path)}, temp_path=str(temp_path))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/temp/cleanup")
async def api_temp_cleanup(payload: TempCleanupRequest):
    try:
        cleaned = cleanup_temp_file(payload.file_path)
        return success_response("Temporary file cleaned.", data={"cleaned": cleaned}, cleaned=cleaned)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/version-path/{version_name}")
async def api_version_path(version_name: str, project_id: str = DEFAULT_PROJECT_ID):
    try:
        version_path = str(get_version_path(project_id, version_name))
        return success_response("Version path loaded.", data={"version_path": version_path}, version_path=version_path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/datasets/{dataset_name}/files/{file_name}/delete")
async def api_delete_dataset_file(dataset_name: str, file_name: str, payload: DeleteDatasetFileRequest | None = None, current_user=Depends(get_current_user)):
    try:
        _ensure_owner(dataset_name, current_user)
        project_id = payload.project_id if payload else DEFAULT_PROJECT_ID
        deleted = delete_dataset_file(dataset_name, file_name, project_id)
        return success_response("Dataset file deleted.", data={"deleted": str(deleted)}, deleted=str(deleted))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/report/generate")
async def api_generate_report(payload: ReportGenerateRequest, current_user=Depends(get_current_user)):
    try:
        # enforce ownership if dataset specified
        if getattr(payload, 'dataset_name', None):
            _ensure_owner(payload.dataset_name, current_user)
        version_name = payload.version_name
        project_id = payload.project_id or DEFAULT_PROJECT_ID
        dataset_name = payload.dataset_name
        output_path = payload.output_path
        report_path = generate_report(version_name, project_id, dataset_name, output_path)
        return success_response("Report generated.", data={"report_path": str(report_path)}, report_path=str(report_path))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))



@router.get("/api/versioning/quality")
async def api_quality_score(
    version_name: str,
    project_id: str = DEFAULT_PROJECT_ID,
    dataset_name: str | None = None,
):
    try:
        quality = compute_quality_score(version_name, project_id, dataset_name)
        return success_response("Quality score loaded.", data={"quality": quality}, quality=quality)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
