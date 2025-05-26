# app/services/service_service.py
from sqlalchemy.orm import Session
from typing import List, Optional

from app.models import service as service_model
from app.schemas import service as service_schema

# Create a service for a business
def create_service_for_business(
    db: Session,
    service_in: service_schema.ServiceCreate,
    business_id: int
) -> service_model.Service:

    db_service = service_model.Service(
        **service_in.model_dump(),
        business_id=business_id
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

# Get service from its id
def get_service(
    db: Session,
    service_id: int
) -> Optional[service_model.Service]:

    return db.query(service_model.Service).filter(service_model.Service.id == service_id).first()

# Get services of a specific business
def get_services_by_business(
    db: Session,
    business_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[service_model.Service]:

    return (
        db.query(service_model.Service)
        .filter(service_model.Service.business_id == business_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

# Update an existing business
def update_service(
    db: Session,
    db_service: service_model.Service,
    service_in: service_schema.ServiceUpdate
) -> service_model.Service:

    update_data = service_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_service, key, value)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

# Delete a service from db
def delete_service(db: Session, service_id: int) -> Optional[service_model.Service]:
    db_service = db.query(service_model.Service).filter(service_model.Service.id == service_id).first()
    if db_service:
        db.delete(db_service)
        db.commit()
    return db_service