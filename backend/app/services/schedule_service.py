# app/services/schedule_service.py

from sqlalchemy.orm import Session
from typing import List, Optional
import datetime

from app.models import business as business_model
from app.models import operating_hour as operating_hour_model
from app.models import special_day as special_day_model
from app.schemas import operating_hour as operating_hour_schema
from app.schemas import special_day as special_day_schema


def get_weekly_schedule_for_business(
    db: Session, business_id: int
) -> List[operating_hour_model.OperatingHour]:
    return (
        db.query(operating_hour_model.OperatingHour)
        .filter(operating_hour_model.OperatingHour.business_id == business_id)
        .order_by(operating_hour_model.OperatingHour.day_of_week)
        .all()
    )

def set_weekly_schedule_for_business(
    db: Session,
    business_id: int,
    schedule_in: List[operating_hour_schema.OperatingHourCreate],
) -> List[operating_hour_model.OperatingHour]:
    db_business = db.query(business_model.Business).filter(business_model.Business.id == business_id).first()
    if not db_business:
        return [] 

    db.query(operating_hour_model.OperatingHour).filter(
        operating_hour_model.OperatingHour.business_id == business_id
    ).delete(synchronize_session=False)

    new_schedule = []
    for hour_data in schedule_in:
        if hour_data.is_closed and (hour_data.open_time or hour_data.close_time):
            pass

        db_operating_hour = operating_hour_model.OperatingHour(
            **hour_data.model_dump(), business_id=business_id
        )
        db.add(db_operating_hour)
        new_schedule.append(db_operating_hour)

    db.commit()
    for item in new_schedule:
        db.refresh(item)

    return new_schedule


def get_special_days_for_business(
    db: Session,
    business_id: int,
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
) -> List[special_day_model.SpecialDay]:
    query = db.query(special_day_model.SpecialDay).filter(
        special_day_model.SpecialDay.business_id == business_id
    )
    if start_date:
        query = query.filter(special_day_model.SpecialDay.date >= start_date)
    if end_date:
        query = query.filter(special_day_model.SpecialDay.date <= end_date)

    return query.order_by(special_day_model.SpecialDay.date).all()


def create_or_update_special_day(
    db: Session,
    business_id: int,
    special_day_in: special_day_schema.SpecialDayCreate,
) -> special_day_model.SpecialDay:
    db_business = db.query(business_model.Business).filter(business_model.Business.id == business_id).first()
    if not db_business:
        return None

    db_special_day = (
        db.query(special_day_model.SpecialDay)
        .filter(
            special_day_model.SpecialDay.business_id == business_id,
            special_day_model.SpecialDay.date == special_day_in.date,
        )
        .first()
    )

    if db_special_day:
        update_data = special_day_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_special_day, key, value)
    else:
        db_special_day = special_day_model.SpecialDay(
            **special_day_in.model_dump(), business_id=business_id
        )
        db.add(db_special_day)

    db.commit()
    db.refresh(db_special_day)
    return db_special_day


def delete_special_day(
    db: Session, business_id: int, special_day_date: datetime.date
) -> Optional[special_day_model.SpecialDay]:
    db_special_day = (
        db.query(special_day_model.SpecialDay)
        .filter(
            special_day_model.SpecialDay.business_id == business_id,
            special_day_model.SpecialDay.date == special_day_date,
        )
        .first()
    )
    if db_special_day:
        db.delete(db_special_day)
        db.commit()
        return db_special_day
    return None
