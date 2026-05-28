from fastapi import APIRouter, HTTPException

from schemas.cleaning_schema import CleaningRequest
from services.cleaning_service import clean_missing_values_service
from utils.log_utils import log_calls

router = APIRouter()


@router.post("/api/clean/missing-values")
@log_calls
async def clean_missing_values(payload: CleaningRequest):
    return await clean_missing_values_service(payload.model_dump())
