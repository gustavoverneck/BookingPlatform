# app/services/appointment_service.py

import datetime
import sqlalchemy as sa
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException, status

from app.schemas import appointment as appointment_schema
from app.models import appointment as appointment_model
from app.models import business as business_model
from app.models import service as service_model
from app.models import special_day as special_day_model 
from app.models import operating_hour as operating_hour_model

def create_appointment(
    db: Session,
    appointment_in: appointment_schema.AppointmentCreate,
    user_id: int
) -> appointment_model.Appointment:

    db_service = db.query(service_model.Service).filter(service_model.Service.id == appointment_in.service_id).first()

    if not db_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Serviço com id {appointment_in.service_id} não encontrado."
        )

    
    db_appointment = appointment_model.Appointment(
        title=db_service.name,
        start_time=appointment_in.start_time,
        end_time=appointment_in.end_time,
        user_id=user_id,
        service_id=appointment_in.service_id
    )

    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def get_appointments_by_user(
    db: Session, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 100
) -> List[appointment_model.Appointment]:
    return (
        db.query(appointment_model.Appointment)
        .filter(appointment_model.Appointment.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_appointment(
    db: Session, 
    appointment_id: int
) -> Optional[appointment_model.Appointment]:
    return (
        db.query(appointment_model.Appointment)
        .filter(appointment_model.Appointment.id == appointment_id)
        .first()
    )

def update_appointment(
    db: Session, 
    db_appointment: appointment_model.Appointment, 
    appointment_in: appointment_schema.AppointmentUpdate
) -> appointment_model.Appointment:

    update_data = appointment_in.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_appointment, key, value)

    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def delete_appointment(db: Session, appointment_id: int) -> Optional[appointment_model.Appointment]:
    db_appointment = db.query(appointment_model.Appointment).filter(appointment_model.Appointment.id == appointment_id).first()
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
    return db_appointment

def get_available_slots(
    db: Session, business_id: int, service_id: int, target_date: datetime.date
) -> List[datetime.time]:
    business = db.query(business_model.Business).filter(business_model.Business.id == business_id).first()
    service = db.query(service_model.Service).filter(service_model.Service.id == service_id).first()

    if not business or not service:
        return []

    effective_open_time: Optional[datetime.time] = None
    effective_close_time: Optional[datetime.time] = None
    is_day_explicitly_closed = False

    special_day_override = (
        db.query(special_day_model.SpecialDay)
        .filter(
            special_day_model.SpecialDay.business_id == business_id,
            special_day_model.SpecialDay.date == target_date,
        )
        .first()
    )

    if special_day_override:
        if special_day_override.is_closed:
            is_day_explicitly_closed = True
        else:
            effective_open_time = special_day_override.open_time
            effective_close_time = special_day_override.close_time
    else:
        target_day_of_week = target_date.weekday()
        operating_hour_for_day = (
            db.query(operating_hour_model.OperatingHour)
            .filter(
                operating_hour_model.OperatingHour.business_id == business_id,
                operating_hour_model.OperatingHour.day_of_week == target_day_of_week,
            )
            .first()
        )
        if operating_hour_for_day:
            if operating_hour_for_day.is_closed:
                is_day_explicitly_closed = True
            else:
                effective_open_time = operating_hour_for_day.open_time
                effective_close_time = operating_hour_for_day.close_time
        else:
            is_day_explicitly_closed = True

    if is_day_explicitly_closed or not effective_open_time or not effective_close_time:
        return []

    potential_slots_start_times = []
    current_slot_start_dt = datetime.datetime.combine(target_date, effective_open_time)
    business_day_close_dt = datetime.datetime.combine(target_date, effective_close_time)
    service_duration_td = datetime.timedelta(minutes=service.duration_minutes)

    while True:
        potential_slot_end_dt = current_slot_start_dt + service_duration_td
        if potential_slot_end_dt > business_day_close_dt:
            break
        potential_slots_start_times.append(current_slot_start_dt.time())
        current_slot_start_dt += service_duration_td

    existing_appointments = db.query(appointment_model.Appointment).filter(
        appointment_model.Appointment.service_id == service_id,
        sa.func.date(appointment_model.Appointment.start_time) == target_date
    ).all()

    truly_available_slots = []
    for slot_time in potential_slots_start_times:
        is_slot_free = True
        current_potential_start_dt = datetime.datetime.combine(target_date, slot_time)
        current_potential_end_dt = current_potential_start_dt + service_duration_td

        for appt in existing_appointments:
            appt_start_dt = appt.start_time
            appt_end_dt = appt.end_time

            if current_potential_start_dt < appt_end_dt and current_potential_end_dt > appt_start_dt:
                is_slot_free = False
                break 

        if is_slot_free:
            truly_available_slots.append(slot_time)

    return truly_available_slots
