# app/schemas/__init__.py
from .appointment import Appointment
from .user import User

User.model_rebuild()
Appointment.model_rebuild()