# app/api/endpoints/services.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models import user as user_model
from app.schemas import service as service_schema
from app.services import service_service, business_service

router = APIRouter()

# Create a new service to a business
@router.post("/", response_model=service_schema.Service, status_code=status.HTTP_201_CREATED)
def create_service(
    *,
    db: Session = Depends(deps.get_db),
    service_in: service_schema.ServiceCreate,
    business_id: int,
    current_user: user_model.User = Depends(deps.get_current_active_user)
):
    business = business_service.get_business(db=db, business_id=business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    if business.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Não tem permissão para adicionar um serviço a esta empresa")

    service = service_service.create_service_for_business(
        db=db, service_in=service_in, business_id=business_id
    )
    return service


# Return a list of all services of a specific company
@router.get("/", response_model=List[service_schema.Service])
def list_services_for_business(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
):
    services = service_service.get_services_by_business(db=db, business_id=business_id)
    return services


# Delete a service
@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_single_service(
    *,
    db: Session = Depends(deps.get_db),
    service_id: int,
    current_user: user_model.User = Depends(deps.get_current_active_user)
):
    db_service = service_service.get_service(db=db, service_id=service_id)
    if not db_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serviço não encontrado")

    if db_service.business.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Não tem permissão para deletar este serviço")

    service_service.delete_service(db=db, service_id=service_id)
    return


# Update a single service
@router.put("/{service_id}", response_model=service_schema.Service)
def update_single_service(
    *,
    db: Session = Depends(deps.get_db),
    service_id: int,
    service_in: service_schema.ServiceUpdate,
    current_user: user_model.User = Depends(deps.get_current_active_user)
):

    db_service = service_service.get_service(db=db, service_id=service_id)
    if not db_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serviço não encontrado")

    if db_service.business.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Não tem permissão para editar este serviço")

    updated_service = service_service.update_service(db=db, db_service=db_service, service_in=service_in)
    return updated_service