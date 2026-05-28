from fastapi import APIRouter, HTTPException

from schemas.ai_schema import AIExplanationRequest, AIRecommendationRequest
from services.ai.recommendation_engine import orchestrate_ai_recommendations
from services.ai.explanation_engine import orchestrate_ai_explanations
from core.exceptions import DatasetNotFoundError
from utils.log_utils import log_calls

router = APIRouter()

@router.post("/api/ai/recommendations")
@log_calls
async def ai_recommendations(payload: AIRecommendationRequest):
    try:
        return await orchestrate_ai_recommendations(payload.model_dump(by_alias=True))
    except DatasetNotFoundError as e:
        raise HTTPException(status_code=404, detail="Dataset file not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/ai/explanations")
@log_calls
async def ai_explanations(payload: AIExplanationRequest):
    try:
        return await orchestrate_ai_explanations(payload.model_dump(by_alias=True))
    except DatasetNotFoundError as e:
        raise HTTPException(status_code=404, detail="Dataset file not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
