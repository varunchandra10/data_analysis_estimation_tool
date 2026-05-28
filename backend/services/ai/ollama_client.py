from __future__ import annotations

import httpx

from core.config import OLLAMA_MODEL, OLLAMA_URL, GEMINI_API_KEY
from utils.log_utils import log_calls

TIMEOUT = 4.0
COOLDOWN_SECONDS = 60
_unavailable_until = 0.0


def _engine_temporarily_unavailable() -> bool:
    import time
    return time.time() < _unavailable_until


def _mark_engine_unavailable() -> None:
    import time
    global _unavailable_until
    _unavailable_until = time.time() + COOLDOWN_SECONDS


@log_calls
async def ask_ollama(prompt: str, fallback_message: str = 'AI explanation unavailable.') -> str:
    """
    Handles communication with Ollama, with a graceful fallback to Gemini API
    if Ollama is not running, offline, or returns an error.
    """
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
        except (httpx.ConnectError, httpx.TimeoutException, Exception):
            _mark_engine_unavailable()
            ollama_failed = True
    else:
        ollama_failed = True

    # Fallback to Gemini API if Ollama call fails or is marked offline
    if ollama_failed and GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ]
            }
            async with httpx.AsyncClient() as client:
                gemini_response = await client.post(url, headers=headers, json=payload, timeout=8.0)
            
            if gemini_response.status_code == 200:
                data = gemini_response.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                if text.strip():
                    return text.strip()
        except Exception:
            pass

    return f'{fallback_message} (Engine Offline).'
