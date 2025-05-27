# app/api/endpoints/appointments.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models import user as user_model
from app.schemas import appointment as appointment_schema
from app.services import appointment_service

router = APIRouter(
    tags=["Appointments"],
)

@router.post("/", response_model=appointment_schema.Appointment, status_code=status.HTTP_201_CREATED)
def create_appointment(
    *,
    db: Session = Depends(deps.get_db),
    appointment_in: appointment_schema.AppointmentCreate,
    current_user: user_model.User = Depends(deps.get_current_active_user)
):
    appointment = appointment_service.create_appointment(
        db=db, appointment_in=appointment_in, user_id=current_user.id
    )
    return appointment

@router.get("/{appointment_id}", response_model=appointment_schema.Appointment)
def read_appointment(
    *,
    db: Session = Depends(deps.get_db),
    appointment_id: int,
    current_user: user_model.User = Depends(deps.get_current_active_user)
):
    appointment = appointment_service.get_appointment(db=db, appointment_id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    
    if appointment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Não tem permissão para acessar este recurso")
        
    return appointment

@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    appointment_id: int,
    current_user: user_model.User = Depends(deps.get_current_active_user)
):

    db_appointment = appointment_service.get_appointment(db=db, appointment_id=appointment_id)

    if not db_appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado",
        )

    if db_appointment.user_id != current_user.id:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não tem permissão para cancelar este agendamento",
        )

    appointment_service.delete_appointment(db=db, appointment_id=appointment_id)

    return

@router.get("/", response_model=List[appointment_schema.Appointment])
def read_appointments(
    *,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: user_model.User = Depends(deps.get_current_active_user)
):
    """
    Retorna uma lista de agendamentos pertencentes ao usuário logado.
    """
    appointments = appointment_service.get_appointments_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return appointments