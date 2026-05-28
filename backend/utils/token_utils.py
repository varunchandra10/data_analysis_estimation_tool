from __future__ import annotations

import base64
import hashlib
import hmac
import json
from datetime import datetime, timedelta, timezone
from typing import Any


class TokenError(Exception):
    pass


class TokenExpiredError(TokenError):
    pass


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}".encode("ascii"))


def _json_default(value: Any) -> str:
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc).isoformat()
    raise TypeError(f"Unsupported token payload type: {type(value)!r}")


def encode_token(payload: dict[str, Any], secret_key: str, algorithm: str = "HS256") -> str:
    if algorithm != "HS256":
        raise ValueError("Only HS256 tokens are supported.")

    header = {"alg": algorithm, "typ": "JWT"}
    header_segment = _b64encode(json.dumps(header, separators=(",", ":"), sort_keys=True).encode("utf-8"))
    payload_segment = _b64encode(json.dumps(payload, separators=(",", ":"), sort_keys=True, default=_json_default).encode("utf-8"))
    signing_input = f"{header_segment}.{payload_segment}".encode("ascii")
    signature = hmac.new(secret_key.encode("utf-8"), signing_input, hashlib.sha256).digest()
    return f"{header_segment}.{payload_segment}.{_b64encode(signature)}"


def decode_token(token: str, secret_key: str, algorithms: list[str] | tuple[str, ...] | None = None) -> dict[str, Any]:
    allowed_algorithms = set(algorithms or ["HS256"])
    parts = token.split(".")
    if len(parts) != 3:
        raise TokenError("Malformed token.")

    header_segment, payload_segment, signature_segment = parts
    signing_input = f"{header_segment}.{payload_segment}".encode("ascii")
    header = json.loads(_b64decode(header_segment).decode("utf-8"))
    algorithm = header.get("alg")
    if algorithm not in allowed_algorithms:
        raise TokenError("Unsupported token algorithm.")

    expected_signature = hmac.new(secret_key.encode("utf-8"), signing_input, hashlib.sha256).digest()
    provided_signature = _b64decode(signature_segment)
    if not hmac.compare_digest(expected_signature, provided_signature):
        raise TokenError("Invalid token signature.")

    payload = json.loads(_b64decode(payload_segment).decode("utf-8"))
    expires_at = payload.get("exp")
    if expires_at:
        expiry = datetime.fromisoformat(str(expires_at).replace("Z", "+00:00"))
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        if expiry <= datetime.now(timezone.utc):
            raise TokenExpiredError("Token has expired.")

    return payload


def build_expiring_payload(payload: dict[str, Any], expires_seconds: int) -> dict[str, Any]:
    token_payload = dict(payload)
    token_payload["exp"] = datetime.now(timezone.utc) + timedelta(seconds=expires_seconds)
    return token_payload
