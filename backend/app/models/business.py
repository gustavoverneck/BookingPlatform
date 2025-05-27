# app/models/business.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Time
from sqlalchemy.orm import relationship

from app.db.session import Base

class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    description = Column(Text, nullable=True)

    # Foreign key to connect business to owner user
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="businesses")
    
    services = relationship(
        "Service",
        back_populates="business",
        cascade="all, delete-orphan"
    )
    
    weekly_schedule = relationship(
        "OperatingHour", 
        back_populates="business", 
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    special_days = relationship(
        "SpecialDay", 
        back_populates="business", 
        cascade="all, delete-orphan",
        lazy="selectin"
    )