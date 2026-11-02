from __future__ import annotations

from typing import Any

from services.versioning.engine import save_stage_dataset
from services.statistics.weighting_engine import run_weight_estimation
from services.statistics.ipf_engine import run_iterative_proportional_fitting
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


@log_calls
async def rake_dataset_service(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Executes multidimensional iterative proportional fitting (IPF / raking)
    to generate calibrated demographic survey weights.
    """
    path = validate_dataset_path(payload.get('file_path'))
    df = load_dataset(path, optimize=True)

    target_margins = payload.get('target_margins', {})
    base_weight_column = payload.get('base_weight_column')
    output_weight_column = payload.get('output_weight_column', 'calibrated_weight')
    max_iter = int(payload.get('max_iter', 100))
    epsilon = float(payload.get('epsilon', 1e-4))
    trim_lower = payload.get('trim_lower')
    trim_upper = payload.get('trim_upper')

    result = run_iterative_proportional_fitting(
        df=df,
        target_margins=target_margins,
        base_weight_column=base_weight_column,
        output_weight_column=output_weight_column,
        max_iter=max_iter,
        epsilon=epsilon,
        trim_lower=trim_lower,
        trim_upper=trim_upper,
    )

    result_df = result.pop('df')

    saved_path = save_stage_dataset(
        dataset_source=result_df,
        dataset_name=resolve_dataset_name(path),
        stage_name='calibrated',
        file_extension=path.suffix,
    )

    try:
        from services.audit_log_service import record_audit_log
        record_audit_log(
            dataset_name=resolve_dataset_name(path),
            action="ipf_raking_calibration",
            details={
                "converged": result["converged"],
                "iterations": result["iterations"],
                "kish_ess": result["kish_effective_sample_size"],
                "weight_column": output_weight_column,
            },
            status="success" if result["converged"] else "warning",
        )
    except Exception:
        pass

    return {'status': 'success', 'file_path': str(saved_path), **result}
