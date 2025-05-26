# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean(), default=True)

    appointments = relationship(
        "Appointment",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    businesses = relationship(
        "Business",
        back_populates="owner",
        cascade="all, delete-orphan"
    )