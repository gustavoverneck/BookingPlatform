# app/services/user_service.py
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.models import user as user_model
from app.schemas import user as user_schema

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hashes raw passwords
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Check if raw password correspond to hashed
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Returns User from email and None if not found
def get_user_by_email(db: Session, email: str) -> user_model.User | None:
    return db.query(user_model.User).filter(user_model.User.email == email).first()

# Create a new user in db with hashed password
def create_user(db: Session, user: user_schema.UserCreate) -> user_model.User:
    hashed_password = get_password_hash(user.password)

    # Create SQLAlchemy object
    db_user = user_model.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )

    # Add new user to db session
    db.add(db_user)
    # Confirm, saving db
    db.commit()
    # Update db_user with new data
    db.refresh(db_user)

    return db_user