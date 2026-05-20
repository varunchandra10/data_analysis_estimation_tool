from fastapi import APIRouter, HTTPException

from schemas.cleaning_schema import OutlierRequest
from services.cleaning_service import apply_outliers_service

router = APIRouter()


@router.post("/api/outliers/detect")
async def detect_outliers(payload: OutlierRequest):
    return await apply_outliers_service(payload.model_dump())



@router.post("/api/outliers/apply")
async def apply_outliers(payload: OutlierRequest):
    return await apply_outliers_service(payload.model_dump())
