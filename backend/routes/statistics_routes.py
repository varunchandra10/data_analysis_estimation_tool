from fastapi import APIRouter, HTTPException

from schemas.weighting_schema import WeightRequest, StatisticsProfileRequest
from services.statistics_service import estimate_statistics_service, profile_dataset_service
from utils.log_utils import log_calls

router = APIRouter()


@router.post("/api/statistics/profile")
@log_calls
async def profile_dataset(payload: StatisticsProfileRequest):
    try:
        return await profile_dataset_service(payload.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/statistics/estimate")
@log_calls
async def estimate_statistics(payload: WeightRequest):
    try:
        return await estimate_statistics_service(payload.model_dump())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
