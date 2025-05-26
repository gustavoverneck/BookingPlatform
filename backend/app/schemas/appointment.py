# app/schemas/appointment.py
import datetime
from pydantic import BaseModel
from typing import Optional


# Base Schemas
class AppointmentBase(BaseModel):
    title: str
    start_time: datetime.datetime
    end_time: datetime.datetime

# --- Specific Operations Schemas
class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(AppointmentBase):
    title: Optional[str] = None
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None

# --- API response Schemas
class Appointment(AppointmentBase):
    id: int
    user: "User"

    class Config:
        from_attributes = True

