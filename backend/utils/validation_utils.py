import pandas as pd

from utils.dataframe_utils import (
    convert_value
)


def evaluate_condition(
    left,
    operator,
    right
):

    typed_right = (

        convert_value(right)

        if operator not in [
            "is_null",
            "not_null"
        ]

        else None
    )

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