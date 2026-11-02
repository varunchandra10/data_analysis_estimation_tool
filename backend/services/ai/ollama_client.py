from __future__ import annotations

import logging
import os
import time
from typing import Optional

import httpx

from core.config import OLLAMA_MODEL, OLLAMA_URL, GEMINI_API_KEY, ENVIRONMENT
from utils.log_utils import log_calls

logger = logging.getLogger(__name__)

TIMEOUT = 3.0
COOLDOWN_SECONDS = 60
_unavailable_until = 0.0

ACTIVE_GEMINI_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"]


def _is_cloud_deployment() -> bool:
    """
    Detect if the application is running in a cloud deployment (e.g. Render, production container).
    """
    env = (ENVIRONMENT or os.getenv("ENVIRONMENT", "")).strip().lower()
    return (
        env == "production"
        or bool(os.getenv("RENDER"))
        or os.getenv("AI_PROVIDER", "").strip().lower() == "gemini"
    )


def _engine_temporarily_unavailable() -> bool:
    return time.time() < _unavailable_until


def _mark_engine_unavailable() -> None:
    global _unavailable_until
    _unavailable_until = time.time() + COOLDOWN_SECONDS


async def call_gemini_api(prompt: str) -> Optional[str]:
    """
    Calls Google Gemini API using active production models (gemini-2.0-flash, gemini-1.5-flash)
    via header authentication (x-goog-api-key) with robust error logging and multi-part parsing.
    """
    if not GEMINI_API_KEY:
        logger.warning("Gemini API key is not configured.")
        return None

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY.strip(),
    }
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 300,
        },
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        for model in ACTIVE_GEMINI_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            try:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        candidate = candidates[0]
                        finish_reason = candidate.get("finishReason")
                        if finish_reason and finish_reason not in {"STOP", None}:
                            logger.info(f"Gemini candidate finished with reason: {finish_reason}")

                        parts = candidate.get("content", {}).get("parts", [])
                        # Extract and combine non-empty text parts (safely handling thinking parts and multi-part)
                        texts = [p.get("text", "") for p in parts if isinstance(p, dict) and "text" in p]
                        combined = " ".join(texts).strip()
                        if combined:
                            return combined
                        logger.warning(f"Gemini model {model} returned candidate with no text parts.")
                else:
                    logger.warning(
                        f"Gemini model {model} returned HTTP {res.status_code}: {res.text}"
                    )
            except (httpx.ConnectError, httpx.TimeoutException) as exc:
                logger.warning(f"Connection timeout/error calling Gemini model {model}: {exc}")
            except Exception as exc:
                logger.error(f"Error calling Gemini model {model}: {exc}", exc_info=True)

    return None


@log_calls
async def ask_ollama(prompt: str, fallback_message: str = 'AI explanation unavailable.') -> str:
    """
    Handles communication for AI explanations:
    - If in cloud deployment (Render, ENVIRONMENT=production, or AI_PROVIDER=gemini) with GEMINI_API_KEY:
      routes directly to Gemini without waiting for local Ollama timeouts.
    - Otherwise: tries local Ollama first, falling back to Gemini if Ollama is offline or unavailable.
    """
    # 1. Direct Cloud Route for Render / Production
    if _is_cloud_deployment() and GEMINI_API_KEY:
        gemini_result = await call_gemini_api(prompt)
        if gemini_result:
            return gemini_result
        return f'{fallback_message} (Cloud AI Offline).'

    # 2. Local Ollama Attempt
    ollama_failed = False
    if not _engine_temporarily_unavailable():
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    OLLAMA_URL,
                    json={
                        'model': OLLAMA_MODEL,
                        'prompt': prompt,
                        'stream': False,
                    },
                    timeout=TIMEOUT,
                )

            if response.status_code == 200:
                result = response.json()
                response_text = result.get('response', '').strip()
                if response_text:
                    return response_text

            _mark_engine_unavailable()
            ollama_failed = True
        except (httpx.ConnectError, httpx.TimeoutException, Exception) as exc:
            logger.info(f"Ollama unavailable ({exc}), entering cooldown.")
            _mark_engine_unavailable()
            ollama_failed = True
    else:
        ollama_failed = True

    # 3. Fallback to Gemini API if Ollama call fails or is marked offline
    if ollama_failed and GEMINI_API_KEY:
        gemini_result = await call_gemini_api(prompt)
        if gemini_result:
            return gemini_result

    return f'{fallback_message} (Engine Offline).'
