import pytest
from pathlib import Path
from fastapi import HTTPException
from unittest.mock import patch
from io import BytesIO

from utils.file_utils import resolve_safe_path, validate_file_path
from utils.dataset_storage import DATASETS_ROOT
from core.database import SessionLocal
from models.dataset_model import Dataset
from models.version_model import Version
from models.report_model import Report

def test_resolve_safe_path_valid():
    # Valid datasets root subpath
    path = resolve_safe_path("dataset_test.csv")
    assert path.name == "dataset_test.csv"
    assert path.parent == DATASETS_ROOT.resolve()

def test_resolve_safe_path_invalid_traversal():
    # Try traversing out of datasets root
    with pytest.raises(HTTPException) as exc:
        resolve_safe_path("../../../secret.key")
    assert exc.value.status_code == 403
    assert "Access to the requested file path is not allowed" in exc.value.detail

def test_resolve_safe_path_invalid_absolute():
    # Try absolute path outside allowed roots
    with pytest.raises(HTTPException) as exc:
        resolve_safe_path("C:\\Windows\\System32\\cmd.exe")
    assert exc.value.status_code == 403

def test_upload_sync_and_rollback(client, db_session):
    # Test upload with a mock DB error to check rollback
    csv_content = b"col1,col2\n1,2\n3,4"
    file = ("test_upload_rollback.csv", BytesIO(csv_content), "text/csv")
    
    # Force a database commit error to trigger rollback during upload
    with patch("sqlalchemy.orm.Session.commit", side_effect=Exception("DB mock failure")):
        response = client.post("/api/upload", files={"file": file})
        assert response.status_code == 500

        assert "Database synchronization failed" in response.json()["detail"]
        
    # Check that no file is left on disk
    # Let's resolve what path the file would have been saved to
    expected_path = DATASETS_ROOT / "test_upload_rollback" / "processed" / "raw_test_upload_rollback.csv"
    assert not expected_path.exists()
    
    # Check that no DB row was committed
    ds = db_session.query(Dataset).filter(Dataset.dataset_name == "test_upload_rollback").first()
    assert ds is None

def test_successful_upload_sync(client, db_session):
    # Perform successful upload
    csv_content = b"col1,col2\n1,2\n3,4"
    file = ("test_upload_success.csv", BytesIO(csv_content), "text/csv")
    
    response = client.post("/api/upload", files={"file": file})
    assert response.status_code == 200
    
    # Check that file exists on disk
    expected_path = DATASETS_ROOT / "test_upload_success" / "processed" / "raw_test_upload_success.csv"
    assert expected_path.exists()
    
    # Check DB registration
    ds = db_session.query(Dataset).filter(Dataset.dataset_name == "test_upload_success").first()
    assert ds is not None
    assert ds.checksum is not None
    assert ds.size > 0
    assert ds.file_path == str(expected_path.resolve())

def test_reconciliation_endpoint(client):
    response = client.get("/api/reconcile")
    assert response.status_code == 200
    data = response.json()["data"]
    assert "summary" in data
    assert "is_healthy" in data["summary"]
