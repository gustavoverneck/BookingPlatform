# app/api/endpoints/services.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api import deps
from models import user as user_model
from schemas import service as service_schema
from services import service_service, business_service

router = APIRouter()

# Create a new service to a business
@router.post("/", response_model=service_schema.Service, status_code=status.HTTP_201_CREATED)
def create_service(
    *,
    db: Session = Depends(deps.get_db),
    service_in: service_schema.ServiceCreate,
    business_id: int, # Recebe o ID da empresa como parâmetro de consulta
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