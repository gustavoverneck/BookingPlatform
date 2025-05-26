# app/models/appointment.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from db.session import Base

class Appointment(Base):
    __table__name = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), index=True, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    
    # Foreign key to associate to an user
    user_id = Column(Integer, ForeignKey("users_id"), nullable=False)
    
    user = relationship("User", back_populates="appointments")