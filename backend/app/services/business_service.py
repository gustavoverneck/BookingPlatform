from sqlalchemy.orm import Session
from typing import List, Optional

from app.models import business as business_model
from app.schemas import business as business_schema

# Create a new business, associating to owner
def create_business(
    db: Session,
    business_in: business_schema.BusinessCreate,
    owner_id: int
) -> business_model.Business:

    db_business = business_model.Business(
        **business_in.model_dump(),
        owner_id=owner_id
    )
    db.add(db_business)
    db.commit()
    db.refresh(db_business)
    return db_business

# Get business from its id
def get_business(
    db: Session,
    business_id: int
) -> Optional[business_model.Business]:

    return db.query(business_model.Business).filter(business_model.Business.id == business_id).first()

# Browse all business of a owner
def get_businesses_by_owner(
    db: Session,
    owner_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[business_model.Business]:

    return (
        db.query(business_model.Business)
        .filter(business_model.Business.owner_id == owner_id)
        .offset(skip)
        .limit(limit)
        .all()
    )