# app/api/api.py
from fastapi import APIRouter

from api.endpoints import users, auth
from api.endpoints import users, auth, appointments

# Create api master router
api_router = APIRouter()

# Include users router
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])