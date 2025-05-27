# app/schemas/operating_hour.py

from pydantic import BaseModel, conint
from typing import Optional
import datetime

class OperatingHourBase(BaseModel):
    day_of_week: conint(ge=0, le=6) 
    open_time: Optional[datetime.time] = None
    close_time: Optional[datetime.time] = None
    is_closed: bool = False

class OperatingHourCreate(OperatingHourBase):
    pass

class OperatingHourUpdate(BaseModel):
    open_time: Optional[datetime.time] = None
    close_time: Optional[datetime.time] = None
    is_closed: Optional[bool] = None

class OperatingHour(OperatingHourBase):
    id: int
    business_id: int

    class Config:
        from_attributes = True