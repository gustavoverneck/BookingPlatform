# app/schemas/appointment.py
import datetime
from pydantic import BaseModel
from typing import Optional
from .user import User 

# Base Schemas
class AppointmentBase(BaseModel):
    title: Optional[str] = None
    start_time: datetime.datetime
    end_time: datetime.datetime

# --- Specific Operations Schemas
class AppointmentCreate(AppointmentBase):
    service_id: int
    start_time: datetime.datetime
    end_time: datetime.datetime

class AppointmentUpdate(AppointmentBase):
    title: Optional[str] = None
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None

# --- API response Schemas
class Appointment(AppointmentBase):
    id: int
    user_id: int
    service_id: int
    
    user: "UserInAppointmentResponse" 
    service: "ServiceInAppointmentResponse"

    class Config:
        from_attributes = True

