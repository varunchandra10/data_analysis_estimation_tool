from fastapi import APIRouter

import pandas as pd

from utils.file_utils import (
    validate_file_path
)

from utils.validation_utils import (
    evaluate_condition
)
from utils.file_utils import safe_json_replace

from core.config import (
    MAX_VIOLATIONS_RETURNED
)

router = APIRouter()

from utils.log_utils import log_calls
from services.versioning_engine import save_stage_dataset, read_dataset_file
from utils.dataset_storage import resolve_dataset_name


@router.post("/api/validation/run")
@log_calls
async def run_validation(
    payload: dict
):

    path = validate_file_path(
        payload.get("file_path")
    )

    rules = payload.get(
        "rules",
        []
    )

    df = read_dataset_file(path)

    violations = []

    severity_counts = {

        "low": 0,

        "medium": 0,

        "high": 0
    }

    for rule in rules:

        column = rule.get("column")

        for idx, row in df.iterrows():

            actual = row.get(column)

            is_valid = evaluate_condition(

                actual,

                rule["operator"],

                rule["value"]
            )

            if not is_valid:

                severity = rule.get(
                    "severity",
                    "medium"
                )

                severity_counts[
                    severity
                ] += 1

                violations.append({

                    "row_index": idx,

                    "column": column,

                    "actual": str(actual),

                    "severity": severity
                })

    saved_path = save_stage_dataset(
        dataset_source=df,
        dataset_name=resolve_dataset_name(path),
        stage_name="validation",
        file_extension=path.suffix,
    )

    return {

        "status": "success",

        "file_path": str(saved_path),

        "preview": safe_json_replace(
            df.head(5)
        ),

        "total_violations": len(
            violations
        ),

        "severity_counts": severity_counts,

        "violations": violations[
            :MAX_VIOLATIONS_RETURNED
        ]
    }
