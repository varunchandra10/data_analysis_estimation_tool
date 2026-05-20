import pandas as pd
from pandas.api.types import is_datetime64_any_dtype

from datetime import datetime

from utils.dataframe_utils import (
    convert_value
)


def evaluate_condition(
    left,
    operator,
    right
):

    def _parse_datetime(value):
        if value is None:
            return None

        if isinstance(value, pd.Timestamp):
            return value.to_pydatetime()

        if hasattr(value, 'to_pydatetime'):
            try:
                return value.to_pydatetime()
            except Exception:
                pass

        if isinstance(value, str):
            candidate = value.strip()
            if not candidate:
                return None

            date_like = any(token in candidate for token in ['-', '/', ':', 'T'])
            if date_like:
                parsed = pd.to_datetime(candidate, errors='coerce', infer_datetime_format=True)
                if not pd.isna(parsed):
                    return parsed.to_pydatetime()

        return None

    typed_right = (

        convert_value(right)

        if operator not in [
            "is_null",
            "not_null"
        ]

        else None
    )

    left_dt = _parse_datetime(left)
    right_dt = _parse_datetime(typed_right)

    if left_dt is not None and right_dt is not None and operator in ['>', '<', '>=', '<=', '==', '!=']:
        left = left_dt
        typed_right = right_dt

    try:

        if operator == ">":

            return left > typed_right

        if operator == "<":

            return left < typed_right

        if operator == ">=":

            return left >= typed_right

        if operator == "<=":

            return left <= typed_right

        if operator == "==":

            return str(left) == str(
                typed_right
            )

        if operator == "!=":

            return str(left) != str(
                typed_right
            )

        if operator == "is_null":

            return pd.isnull(left)

        if operator == "not_null":

            return not pd.isnull(left)

        return False

    except:

        return False