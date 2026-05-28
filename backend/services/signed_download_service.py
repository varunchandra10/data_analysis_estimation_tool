from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path

from core.config import SECRET_KEY, JWT_ALGORITHM
from utils.file_utils import validate_file_path
from utils.token_utils import TokenExpiredError, TokenError, build_expiring_payload, decode_token, encode_token


def generate_signed_token(file_path: str, expires_seconds: int = 3600, extra: dict | None = None) -> str:
    payload = {
        'file_path': str(validate_file_path(file_path)),
    }
    if extra:
        payload.update(extra)
    return encode_token(build_expiring_payload(payload, expires_seconds), SECRET_KEY, algorithm=JWT_ALGORITHM)


def validate_signed_token(token: str) -> dict:
    try:
        payload = decode_token(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        file_path = payload.get('file_path')
        if not file_path:
            raise ValueError('Invalid token payload')
        path = validate_file_path(file_path)
        return payload
    except TokenExpiredError:
        raise
    except Exception:
        raise
