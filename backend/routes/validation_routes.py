from fastapi import APIRouter

from schemas.validation_schema import ValidationRequest
from services.validation_service import run_validation_service, suggest_validation_rules_service
from utils.log_utils import log_calls

router = APIRouter()


@router.post("/api/validation/run")
@log_calls
async def run_validation(payload: ValidationRequest):
    return await run_validation_service(payload.model_dump())


@router.post("/api/validation/suggest")
@log_calls
async def suggest_validation_rules_api(payload: ValidationRequest):
    return await suggest_validation_rules_service(payload.model_dump())
