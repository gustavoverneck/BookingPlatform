# app/schemas/__init__.py
from .appointment import Appointment
from .user import User, UserInResponse
from .business import Business
from .service import Service
from .operating_hour import OperatingHour
from .special_day import SpecialDay
from .service import Service, ServiceInAppointmentResponse
from .user import User, UserInResponse, UserInAppointmentResponse

User.model_rebuild()
UserInResponse.model_rebuild()
UserInAppointmentResponse.model_rebuild()
Appointment.model_rebuild()
Business.model_rebuild() 
Service.model_rebuild()
ServiceInAppointmentResponse.model_rebuild()
OperatingHour.model_rebuild()
SpecialDay.model_rebuild()