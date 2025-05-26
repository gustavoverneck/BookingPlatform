# app/schemas/__init__.py
from .appointment import Appointment
from .user import User
from .business import Business
from .service import Service

User.model_rebuild()
Appointment.model_rebuild()
Business.model_rebuild()
Service.model_rebuild()