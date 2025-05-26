# app/api/api.py
from fastapi import APIRouter

from api.endpoints import users, auth

# Create api master router
api_router = APIRouter()

# Include users router
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])