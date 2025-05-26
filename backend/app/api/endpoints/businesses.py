# app/api/endpoints/businesses.py

import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models import user as user_model
from app.schemas import business as business_schema
from app.services import business_service, appointment_service

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

@router.get("/{business_id}/availability", response_model=List[datetime.time])
def get_business_availability(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    service_id: int,
    target_date: datetime.date
):

    if not service_id or not target_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="service_id e target_date são obrigatórios."
        )

    slots = appointment_service.get_available_slots(
        db=db,
        business_id=business_id,
        service_id=service_id,
        target_date=target_date
    )
    return slots