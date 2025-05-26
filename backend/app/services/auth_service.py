# app/services/auth_service.py
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from sqlalchemy.orm import Session

from core.config import settings
from models import user as user_model
from services import user_service

# Check if user exists and if password is correct
def authenticate_user(
    db: Session, email: str, password: str
) -> Optional[user_model.User]:
    
    # Search for user by email
    user = user_service.get_user_by_email(db, email=email)
    if not user:
        return None

    # Check if password corresponds to hashed_password
    if not user_service.verify_password(password, user.hashed_password):
        return None

    return user

# Create a JWT access token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()

    # Define token lifetime
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})

    # Generate JWT token
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    return encoded_jwt