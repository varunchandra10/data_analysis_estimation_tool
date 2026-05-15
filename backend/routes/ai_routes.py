from fastapi import APIRouter, HTTPException
import pandas as pd
from services.recommendation_engine import build_dataset_recommendations

# Updated imports to match your new ai_explanation_engine.py
from services.ai_explanation_engine import (
    explain_missing_value_method,
    explain_outlier_method,
    explain_validation_issue,
    explain_weight_estimation
)

from utils.file_utils import validate_file_path
from utils.log_utils import log_calls

router = APIRouter()

@router.post("/api/ai/recommendations")
@log_calls
async def ai_recommendations(payload: dict):
    try:
        path = validate_file_path(payload.get("file_path"))
        schema = payload.get("schema", [])

        if str(path).endswith(".csv"):
            df = pd.read_csv(path)
        else:
            df = pd.read_excel(path)

        # This is a statistical engine call (usually synchronous)
        recommendations = build_dataset_recommendations(df=df, schema=schema)

        return {
            "status": "success",
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/ai/explanations")
@log_calls
async def ai_explanations(payload: dict):
    """
    Refactored to generate explanations for the entire dataset 
    using the new async individual module functions.
    """
    try:
        recommendations = payload.get("recommendations", [])
        explanations = []

        for item in recommendations:
            column = item.get("column")
            rec = item.get("recommendations", {})
            reason_codes = item.get("reason_codes", [])

            # 1. Get Missing Value Explanation
            missing_method = rec.get("missing_value_method")
            missing_exp = "No missing values detected."
            if missing_method:
                # MUST USE await HERE
                missing_exp = await explain_missing_value_method(
                    column, missing_method, reason_codes
                )

            # 2. Get Outlier Explanation
            outlier_method = rec.get("outlier_method")
            outlier_exp = "No outliers detected."
            if outlier_method:
                # MUST USE await HERE
                outlier_exp = await explain_outlier_method(
                    column, outlier_method, reason_codes
                )

            explanations.append({
                "column": column,
                "missing_value_ai_explanation": missing_exp,
                "outlier_ai_explanation": outlier_exp
            })

        return {
            "status": "success",
            "explanations": explanations
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))