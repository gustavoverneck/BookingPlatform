# app/api/deps.py
from typing import Generator, Optional
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

from app.core.config import settings
from app.db.session import SessionLocal
from app.models import user as user_model
from app.services import user_service


reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"/api/auth/login"
)

class TokenPayload(BaseModel):
    sub: Optional[str] = None

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> user_model.User:

    try:
        # 1. Tenta decodificar o token usando nossa chave secreta
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        # 2. Cria um schema a partir do payload para validação
        token_data = TokenPayload(**payload)
    except JWTError:
        # Se o token for inválido (assinatura errada, expirado, etc.), levanta um erro
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não foi possível validar as credenciais",
        )

    user = user_service.get_user_by_email(db, email=token_data.sub)

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    return user

def get_current_active_user(
    current_user: user_model.User = Depends(get_current_user)
) -> user_model.User:
    
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Usuário inativo")
    return current_user