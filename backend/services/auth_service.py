from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional

import base64
import hashlib
import hmac
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from core.config import SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_SECONDS
from core.database import SessionLocal
from models.user_model import User
from utils.token_utils import TokenError, build_expiring_payload, decode_token, encode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def _hash_password(password: str, salt: bytes | None = None) -> str:
    password_bytes = password.encode('utf-8')
    salt_bytes = salt or os.urandom(16)
    derived_key = hashlib.pbkdf2_hmac('sha256', password_bytes, salt_bytes, 120000)
    return f"{base64.b64encode(salt_bytes).decode('ascii')}${base64.b64encode(derived_key).decode('ascii')}"


def _verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_encoded, digest_encoded = stored_hash.split('$', 1)
        salt_bytes = base64.b64decode(salt_encoded.encode('ascii'))
        expected = base64.b64decode(digest_encoded.encode('ascii'))
    except Exception:
        return False

    candidate = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt_bytes, 120000)
    return hmac.compare_digest(candidate, expected)


def _get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_user(username: str, email: str, password: str, db: Session) -> User:
    hashed = _hash_password(password)
    user = User(username=username, email=email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(username: str, password: str, db: Session) -> Optional[User]:
    user = db.query(User).filter((User.username == username) | (User.email == username)).first()
    if not user:
        return None
    if _verify_password(password, user.hashed_password):
        return user
    return None


def create_access_token(data: dict, expires_delta: Optional[int] = None) -> str:
    expire_seconds = int(expires_delta or ACCESS_TOKEN_EXPIRE_SECONDS)
    return encode_token(build_expiring_payload(data.copy(), expire_seconds), SECRET_KEY, algorithm=JWT_ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(_get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub") or payload.get("username")
        if username is None:
            raise credentials_exception
    except TokenError:
        raise credentials_exception
    user = db.query(User).filter((User.username == username) | (User.email == username)).first()
    if user is None:
        raise credentials_exception
    return user
