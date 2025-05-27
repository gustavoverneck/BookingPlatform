# app/schemas/business.py

from pydantic import BaseModel
from typing import Optional, List
import datetime

# Base Schema
class BusinessBase(BaseModel):
    name: str
    description: Optional[str] = None

# New Business Schema
class BusinessCreate(BusinessBase):
    pass

# Business update Schema
class BusinessUpdate(BusinessBase):
    name: Optional[str] = None
    description: Optional[str] = None

# API response Schema
class Business(BusinessBase):
    id: int
    owner_id: int
    owner: "UserInResponse"
    services: List["Service"] = []

    weekly_schedule: List["OperatingHour"] = []
    special_days: List["SpecialDay"] = []

    class Config:
        from_attributes = True