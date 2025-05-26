# app/schemas/appointment.py
import datetime
from pydantic import BaseModel
from typing import Optional
from .user import User 

# Base Schemas
class AppointmentBase(BaseModel):
    title: str
    start_time: datetime.datetime
    end_time: datetime.datetime

# --- Specific Operations Schemas
class AppointmentCreate(AppointmentBase):
    service_id: int 

class AppointmentUpdate(AppointmentBase):
    title: Optional[str] = None
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None

# --- API response Schemas
class Appointment(AppointmentBase):
    id: int
    user: "User"
    service_id: int
    service: "Service"

    class Config:
        from_attributes = True

