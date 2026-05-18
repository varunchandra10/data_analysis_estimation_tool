import io

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from services.report_engine import build_pdf_report
from utils.log_utils import log_calls

router = APIRouter()


@router.post("/api/report/pdf")
@log_calls
async def generate_report(payload: dict):
    try:
        pdf_bytes = build_pdf_report(payload)
        buffer = io.BytesIO(pdf_bytes)
        buffer.seek(0)
        headers = {
            "Content-Disposition": "attachment; filename=report.pdf"
        }
        return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
