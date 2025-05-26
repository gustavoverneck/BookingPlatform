# app/api/api.py
from fastapi import APIRouter

from .endpoints import users, auth, appointments, businesses, services

# Create api master router
api_router = APIRouter()

# Include users router
api_router.include_router(users.router, tags=["Users"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
api_router.include_router(businesses.router, prefix="/businesses", tags=["Businesses"])
api_router.include_router(services.router, prefix="/services", tags=["Services"])