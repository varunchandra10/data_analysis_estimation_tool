import pandas as pd


def convert_value(value):

    """
    Convert frontend string values
    into numeric/boolean values.
    """

    if value is None:

        return None

    try:

        if isinstance(value, str):

            if value.lower() in ["true", "false"]:

                return value.lower() == "true"

            if "." in value:

                return float(value)

            return int(value)

        return value

    except:

        return value


def infer_schema(df):

    schema = []

    for col in df.columns:

        dtype = str(df[col].dtype)

        col_type = "Text"

        # ==========================================
        # NUMERICAL
        # ==========================================

        if pd.api.types.is_numeric_dtype(df[col]):

            col_type = "Numerical"

        # ==========================================
        # DATE
        # ==========================================

        elif pd.api.types.is_datetime64_any_dtype(df[col]):

            col_type = "Date"

        # ==========================================
        # BOOLEAN
        # ==========================================

        elif pd.api.types.is_bool_dtype(df[col]):

            col_type = "Categorical"

        # ==========================================
        # OBJECT / TEXT
        # ==========================================

        else:

            unique_count = df[col].nunique()

            ratio = unique_count / max(len(df), 1)

            if unique_count < 20 or ratio < 0.5:

                col_type = "Categorical"

        schema.append({

            "column": col,
            "type": col_type,
            "pandas_dtype": dtype

        })

    return schema