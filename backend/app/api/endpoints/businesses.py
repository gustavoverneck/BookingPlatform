# app/api/endpoints/businesses.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api import deps
from models import user as user_model
from schemas import business as business_schema
from services import business_service

router = APIRouter()

@router.post("/", response_model=business_schema.Business, status_code=status.HTTP_201_CREATED)
def create_business(
    *,
    db: Session = Depends(deps.get_db),
    business_in: business_schema.BusinessCreate,
    current_user: user_model.User = Depends(deps.get_current_active_user)
):
    business = business_service.create_business(
        db=db, business_in=business_in, owner_id=current_user.id
    )
    return business

@router.get("/me", response_model=List[business_schema.Business])
def read_my_businesses(
    *,
    db: Session = Depends(deps.get_db),
    current_user: user_model.User = Depends(deps.get_current_active_user)
):
    businesses = business_service.get_businesses_by_owner(
        db=db, owner_id=current_user.id
    )
    return businesses

@router.get("/{business_id}", response_model=business_schema.Business)
def read_business(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
):
    business = business_service.get_business(db=db, business_id=business_id)
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Empresa não encontrada"
        )
    return business