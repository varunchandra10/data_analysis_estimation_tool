from fastapi import APIRouter, HTTPException

from schemas.weighting_schema import WeightRequest, StatisticsProfileRequest
from services.statistics_service import estimate_statistics_service, profile_dataset_service
from services.statistics.weighting_engine import WeightingError
from core.exceptions import DatasetNotFoundError
from utils.log_utils import log_calls

router = APIRouter()


@router.post("/api/statistics/profile")
@log_calls
async def profile_dataset(payload: StatisticsProfileRequest):
    try:
        return await profile_dataset_service(payload.model_dump())
    except DatasetNotFoundError as e:
        raise HTTPException(status_code=404, detail="Dataset file not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/statistics/estimate")
@log_calls
async def estimate_statistics(payload: WeightRequest):
    try:
        return await estimate_statistics_service(payload.model_dump())
    except HTTPException:
        raise
    except DatasetNotFoundError as e:
        raise HTTPException(status_code=404, detail="Dataset file not found.")
    except WeightingError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
