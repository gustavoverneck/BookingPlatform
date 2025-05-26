# app/schemas/user.py

from pydantic import BaseModel, EmailStr
from typing import Optional, List


# Base Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

# --- Specific Operations Schemas
class UserCreate(UserBase):
    password: str


# --- API response Schemas
class User(UserBase):
    id: int
    is_active: bool
    
    appointments: List["Appointment"] = []
    
    businesses: List["Business"] = []

    # Allow User schema to be created from ORM model
    class Config:
        from_attributes = True

