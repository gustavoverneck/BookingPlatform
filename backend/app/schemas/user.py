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
    
class UserCreate(UserBase):
    password: Optional[str] = None


# --- API response Schemas
class User(UserBase):
    id: int
    is_active: bool
    
    appointments: List["Appointment"] = []
    
    business: List["Business"] = []

    # Allow User schema to be created from ORM model
    class Config:
        from_attributes = True

