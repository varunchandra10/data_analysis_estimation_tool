from fastapi import APIRouter

from schemas.cleaning_schema import DuplicateRequest
from services.cleaning_service import process_duplicates_service

router = APIRouter()


@router.post("/api/duplicates/process")
async def process_duplicates(payload: DuplicateRequest):
    return await process_duplicates_service(payload.model_dump())
