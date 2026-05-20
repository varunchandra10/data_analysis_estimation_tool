from __future__ import annotations

from typing import Any

from core.config import MAX_VIOLATIONS_RETURNED
from services.validation_engine import run_validation_dsl
from services.smart_validation_engine import suggest_validation_rules
from services.versioning_engine import read_dataset_file, save_stage_dataset
from utils.dataset_storage import resolve_dataset_name
from utils.file_utils import safe_json_replace, validate_file_path
from utils.log_utils import log_calls


@log_calls
async def run_validation_service(payload: dict[str, Any]) -> dict[str, Any]:
    path = validate_file_path(payload.get('file_path'))
    rules = payload.get('rules', [])
    df = read_dataset_file(path)

    validation_result = run_validation_dsl(df, rules)

    saved_path = save_stage_dataset(
        dataset_source=df,
        dataset_name=resolve_dataset_name(path),
        stage_name='validation',
        file_extension=path.suffix,
    )

    return {
        'status': 'success',
        'file_path': str(saved_path),
        'preview': safe_json_replace(df.head(5)),
        'total_violations': validation_result['total_violations'],
        'severity_counts': validation_result['severity_counts'],
        'violations': validation_result['violations'][:MAX_VIOLATIONS_RETURNED],
    }


@log_calls
async def suggest_validation_rules_service(payload: dict[str, Any]) -> dict[str, Any]:
    path = validate_file_path(payload.get('file_path'))
    df = read_dataset_file(path)
    return suggest_validation_rules(df=df, dataset_name=resolve_dataset_name(path), source_path=str(path))
