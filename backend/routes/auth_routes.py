from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from schemas.auth_schema import UserCreate, Token, UserOut
from schemas.common import success_response
from services.auth_service import create_user, authenticate_user, create_access_token
from core.database import SessionLocal
from models.user_model import User
from utils.log_utils import log_calls

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post('/api/auth/register')
@log_calls
def register(payload: UserCreate, db: Session = Depends(get_db)):
    try:
        existing = db.query(User).filter((User.username == payload.username) | (User.email == payload.email)).first()
        if existing is not None:
            raise HTTPException(status_code=400, detail='Username or email already exists')
        user = create_user(username=payload.username, email=payload.email, password=payload.password, db=db)
        user_data = UserOut(id=user.id, username=user.username, email=user.email).model_dump()
        return success_response("User registered successfully.", data=user_data)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post('/api/auth/token')
@log_calls
def token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    access_token = create_access_token({'sub': user.username})
    token_data = Token(access_token=access_token, token_type='bearer').model_dump()
    return success_response("Token issued successfully.", data=token_data)
