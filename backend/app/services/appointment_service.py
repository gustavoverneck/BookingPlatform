# app/services/appointment_service.py

from sqlalchemy.orm import Session
from typing import List, Optional

from models import appointment as appointment_model
from schemas import appointment as appointment_schema

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