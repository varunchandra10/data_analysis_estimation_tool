import pytest
from fastapi import HTTPException
import matplotlib

from routes.report_routes import create_report_download_token, verify_report_download_token


def test_matplotlib_agg_backend():
    assert matplotlib.get_backend().lower() == 'agg'


def test_create_and_verify_download_token():
    token = create_report_download_token(filename="sample_report.pdf", user_id=42, expires_seconds=60)
    payload = verify_report_download_token(token)
    assert payload["filename"] == "sample_report.pdf"
    assert payload["user_id"] == 42
    assert payload["type"] == "report_download"


def test_verify_invalid_download_token():
    with pytest.raises(HTTPException) as exc_info:
        verify_report_download_token("invalid.jwt.token")
    assert exc_info.value.status_code == 401


def test_verify_tampered_download_token():
    token = create_report_download_token(filename="sample_report.pdf", user_id=42, expires_seconds=60)
    tampered = token[:-5] + "aaaaa"
    with pytest.raises(HTTPException) as exc_info:
        verify_report_download_token(tampered)
    assert exc_info.value.status_code == 401

