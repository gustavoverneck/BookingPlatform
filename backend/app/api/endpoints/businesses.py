# app/api/endpoints/businesses.py

import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models import user as user_model
from app.schemas import business as business_schema
from app.services import business_service, appointment_service
from app.schemas import operating_hour as operating_hour_schema
from app.schemas import special_day as special_day_schema
from app.services import schedule_service

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
    date: datetime.date
):
    if not service_id or not date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="service_id e target_date são obrigatórios."
        )

    slots = appointment_service.get_available_slots(
        db=db,
        business_id=business_id,
        service_id=service_id,
        target_date=date
    )
    return slots

@router.get(
    "/{business_id}/schedule/weekly",
    response_model=List[operating_hour_schema.OperatingHour],
    tags=["Businesses - Schedule Management"]
)
def read_business_weekly_schedule(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
):
    db_business = business_service.get_business(db, business_id=business_id)
    if not db_business:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    return schedule_service.get_weekly_schedule_for_business(db=db, business_id=business_id)

@router.put(
    "/{business_id}/schedule/weekly",
    response_model=List[operating_hour_schema.OperatingHour],
    tags=["Businesses - Schedule Management"]
)
def set_business_weekly_schedule(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    schedule_in: List[operating_hour_schema.OperatingHourCreate],
    current_user: user_model.User = Depends(deps.get_current_active_user)
):
    db_business = business_service.get_business(db, business_id=business_id)
    if not db_business:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    if db_business.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Não tem permissão para modificar este horário")

    return schedule_service.set_weekly_schedule_for_business(
        db=db, business_id=business_id, schedule_in=schedule_in
    )

@router.get(
    "/{business_id}/schedule/special-days",
    response_model=List[special_day_schema.SpecialDay],
    tags=["Businesses - Schedule Management"]
)
def read_business_special_days(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
):
    db_business = business_service.get_business(db, business_id=business_id)
    if not db_business:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    return schedule_service.get_special_days_for_business(
        db=db, business_id=business_id, start_date=start_date, end_date=end_date
    )

@router.post(
    "/{business_id}/schedule/special-days",
    response_model=special_day_schema.SpecialDay,
    status_code=status.HTTP_201_CREATED,
    tags=["Businesses - Schedule Management"]
)
def create_or_update_business_special_day(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    special_day_in: special_day_schema.SpecialDayCreate,
    current_user: user_model.User = Depends(deps.get_current_active_user)
):
    db_business = business_service.get_business(db, business_id=business_id)
    if not db_business:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    if db_business.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Não tem permissão para modificar este horário")

    return schedule_service.create_or_update_special_day(
        db=db, business_id=business_id, special_day_in=special_day_in
    )

@router.delete(
    "/{business_id}/schedule/special-days/{special_date_str}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Businesses - Schedule Management"]
)
def delete_business_special_day(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    special_date_str: str,
    current_user: user_model.User = Depends(deps.get_current_active_user)
):
    db_business = business_service.get_business(db, business_id=business_id)
    if not db_business:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    if db_business.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Não tem permissão para modificar este horário")

    try:
        special_date = datetime.date.fromisoformat(special_date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data inválido. Use YYYY-MM-DD.")

    deleted_special_day = schedule_service.delete_special_day(
        db=db, business_id=business_id, special_day_date=special_date
    )
    if not deleted_special_day:
        raise HTTPException(status_code=404, detail="Regra de dia especial não encontrada para esta data")

    return
