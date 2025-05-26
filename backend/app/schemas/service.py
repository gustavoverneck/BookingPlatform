# app/schemas/service.py

from pydantic import BaseModel
from typing import Optional, List

# Base Schema
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration_minutes: int
    price: float

# Creation Schema
class ServiceCreate(ServiceBase):
    pass

# Update Schema
class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    price: Optional[float] = None

# API response Schema
class Service(ServiceBase):
    id: int
    business_id: int
    
    appointments: List["Appointment"] = []

    class Config:
        from_attributes = True