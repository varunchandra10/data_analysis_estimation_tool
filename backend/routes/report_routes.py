import io
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Query, Header
from fastapi.responses import StreamingResponse, FileResponse

from services.reporting.engine import build_pdf_report
from schemas.versioning_schema import ReportGenerateRequest
from schemas.common import success_response
from utils.log_utils import log_calls
from services.auth_service import get_current_user
from models.user_model import User
from models.report_model import Report
from models.dataset_model import Dataset
from core.database import SessionLocal
from core.config import SECRET_KEY, JWT_ALGORITHM
from utils.token_utils import TokenError, decode_token, encode_token, build_expiring_payload
from utils.file_utils import resolve_safe_path

router = APIRouter()


def create_report_download_token(filename: str, user_id: int, expires_seconds: int = 3600) -> str:
    """Create a signed, time-limited token for downloading a report."""
    payload = {"filename": filename, "user_id": user_id, "type": "report_download"}
    return encode_token(build_expiring_payload(payload, expires_seconds), SECRET_KEY, algorithm=JWT_ALGORITHM)


def verify_report_download_token(token: str) -> dict:
    """Verify and decode a signed report download token."""
    try:
        payload = decode_token(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "report_download":
            raise TokenError("Invalid token type")
        return payload
    except TokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired download token: {e}")


@router.post("/api/report/pdf")
@log_calls
async def generate_report(payload: ReportGenerateRequest, current_user=Depends(get_current_user)):
    try:
        pdf_bytes = build_pdf_report(payload.model_dump())
        buffer = io.BytesIO(pdf_bytes)
        buffer.seek(0)
        headers = {
            "Content-Disposition": "attachment; filename=report.pdf"
        }
        return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/reports/token/{filename}")
async def get_download_token(filename: str, current_user: User = Depends(get_current_user)):
    """Generate a signed single-use/expiring download token for a report file."""
    db = SessionLocal()
    try:
        report = db.query(Report).filter(Report.filename == filename).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found.")
        dataset = db.query(Dataset).filter(Dataset.id == report.dataset_id).first()
        if dataset and dataset.owner_id is not None and dataset.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this report")

        token = create_report_download_token(filename, current_user.id)
        return success_response(
            "Download token generated",
            data={
                "token": token,
                "download_url": f"/api/reports/download/token/{token}",
            },
        )
    finally:
        db.close()


@router.get("/api/reports/download/token/{token}")
async def download_report_by_token(token: str):
    """Secure signed-token endpoint for downloading reports."""
    payload = verify_report_download_token(token)
    filename = payload.get("filename")
    user_id = payload.get("user_id")

    db = SessionLocal()
    try:
        report = db.query(Report).filter(Report.filename == filename).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found in DB.")
        dataset = db.query(Dataset).filter(Dataset.id == report.dataset_id).first()
        if dataset and dataset.owner_id is not None and dataset.owner_id != user_id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this report")

        path = resolve_safe_path(report.file_path)
        if not path.exists():
            raise HTTPException(status_code=404, detail="Report file not found on disk.")

        return FileResponse(path, filename=report.filename, media_type="application/pdf")
    finally:
        db.close()


@router.get("/api/reports/download/{filename}")
async def download_report(
    filename: str,
    token: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
):
    """Authenticated endpoint for downloading a report by filename.
    Requires either a Bearer JWT in the Authorization header or a signed token in query params.
    """
    user_id = None
    if token:
        payload = verify_report_download_token(token)
        if payload.get("filename") != filename:
            raise HTTPException(status_code=403, detail="Token filename mismatch")
        user_id = payload.get("user_id")
    elif authorization and authorization.startswith("Bearer "):
        jwt_token = authorization.split(" ", 1)[1]
        try:
            payload = decode_token(jwt_token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
            db = SessionLocal()
            username = payload.get("sub") or payload.get("username")
            user = db.query(User).filter((User.username == username) | (User.email == username)).first()
            if not user:
                db.close()
                raise HTTPException(status_code=401, detail="User not found")
            user_id = user.id
            db.close()
        except TokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid authorization token: {e}")
    else:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Provide Authorization header or ?token= query parameter.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    db = SessionLocal()
    try:
        report = db.query(Report).filter(Report.filename == filename).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found in DB.")
        dataset = db.query(Dataset).filter(Dataset.id == report.dataset_id).first()
        if dataset and dataset.owner_id is not None and dataset.owner_id != user_id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this report")

        path = resolve_safe_path(report.file_path)
        if not path.exists():
            raise HTTPException(status_code=404, detail="Report file not found on disk.")

        return FileResponse(path, filename=report.filename, media_type="application/pdf")
    finally:
        db.close()
