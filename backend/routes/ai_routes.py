from fastapi import APIRouter, HTTPException

from schemas.ai_schema import AIExplanationRequest, AIRecommendationRequest
from services.ai_service import ai_explanations_service, ai_recommendations_service
from utils.log_utils import log_calls

router = APIRouter()

@router.post("/api/ai/recommendations")
@log_calls
async def ai_recommendations(payload: AIRecommendationRequest):
    try:
        return await ai_recommendations_service(payload.model_dump(by_alias=True))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/ai/explanations")
@log_calls
async def ai_explanations(payload: AIExplanationRequest):
    try:
        return await ai_explanations_service(payload.model_dump(by_alias=True))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
