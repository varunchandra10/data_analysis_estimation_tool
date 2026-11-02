import io
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from main import app
from models.dataset_model import Dataset
from models.user_model import User
from routes.versioning_routes import _ensure_owner
from services.auth_service import get_current_user


def test_dataset_upload_sets_owner_and_prevents_overwrite(client, db_session):
    user1 = User(id=1, username="alice", email="alice@example.com")
    user2 = User(id=2, username="bob", email="bob@example.com")

    # Override current_user as user1
    app.dependency_overrides[get_current_user] = lambda: user1

    csv_data = b"colA,colB\n1,2\n3,4\n"
    file1 = ("test_ownership.csv", io.BytesIO(csv_data), "text/csv")

    resp1 = client.post("/api/upload", files={"file": file1})
    assert resp1.status_code == 200

    ds = db_session.query(Dataset).filter(Dataset.dataset_name == "test_ownership").first()
    assert ds is not None
    assert ds.owner_id == 1

    # Now simulate User 2 attempting to upload with the same dataset name
    app.dependency_overrides[get_current_user] = lambda: user2
    file2 = ("test_ownership.csv", io.BytesIO(csv_data), "text/csv")
    resp2 = client.post("/api/upload", files={"file": file2})
    assert resp2.status_code == 403
    assert "Forbidden: You do not own this dataset" in resp2.json()["detail"]


def test_ensure_owner_checks(db_session):
    user1 = User(id=1, username="alice", email="alice@example.com")
    user2 = User(id=2, username="bob", email="bob@example.com")

    ds = Dataset(
        id=100,
        dataset_name="owned_dataset",
        file_path="/dummy/path.csv",
        owner_id=1,
    )
    db_session.add(ds)
    db_session.commit()

    # User 1 should pass
    _ensure_owner("owned_dataset", user1)

    # User 2 should get 403
    with pytest.raises(HTTPException) as exc:
        _ensure_owner("owned_dataset", user2)
    assert exc.value.status_code == 403
    assert "Forbidden: You do not own this dataset" in exc.value.detail

    # Non-existent dataset should get 404
    with pytest.raises(HTTPException) as exc_404:
        _ensure_owner("non_existent_dataset", user1)
    assert exc_404.value.status_code == 404

