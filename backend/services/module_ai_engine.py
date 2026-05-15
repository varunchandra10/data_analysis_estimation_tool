import httpx
import json
from utils.log_utils import log_calls

# =========================================================
# OLLAMA CONFIG
# =========================================================

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "phi3"
TIMEOUT = 30.0  # Increased slightly as AI generation can be slow


# =========================================================
# GENERIC OLLAMA CALL (ASYNC)
# =========================================================

@log_calls
async def ask_ollama(prompt: str):
    """
    Sends an async request to the local Ollama instance.
    Using httpx ensures the FastAPI event loop is not blocked.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=TIMEOUT
            )

            if response.status_code != 200:
                return "AI explanation unavailable (Engine Error)."

            result = response.json()
            return result.get("response", "").strip()

    except (httpx.ConnectError, httpx.TimeoutException):
        return "AI explanation unavailable (Connection Timeout)."
    except Exception as e:
        return f"AI explanation unavailable."


# =========================================================
# MISSING VALUE AI
# =========================================================

@log_calls
async def explain_missing_value_method(
    column,
    recommended_method,
    reason_codes
):
    prompt = f"""
Explain in ONLY 3 short lines.
Column: {column}
Recommended missing value method: {recommended_method}
Reason: {", ".join(reason_codes)}
Explain why this method is suitable for this specific statistical context.
"""
    return await ask_ollama(prompt)


# =========================================================
# OUTLIER AI
# =========================================================

@log_calls
async def explain_outlier_method(
    column,
    outlier_method,
    reason_codes
):
    prompt = f"""
Explain in ONLY 3 short lines.
Column: {column}
Recommended outlier method: {outlier_method}
Reason: {", ".join(reason_codes)}
Explain why this outlier detection method is statistically robust here.
"""
    return await ask_ollama(prompt)


# =========================================================
# VALIDATION AI
# =========================================================

@log_calls
async def explain_validation_issue(
    column,
    rule_type,
    violation_count
):
    prompt = f"""
Explain in ONLY 3 short lines.
Validation issue detected in column: {column}
Rule Type: {rule_type}
Violations found: {violation_count}
Explain the potential impact on survey data integrity.
"""
    return await ask_ollama(prompt)


# =========================================================
# WEIGHT ESTIMATION AI
# =========================================================

@log_calls
async def explain_weight_estimation(
    analysis_type,
    weighted_value,
    unweighted_value,
    margin_of_error
):
    prompt = f"""
Explain in ONLY 3 short lines.
Analysis Type: {analysis_type}
Weighted Estimate: {weighted_value}
Unweighted Estimate: {unweighted_value}
Margin of Error: {margin_of_error}
Interpret the variance between weighted and raw survey statistics.
"""
    return await ask_ollama(prompt)