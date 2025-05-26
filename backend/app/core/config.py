# app/core/config.py
from pydantic_settings import BaseSettings
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Plataforma de Agendamentos"
    PROJECT_DESCRIPTION: str = "Uma API para Plataforma de Agendamentos"
    DATABASE_URL: str
    
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = BASE_DIR / ".env"
        env_file_encoding = 'utf-8'

settings = Settings()