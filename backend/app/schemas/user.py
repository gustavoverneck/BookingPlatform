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

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class UserInResponse(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class UserInAppointmentResponse(UserBase): 
    id: int
    is_active: bool
    # NÃO incluir 'appointments' ou 'businesses' aqui

    class Config:
        from_attributes = True

# --- API response Schemas
class User(UserBase):
    id: int
    is_active: bool
    
    appointments: List["Appointment"] = []
    businesses: List["Business"] = []

    # Allow User schema to be created from ORM model
    class Config:
        from_attributes = True

