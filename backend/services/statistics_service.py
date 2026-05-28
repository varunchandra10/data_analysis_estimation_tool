from __future__ import annotations

from typing import Any

from services.versioning.engine import save_stage_dataset
from services.statistics.weighting_engine import run_weight_estimation
from utils.dataset_storage import resolve_dataset_name
from services.dataset_loader import load_dataset, validate_dataset_path
from utils.log_utils import log_calls
from utils.stats_utils import get_comprehensive_stats


@log_calls
async def profile_dataset_service(payload: dict[str, Any]) -> dict[str, Any]:
    path = validate_dataset_path(payload.get('file_path'))
    df = load_dataset(path, optimize=True)
    return {'status': 'success', 'stats': get_comprehensive_stats(df)}


@log_calls
async def estimate_statistics_service(payload: dict[str, Any]) -> dict[str, Any]:
    path = validate_dataset_path(payload.get('file_path'))
    df = load_dataset(path, optimize=True)
    value_column = payload.get('value_column')
    weight_column = payload.get('weight_column')
    analysis_type = payload.get('analysis_type', 'mean')
    confidence_level = payload.get('confidence_level', 0.95)

    if not value_column or not weight_column:
        raise ValueError('Both value_column and weight_column are required.')

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
        stage_name='estimation',
        file_extension=path.suffix,
    )

    return {'status': 'success', 'file_path': str(saved_path), **result}
