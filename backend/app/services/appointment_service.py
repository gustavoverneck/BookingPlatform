# app/services/appointment_service.py

import datetime
import sqlalchemy as sa
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas import appointment as appointment_schema
from app.models import appointment as appointment_model
from app.models import business as business_model
from app.models import service as service_model

def create_appointment(
    db: Session, 
    appointment: appointment_schema.AppointmentCreate, 
    user_id: int
    ) -> appointment_model.Appointment:
    
    # Create new SQLAlchemy object using schema and user_id data
    db_appointment = appointment_model.Appointment(
        **appointment.model_dump(),
        user_id=user_id
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

# List appointments for a specific user
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

# Get appointment by id
def get_appointment(
    db: Session, 
    appointment_id: int
) -> Optional[appointment_model.Appointment]:
    return (
        db.query(appointment_model.Appointment)
        .filter(appointment_model.Appointment.id == appointment_id)
        .first()
    )
# Update an existing appointment in db
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

# Delete appointment in db
def delete_appointment(db: Session, appointment_id: int) -> Optional[appointment_model.Appointment]:
    db_appointment = self.get(db, appointment_id=appointment_id)
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
    return db_appointment

# Get available appointment slots
def get_available_slots(
    db: Session, business_id: int, service_id: int, target_date: datetime.date
) -> List[datetime.time]:

    business = db.query(business_model.Business).filter(business_model.Business.id == business_id).first()
    service = db.query(service_model.Service).filter(service_model.Service.id == service_id).first()

    if not business or not service:
        return []
    if not business.opens_at or not business.closes_at:
        return []

    potential_slots_start_times = []
    current_slot_start_dt = datetime.datetime.combine(target_date, business.opens_at)
    business_close_dt = datetime.datetime.combine(target_date, business.closes_at)
    service_duration_td = datetime.timedelta(minutes=service.duration_minutes)

    while True:
        potential_slot_end_dt = current_slot_start_dt + service_duration_td
        
        if potential_slot_end_dt > business_close_dt:
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