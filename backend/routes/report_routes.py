import io

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse, FileResponse

from services.reporting.engine import build_pdf_report
from schemas.versioning_schema import ReportGenerateRequest
from schemas.common import success_response
from utils.log_utils import log_calls
from services.auth_service import get_current_user
from models.report_model import Report
from core.database import SessionLocal
from utils.file_utils import resolve_safe_path

router = APIRouter()


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


@router.get("/api/reports/download/{filename}")
async def download_report(filename: str):
    db = SessionLocal()
    try:
        report = db.query(Report).filter(Report.filename == filename).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found in DB.")
        
        path = resolve_safe_path(report.file_path)
        if not path.exists():
            raise HTTPException(status_code=404, detail="Report file not found on disk.")
        
        return FileResponse(path, filename=report.filename, media_type="application/pdf")
    finally:
        db.close()

