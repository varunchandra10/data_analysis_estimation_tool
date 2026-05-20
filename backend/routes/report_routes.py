import io

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse

from services.report_engine import build_pdf_report
from schemas.versioning_schema import ReportGenerateRequest
from schemas.common import success_response
from utils.log_utils import log_calls
from services.auth_service import get_current_user

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
