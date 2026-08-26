from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from sqlalchemy import (
    or_,
    select,
)

from sqlalchemy.orm import Session

from app.auth import require_role
from app.database import get_db

from app.models import (
    Event,
    EventStatus,
    User,
    UserRole,
)

from app.schemas import (
    EventCreate,
    EventResponse,
    EventUpdate,
)


router = APIRouter(
    prefix="/events",
    tags=["Eventos"],
)


@router.get(
    "",
    response_model=list[EventResponse],
)
def list_events(
    search: str | None = Query(
        default=None,
    ),

    category: str | None = Query(
        default=None,
    ),

    status_filter: EventStatus
    | None = Query(
        default=None,
        alias="status",
    ),

    organizer_id: int | None = Query(
        default=None,
    ),

    db: Session = Depends(get_db),
):
    query = select(Event)

    if search:
        pattern = f"%{search}%"

        query = query.where(
            or_(
                Event.title.ilike(
                    pattern,
                ),

                Event.category.ilike(
                    pattern,
                ),

                Event.location.ilike(
                    pattern,
                ),
            )
        )

    if category:
        query = query.where(
            Event.category == category,
        )

    if status_filter:
        query = query.where(
            Event.status
            == status_filter,
        )

    if organizer_id is not None:
        query = query.where(
            Event.organizer_id
            == organizer_id,
        )

    query = query.order_by(
        Event.event_date.asc(),
    )

    return list(
        db.scalars(query).all()
    )


# IMPORTANTE: precisa ficar antes de /{event_id}
@router.get(
    "/mine",
    response_model=list[EventResponse],
)
def list_my_events(
    db: Session = Depends(get_db),

    organizer: User = Depends(
        require_role(
            UserRole.ORGANIZER,
        )
    ),
):
    events = db.scalars(
        select(Event)
        .where(
            Event.organizer_id
            == organizer.id,
        )
        .order_by(
            Event.event_date.asc(),
        )
    ).all()

    return list(events)


@router.get(
    "/{event_id}",
    response_model=EventResponse,
)
def get_event(
    event_id: int,

    db: Session = Depends(get_db),
):
    event = db.get(
        Event,
        event_id,
    )

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado.",
        )

    return event


@router.post(
    "",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_event(
    payload: EventCreate,

    db: Session = Depends(get_db),

    organizer: User = Depends(
        require_role(
            UserRole.ORGANIZER,
        )
    ),
):
    event = Event(
        **payload.model_dump(),

        organizer_id=organizer.id,
    )

    db.add(event)

    db.commit()
    db.refresh(event)

    return event


@router.put(
    "/{event_id}",
    response_model=EventResponse,
)
def update_event(
    event_id: int,

    payload: EventUpdate,

    db: Session = Depends(get_db),

    organizer: User = Depends(
        require_role(
            UserRole.ORGANIZER,
        )
    ),
):
    event = db.get(
        Event,
        event_id,
    )

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado.",
        )

    if (
        event.organizer_id
        != organizer.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Você não pode alterar "
                "eventos de outro organizador."
            ),
        )

    data = payload.model_dump(
        exclude_unset=True,
    )

    for field, value in data.items():
        setattr(
            event,
            field,
            value,
        )

    db.commit()
    db.refresh(event)

    return event


@router.delete(
    "/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_event(
    event_id: int,

    db: Session = Depends(get_db),

    organizer: User = Depends(
        require_role(
            UserRole.ORGANIZER,
        )
    ),
):
    event = db.get(
        Event,
        event_id,
    )

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado.",
        )

    if (
        event.organizer_id
        != organizer.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Você não pode excluir "
                "eventos de outro organizador."
            ),
        )

    db.delete(event)
    db.commit()