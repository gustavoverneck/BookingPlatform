# app/schemas/special_day.py

from pydantic import BaseModel
from typing import Optional
import datetime

class SpecialDayBase(BaseModel):
    date: datetime.date
    is_closed: bool
    open_time: Optional[datetime.time] = None
    close_time: Optional[datetime.time] = None

class SpecialDayCreate(SpecialDayBase):
    pass

class SpecialDayUpdate(BaseModel):
    is_closed: Optional[bool] = None
    open_time: Optional[datetime.time] = None
    close_time: Optional[datetime.time] = None

class SpecialDay(SpecialDayBase):
    id: int
    business_id: int

    class Config:
        from_attributes = True