from __future__ import annotations

from typing import Any
from pathlib import Path

from core.config import MAX_VIOLATIONS_RETURNED
from services.validation.engine import ValidationEngine
from schemas.validation_schema import ValidationResponse, ValidationRule
from services.validation.smart_engine import suggest_validation_rules
from services.versioning.engine import read_dataset_file, save_stage_dataset
from utils.dataset_storage import resolve_dataset_name
from utils.file_utils import safe_json_replace, validate_file_path
from utils.log_utils import log_calls


@log_calls
async def run_validation_service(payload: dict[str, Any]) -> dict[str, Any]:
    in_memory = payload.get('in_memory', False)
    if in_memory and 'df' in payload:
        df = payload['df'].copy()
        path = Path(payload.get('file_path'))
    else:
        path = validate_file_path(payload.get('file_path'))
        df = read_dataset_file(path)
    rules = payload.get('rules', [])
    # Parse the raw dict rules into Pydantic models using type adapter or model_validate
    from pydantic import TypeAdapter
    rule_adapter = TypeAdapter(list[ValidationRule])
    try:
        parsed_rules = rule_adapter.validate_python(rules)
    except Exception as e:
        # Fallback to empty rules if schema fails validation heavily, though API routing should catch it
        parsed_rules = []

    engine = ValidationEngine(df, parsed_rules)
    validation_data = engine.execute()

    if in_memory:
        saved_path = path
    else:
        saved_path = save_stage_dataset(
            dataset_source=df,
            dataset_name=resolve_dataset_name(path),
            stage_name='validation',
            file_extension=path.suffix,
        )

    response = ValidationResponse(
        status='success',
        message='Validation completed',
        file_path=str(saved_path),
        preview=safe_json_replace(df.head(5)),
        data=validation_data,
        meta={'total_rows': len(df)}
    )
    try:
        from services.audit_log_service import record_audit_log
        record_audit_log(
            dataset_name=resolve_dataset_name(path),
            action="validation",
            details={"total_rows": len(df), "failed_rules": validation_data.get("failed_rules", 0) if isinstance(validation_data, dict) else 0},
            status="success"
        )
    except Exception:
        pass
    return response.model_dump()



@log_calls
async def suggest_validation_rules_service(payload: dict[str, Any]) -> dict[str, Any]:
    path = validate_file_path(payload.get('file_path'))
    df = read_dataset_file(path)
    return suggest_validation_rules(df=df, dataset_name=resolve_dataset_name(path), source_path=str(path))
