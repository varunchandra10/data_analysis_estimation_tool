from fastapi import APIRouter

import pandas as pd

from utils.file_utils import (
    validate_file_path
)

from utils.validation_utils import (
    evaluate_condition
)

from core.config import (
    MAX_VIOLATIONS_RETURNED
)

router = APIRouter()

from utils.log_utils import log_calls


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

    if str(path).endswith(".csv"):

        df = pd.read_csv(path)

    else:

        df = pd.read_excel(path)

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

    return {

        "status": "success",

        "total_violations": len(
            violations
        ),

        "severity_counts": severity_counts,

        "violations": violations[
            :MAX_VIOLATIONS_RETURNED
        ]
    }