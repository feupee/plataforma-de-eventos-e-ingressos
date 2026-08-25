from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Event, EventStatus, User, UserRole
from app.schemas import (
    EventCreate,
    EventResponse,
    EventUpdate,
)


router = APIRouter(
    prefix="/events",
    tags=["Eventos"],
)


# =========================================================
# GET /events
# =========================================================


@router.get(
    "",
    response_model=list[EventResponse],
)
def list_events(
    search: str | None = Query(
        default=None,
        description="Pesquisa por título, categoria ou local.",
    ),
    category: str | None = Query(
        default=None,
        description="Filtra pela categoria.",
    ),
    event_status: EventStatus | None = Query(
        default=None,
        alias="status",
        description="Filtra pelo status do evento.",
    ),
    organizer_id: int | None = Query(
        default=None,
        description="Filtra pelo organizador.",
    ),
    db: Session = Depends(get_db),
):
    query = select(Event)

    if search:
        pattern = f"%{search.strip()}%"

        query = query.where(
            or_(
                Event.title.ilike(pattern),
                Event.category.ilike(pattern),
                Event.location.ilike(pattern),
            )
        )

    if category:
        query = query.where(
            Event.category.ilike(category.strip())
        )

    if event_status:
        query = query.where(
            Event.status == event_status
        )

    if organizer_id is not None:
        query = query.where(
            Event.organizer_id == organizer_id
        )

    query = query.order_by(
        Event.event_date.asc()
    )

    events = db.scalars(query).all()

    return list(events)


# =========================================================
# GET /events/{event_id}
# =========================================================


@router.get(
    "/{event_id}",
    response_model=EventResponse,
)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
):
    event = db.get(Event, event_id)

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado.",
        )

    return event


# =========================================================
# POST /events
# =========================================================


@router.post(
    "",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
):
    organizer = db.get(
        User,
        payload.organizer_id,
    )

    if organizer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organizador não encontrado.",
        )

    if organizer.role != UserRole.ORGANIZER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O usuário informado não possui perfil de organizador.",
        )

    event = Event(
        organizer_id=payload.organizer_id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        event_date=payload.event_date,
        location=payload.location,
        full_price=payload.full_price,
        half_price=payload.half_price,
        capacity=payload.capacity,
        image_url=payload.image_url,
        age_rating=payload.age_rating,
        status=payload.status,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


# =========================================================
# PUT /events/{event_id}
# =========================================================


@router.put(
    "/{event_id}",
    response_model=EventResponse,
)
def update_event(
    event_id: int,
    payload: EventUpdate,
    db: Session = Depends(get_db),
):
    event = db.get(Event, event_id)

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado.",
        )

    update_data = payload.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():
        setattr(
            event,
            field,
            value,
        )

    db.commit()
    db.refresh(event)

    return event


# =========================================================
# DELETE /events/{event_id}
# =========================================================


@router.delete(
    "/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
):
    event = db.get(Event, event_id)

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado.",
        )

    db.delete(event)
    db.commit()

    return None