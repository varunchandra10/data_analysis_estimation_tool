from fastapi import APIRouter
from fastapi import HTTPException

import pandas as pd
import numpy as np

from sklearn.impute import (
    SimpleImputer,
    KNNImputer
)

from utils.file_utils import (
    validate_file_path,
    safe_json_replace
)

from utils.log_utils import (
    save_cleaning_log
)

from utils.log_utils import log_calls
from services.versioning_engine import save_stage_dataset, read_dataset_file
from utils.dataset_storage import resolve_dataset_name

router = APIRouter()


@router.post("/api/clean/missing-values")
@log_calls
async def clean_missing_values(
    payload: dict
):

    path = validate_file_path(
        payload.get("file_path")
    )

    strategies = payload.get(
        "strategies",
        {}
    )

    df = read_dataset_file(path)

    before_count = (
        df.isnull()
        .sum()
        .sum()
    )

    for column, strategy in strategies.items():

        if column not in df.columns:

            continue

        if strategy in [

            "mean",
            "median",
            "most_frequent"

        ]:

            imputer = SimpleImputer(
                strategy=strategy
            )

            df[[column]] = (
                imputer.fit_transform(
                    df[[column]]
                )
            )

        elif strategy == "knn":

            num_cols = (
                df.select_dtypes(
                    include=[np.number]
                ).columns
            )

            imputer = KNNImputer(
                n_neighbors=5
            )

            df[num_cols] = (
                imputer.fit_transform(
                    df[num_cols]
                )
            )

    saved_path = save_stage_dataset(
        dataset_source=df,
        dataset_name=resolve_dataset_name(path),
        stage_name="clean",
        file_extension=path.suffix,
    )

    rows_affected = int(

        before_count -

        (
            df.isnull()
            .sum()
            .sum()
        )
    )

    save_cleaning_log(

        dataset_name=resolve_dataset_name(path),

        operation="Missing Value Cleaning",

        rows_affected=rows_affected,

        details={
            "strategies": strategies
        }
    )

    return {

        "status": "success",

        "file_path": str(saved_path),

        "rows_affected": rows_affected,

        "null_counts": (
            df.isnull()
            .sum()
            .to_dict()
        ),

        "preview": safe_json_replace(
            df.head(5)
        )
    }
