from fastapi import APIRouter, HTTPException

from schemas.pipeline_schema import PipelineRequest
from services.pipeline_engine import run_pipeline
from utils.log_utils import log_calls


router = APIRouter()


@router.post('/api/pipeline/run')
@log_calls
async def run_full_pipeline(payload: PipelineRequest):
    try:
        return await run_pipeline(payload.model_dump())
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))