# main.py

from api.api import api_router
from core.config import settings
from db import session
from db.session import Base, engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create all db tables that inherit from Base
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"/api/v1/openapi.json" # URL da documentação
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitindo todas as origens por enquanto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
