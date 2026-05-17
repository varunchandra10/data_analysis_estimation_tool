from __future__ import annotations

from fastapi import APIRouter, HTTPException

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
)
from utils.file_utils import safe_json_replace, validate_file_path
from utils.hash_utils import generate_sha256


router = APIRouter()


def _project_id(payload: dict) -> str:
    return payload.get("project_id") or DEFAULT_PROJECT_ID


@router.post("/api/versioning/project/create")
async def api_create_project(payload: dict):
    try:
        project_dir = create_project(_project_id(payload))
        return {"status": "success", "project_dir": str(project_dir)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/raw/save")
async def api_save_raw_dataset(payload: dict):
    try:
        source_path = validate_file_path(payload.get("file_path"))
        raw_path = save_raw_dataset(
            dataset_source=source_path,
            project_id=_project_id(payload),
            filename=payload.get("filename", "dataset.csv"),
        )
        return {"status": "success", "raw_path": str(raw_path)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/version/create")
async def api_create_version(payload: dict):
    try:
        source_path = validate_file_path(payload.get("file_path"))
        result = create_version(
            dataset_source=source_path,
            version_name=payload["version_name"],
            project_id=_project_id(payload),
            parent=payload.get("parent"),
            operations=payload.get("operations", []),
            extra_manifest=payload.get("extra_manifest"),
        )
        return {"status": "success", "result": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/versions")
async def api_list_versions(project_id: str = DEFAULT_PROJECT_ID):
    try:
        return {"status": "success", "versions": list_versions(project_id)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/latest")
async def api_latest_version(project_id: str = DEFAULT_PROJECT_ID):
    try:
        return {"status": "success", "latest": get_latest_version(project_id)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/datasets")
async def api_dataset_folders(project_id: str = DEFAULT_PROJECT_ID):
    try:
        return {"status": "success", "datasets": get_dataset_folders(project_id)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/datasets/{dataset_name}")
async def api_dataset_files(dataset_name: str, project_id: str = DEFAULT_PROJECT_ID):
    try:
        return {"status": "success", "dataset": dataset_name, "files": get_dataset_files(dataset_name, project_id)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/datasets/{dataset_name}/overview")
async def api_dataset_overview(dataset_name: str, project_id: str = DEFAULT_PROJECT_ID):
    try:
        dashboard = get_versioning_dashboard(project_id)
        dataset = next((item for item in dashboard["datasets"] if item["dataset_name"] == dataset_name), None)
        return {"status": "success", "dataset": dataset}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/datasets/{dataset_name}/compress")
async def api_compress_dataset_folder(dataset_name: str, payload: dict | None = None):
    try:
        body = payload or {}
        compressed_path = compress_dataset_folder(
            dataset_name=dataset_name,
            project_id=body.get("project_id") or DEFAULT_PROJECT_ID,
            output_path=body.get("output_path"),
            remove_source=body.get("remove_source", False),
        )
        return {"status": "success", "compressed_path": str(compressed_path)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/manifest/{version_name}")
async def api_get_manifest(version_name: str, project_id: str = DEFAULT_PROJECT_ID):
    try:
        return {"status": "success", "manifest": get_manifest(project_id, version_name)}
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
        return {
            "status": "success",
            "dataset_name": dataset_name,
            "file_name": file_name,
            "file_path": selected["file_path"],
            "preview": preview["preview"],
            "rows": preview["rows"],
            "columns": preview["columns"],
            "columns_list": preview["columns_list"],
        }
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
        return {
            "status": "success",
            "dataset_name": dataset_name,
            "file_name": file_name,
            "file_path": selected["file_path"],
            "analytics": safe_json_replace({
                "rows": int(df.shape[0]),
                "columns": int(df.shape[1]),
                "column_types": {column: str(dtype) for column, dtype in df.dtypes.items()},
                "missing_counts": df.isna().sum().to_dict(),
                "summary": df.describe(include="all").to_dict(),
            }),
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/rollback")
async def api_rollback_version(payload: dict):
    try:
        restore_path = rollback_version(
            version_name=payload["version_name"],
            project_id=_project_id(payload),
            restore_to=payload.get("restore_to"),
        )
        return {"status": "success", "restore_path": str(restore_path)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/hash/generate")
async def api_generate_hash(payload: dict):
    try:
        source_path = validate_file_path(payload.get("file_path"))
        return {"status": "success", "hash": generate_sha256(source_path)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/hash/verify")
async def api_verify_hash(payload: dict):
    try:
        source_path = validate_file_path(payload.get("file_path"))
        actual_hash = generate_sha256(source_path)
        expected_hash = payload.get("expected_hash")

        if expected_hash is None and payload.get("version_name"):
            expected_hash = get_manifest(_project_id(payload), payload["version_name"]).get("hash")

        return {
            "status": "success",
            "actual_hash": actual_hash,
            "expected_hash": expected_hash,
            "matches": expected_hash == actual_hash if expected_hash else None,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/compress")
async def api_compress_dataset(payload: dict):
    try:
        source_path = validate_file_path(payload.get("file_path"))
        compressed_path = compress_dataset(
            source_path,
            output_path=payload.get("output_path"),
            remove_source=payload.get("remove_source", False),
        )
        return {"status": "success", "compressed_path": str(compressed_path)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/decompress")
async def api_decompress_dataset(payload: dict):
    try:
        source_path = validate_file_path(payload.get("file_path"))
        decompressed_path = decompress_dataset(
            source_path,
            output_path=payload.get("output_path"),
            remove_source=payload.get("remove_source", False),
        )
        return {"status": "success", "decompressed_path": str(decompressed_path)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/encrypt")
async def api_encrypt_dataset(payload: dict):
    try:
        source_path = validate_file_path(payload.get("file_path"))
        encrypted_path = encrypt_file(
            source_path,
            output_path=payload.get("output_path"),
            key=payload.get("key"),
            remove_source=payload.get("remove_source", False),
        )
        return {"status": "success", "encrypted_path": str(encrypted_path)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/decrypt")
async def api_decrypt_dataset(payload: dict):
    try:
        source_path = validate_file_path(payload.get("file_path"))
        decrypted_path = decrypt_file(
            source_path,
            output_path=payload.get("output_path"),
            key=payload.get("key"),
            remove_source=payload.get("remove_source", False),
        )
        return {"status": "success", "decrypted_path": str(decrypted_path)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/archive/version")
async def api_archive_version(payload: dict):
    try:
        archive_path = archive_version(
            version_name=payload["version_name"],
            project_id=_project_id(payload),
            key=payload.get("key"),
        )
        return {"status": "success", "archive_path": str(archive_path)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/archive/old")
async def api_archive_old_versions(payload: dict):
    try:
        archived_paths = archive_old_versions(
            project_id=_project_id(payload),
            keep_latest=payload.get("keep_latest", 2),
            key=payload.get("key"),
        )
        return {"status": "success", "archived_paths": [str(path) for path in archived_paths]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/archive/status")
async def api_archive_status(project_id: str = DEFAULT_PROJECT_ID, keep_latest: int = 2):
    try:
        return {"status": "success", "archive_status": get_archive_status(project_id, keep_latest)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/temp/decrypt")
async def api_temp_decrypt(payload: dict):
    try:
        archive_path = validate_file_path(payload.get("archive_path"))
        temp_path = decrypt_archive_to_temp(
            archive_path=archive_path,
            project_id=_project_id(payload),
            key=payload.get("key"),
            output_path=payload.get("output_path"),
            remove_source=payload.get("remove_source", False),
        )
        return {"status": "success", "temp_path": str(temp_path)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/temp/cleanup")
async def api_temp_cleanup(payload: dict):
    try:
        return {"status": "success", "cleaned": cleanup_temp_file(payload["file_path"]) }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/versioning/version-path/{version_name}")
async def api_version_path(version_name: str, project_id: str = DEFAULT_PROJECT_ID):
    try:
        return {"status": "success", "version_path": str(get_version_path(project_id, version_name))}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/versioning/datasets/{dataset_name}/files/{file_name}/delete")
async def api_delete_dataset_file(dataset_name: str, file_name: str, payload: dict | None = None):
    try:
        project_id = payload.get("project_id") if payload else DEFAULT_PROJECT_ID
        deleted = delete_dataset_file(dataset_name, file_name, project_id)
        return {"status": "success", "deleted": str(deleted)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
