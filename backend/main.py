# main.py

from app.api.api import api_router
from app.core.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create all db tables that inherit from Base
#Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"/api/openapi.json"
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitindo todas as origens por enquanto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
