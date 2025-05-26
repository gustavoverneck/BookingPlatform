# app/schemas/business.py

from pydantic import BaseModel
from typing import Optional, List
import datetime

# Base Schema
class BusinessBase(BaseModel):
    name: str
    description: Optional[str] = None
    opens_at: Optional[datetime.time] = None
    closes_at: Optional[datetime.time] = None

# New Business Schema
class BusinessCreate(BusinessBase):
    pass

# Business update Schema
class BusinessUpdate(BusinessBase):
    name: Optional[str] = None
    description: Optional[str] = None
    opens_at: Optional[datetime.time] = None
    closes_at: Optional[datetime.time] = None


# API response Schema
class Business(BusinessBase):
    id: int
    owner_id: int
    owner: "User"
    services: List["Service"] = []

    class Config:
        from_attributes = True