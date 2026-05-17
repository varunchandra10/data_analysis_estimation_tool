from fastapi import APIRouter, HTTPException

from services.weighting_engine import run_weight_estimation
from services.versioning_engine import save_stage_dataset
from utils.file_utils import load_dataframe_from_path
from utils.file_utils import validate_file_path
from utils.log_utils import log_calls
from utils.stats_utils import get_comprehensive_stats
from utils.dataset_storage import resolve_dataset_name

router = APIRouter()


def _load_dataframe(path):
    return load_dataframe_from_path(path)


@router.post("/api/statistics/profile")
@log_calls
async def profile_dataset(payload: dict):
    try:
        path = validate_file_path(payload.get("file_path"))
        df = _load_dataframe(path)

        return {
            "status": "success",
            "stats": get_comprehensive_stats(df),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/statistics/estimate")
@log_calls
async def estimate_statistics(payload: dict):
    try:
        path = validate_file_path(payload.get("file_path"))
        df = _load_dataframe(path)

        value_column = payload.get("value_column")
        weight_column = payload.get("weight_column")
        analysis_type = payload.get("analysis_type", "mean")
        confidence_level = payload.get("confidence_level", 0.95)

        if not value_column or not weight_column:
            raise HTTPException(
                status_code=400,
                detail="Both value_column and weight_column are required."
            )

        if value_column not in df.columns:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid value column: {value_column}"
            )

        if weight_column not in df.columns:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid weight column: {weight_column}"
            )

        result = run_weight_estimation(
            df=df,
            value_column=value_column,
            weight_column=weight_column,
            analysis_type=analysis_type,
            confidence_level=confidence_level,
        )

        saved_path = save_stage_dataset(
            dataset_source=df,
            dataset_name=resolve_dataset_name(path),
            stage_name="estimation",
            file_extension=path.suffix,
        )

        return {
            "status": "success",
            "file_path": str(saved_path),
            **result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
