from __future__ import annotations

from pydantic import BaseModel, Field, field_validator
from typing import Optional


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=128)
    email: str
    password: str = Field(..., min_length=6)

    @field_validator('email')
    @classmethod
    def validate_email(cls, value: str) -> str:
        email = value.strip()
        if '@' not in email or email.startswith('@') or email.endswith('@'):
            raise ValueError('Invalid email address')
        return email


class UserOut(BaseModel):
    id: int
    username: str
    email: str


class Token(BaseModel):
    access_token: str
    token_type: str = 'bearer'


class TokenData(BaseModel):
    username: Optional[str] = None
