# app/api/endpoints/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas import user as user_schema
from app.services import user_service
from app.api import deps

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

@router.post("/", response_model=user_schema.User, status_code=status.HTTP_201_CREATED)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: user_schema.UserCreate,
):
    print(user_in)
    # Check user existence by email
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Um usuário com este email já existe no sistema.",
        )

    # Create user
    user = user_service.create_user(db=db, user=user_in)

    # Return new user
    return user