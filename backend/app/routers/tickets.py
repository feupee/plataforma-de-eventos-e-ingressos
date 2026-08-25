from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db

from app.models import (
    Event,
    Reservation,
    ReservationStatus,
    Ticket,
    User,
)

from app.schemas import (
    TicketEventResponse,
    TicketResponse,
)


router = APIRouter(
    prefix="/tickets",
    tags=["Ingressos"],
)


# =========================================================
# INGRESSOS DE UM CLIENTE
# =========================================================


@router.get(
    "/user/{user_id}",
    response_model=list[TicketResponse],
)
def list_user_tickets(
    user_id: int,
    db: Session = Depends(get_db),
):
    user = db.get(
        User,
        user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )

    rows = db.execute(
        select(
            Ticket,
            Reservation,
            Event,
        )
        .join(
            Reservation,
            Ticket.reservation_id
            == Reservation.id,
        )
        .join(
            Event,
            Reservation.event_id
            == Event.id,
        )
        .where(
            Reservation.user_id
            == user_id,
            Reservation.status
            == ReservationStatus.APPROVED,
        )
        .order_by(
            Event.event_date.asc(),
            Ticket.id.asc(),
        )
    ).all()

    tickets: list[TicketResponse] = []

    for ticket, reservation, event in rows:
        tickets.append(
            TicketResponse(
                id=ticket.id,
                reservation_id=reservation.id,
                ticket_type=ticket.ticket_type,
                price=ticket.price,
                code=ticket.code,
                status=ticket.status,
                validated_at=ticket.validated_at,
                event=TicketEventResponse(
                    id=event.id,
                    title=event.title,
                    event_date=event.event_date,
                    location=event.location,
                    image_url=event.image_url,
                ),
            )
        )

    return tickets


# =========================================================
# INGRESSO INDIVIDUAL
# =========================================================


@router.get(
    "/{ticket_id}",
    response_model=TicketResponse,
)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
):
    row = db.execute(
        select(
            Ticket,
            Reservation,
            Event,
        )
        .join(
            Reservation,
            Ticket.reservation_id
            == Reservation.id,
        )
        .join(
            Event,
            Reservation.event_id
            == Event.id,
        )
        .where(
            Ticket.id == ticket_id,
        )
    ).first()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingresso não encontrado.",
        )

    ticket, reservation, event = row

    return TicketResponse(
        id=ticket.id,
        reservation_id=reservation.id,
        ticket_type=ticket.ticket_type,
        price=ticket.price,
        code=ticket.code,
        status=ticket.status,
        validated_at=ticket.validated_at,
        event=TicketEventResponse(
            id=event.id,
            title=event.title,
            event_date=event.event_date,
            location=event.location,
            image_url=event.image_url,
        ),
    )