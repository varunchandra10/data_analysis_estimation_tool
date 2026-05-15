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

    if str(path).endswith(".csv"):

        df = pd.read_csv(path)

    else:

        df = pd.read_excel(path)

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

    if str(path).endswith(".csv"):

        df.to_csv(
            path,
            index=False
        )

    else:

        df.to_excel(
            path,
            index=False
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

        dataset_name=path.name,

        operation="Missing Value Cleaning",

        rows_affected=rows_affected,

        details={
            "strategies": strategies
        }
    )

    return {

        "status": "success",

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