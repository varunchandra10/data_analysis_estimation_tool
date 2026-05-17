from fastapi import APIRouter, HTTPException
import hashlib
import json

from services.recommendation_engine import build_dataset_recommendations
from services.ai_cache_engine import append_ai_cache_entry, get_ai_cache_section, update_ai_cache_section

# Updated imports to match your new ai_explanation_engine.py
from services.ai_explanation_engine import (
    explain_missing_value_method,
    explain_outlier_method,
    explain_validation_issue,
    explain_weight_estimation
)

from utils.file_utils import load_dataframe_from_path
from utils.file_utils import validate_file_path
from utils.hash_utils import generate_sha256
from utils.log_utils import log_calls
from utils.dataset_storage import resolve_dataset_name

router = APIRouter()


def _source_cache_key(source_path: str) -> str:
    return source_path.replace("\\", "/")


def _schema_signature(schema: list[dict]) -> str:
    normalized_schema = [
        {
            "column": item.get("column"),
            "type": item.get("type"),
            "pandas_dtype": item.get("pandas_dtype"),
        }
        for item in (schema or [])
    ]
    payload = json.dumps(normalized_schema, sort_keys=True)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _profile_cache_key(source_path: str, file_hash: str, schema: list[dict]) -> str:
    return json.dumps(
        {
            "source_path": _source_cache_key(source_path),
            "file_hash": file_hash,
            "schema_signature": _schema_signature(schema),
        },
        sort_keys=True,
    )


def _build_cache_sections(
    recommendations: list[dict],
    source_path: str,
    schema: list[dict],
    file_hash: str,
) -> dict[str, dict]:
    missing_values: dict[str, dict] = {}
    outliers: dict[str, dict] = {}
    validation: dict[str, dict] = {}
    weighting: dict[str, dict] = {}

    for item in recommendations:
        column = item.get("column")
        if not column:
            continue

        recommendation = item.get("recommendations", {})
        stats = item.get("statistics", {})

        missing_values[column] = {
            "method": recommendation.get("missing_value_method"),
            "confidence": recommendation.get("confidence"),
            "reason_codes": recommendation.get("reason_codes", []),
            "warnings": recommendation.get("warnings", []),
            "missing_percent": stats.get("missing_percent"),
        }

        outliers[column] = {
            "method": recommendation.get("outlier_method"),
            "confidence": recommendation.get("confidence"),
            "reason_codes": recommendation.get("reason_codes", []),
            "warnings": recommendation.get("warnings", []),
            "outlier_percent": stats.get("outlier_percent"),
            "distribution": stats.get("distribution"),
        }

        validation[column] = {
            "priority": recommendation.get("validation_priority"),
            "reason_codes": recommendation.get("reason_codes", []),
            "warnings": recommendation.get("warnings", []),
        }

        weighting[column] = {
            "priority": recommendation.get("weight_estimation_priority"),
            "reason_codes": recommendation.get("reason_codes", []),
            "warnings": recommendation.get("warnings", []),
            "distribution": stats.get("distribution"),
        }

    dataset_summary = {
        "source_path": source_path,
        "file_hash": file_hash,
        "schema_signature": _schema_signature(schema),
        "schema_columns": len(schema or []),
        "recommendation_count": len(recommendations),
        "recommendations": recommendations,
    }

    return {
        "missing_values": missing_values,
        "outliers": outliers,
        "validation": validation,
        "weighting": weighting,
        "dataset_summary": dataset_summary,
        "profiles": {
            _profile_cache_key(source_path, file_hash, schema): {
                "source_path": source_path,
                "file_hash": file_hash,
                "schema_signature": _schema_signature(schema),
                "missing_values": missing_values,
                "outliers": outliers,
                "validation": validation,
                "weighting": weighting,
                "dataset_summary": dataset_summary,
            }
        },
    }

@router.post("/api/ai/recommendations")
@log_calls
async def ai_recommendations(payload: dict):
    try:
        path = validate_file_path(payload.get("file_path"))
        schema = payload.get("schema", [])
        dataset_name = resolve_dataset_name(path)
        source_path = str(path)
        file_hash = generate_sha256(path)
        profile_key = _profile_cache_key(source_path, file_hash, schema)

        cached_profiles = get_ai_cache_section(dataset_name, "profiles", {}) or {}
        cached_profile = cached_profiles.get(profile_key)
        if cached_profile and cached_profile.get("dataset_summary", {}).get("recommendations"):
            return {
                "status": "success",
                "source_path": source_path,
                "cached": True,
                "recommendations": cached_profile["dataset_summary"]["recommendations"],
            }

        df = load_dataframe_from_path(path)

        # This is a statistical engine call (usually synchronous)
        recommendations = build_dataset_recommendations(df=df, schema=schema)

        cache_sections = _build_cache_sections(
            recommendations=recommendations,
            source_path=source_path,
            schema=schema,
            file_hash=file_hash,
        )

        for section_name, section_data in cache_sections.items():
            if section_name == "profiles":
                for key, value in section_data.items():
                    append_ai_cache_entry(dataset_name, "profiles", key, value)
            else:
                update_ai_cache_section(dataset_name, section_name, section_data)

        return {
            "status": "success",
            "source_path": source_path,
            "cached": False,
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
