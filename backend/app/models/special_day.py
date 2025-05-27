# app/models/special_day.py
from sqlalchemy import Column, Integer, Date, Time, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class SpecialDay(Base):
    __tablename__ = "special_days"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    is_closed = Column(Boolean, nullable=False)

    open_time = Column(Time, nullable=True)
    close_time = Column(Time, nullable=True)

    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    business = relationship("Business", back_populates="special_days")