from datetime import (
    datetime,
    timezone,
)

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import require_role
from app.database import get_db

from app.models import (
    Event,
    Reservation,
    ReservationStatus,
    Ticket,
    TicketStatus,
    User,
    UserRole,
)

from app.schemas import (
    SharedTicketResponse,
    TicketEventResponse,
    TicketResponse,
    TicketValidationRequest,
    TicketValidationResponse,
)


router = APIRouter(
    prefix="/tickets",
    tags=["Ingressos"],
)


def build_ticket_response(
    ticket: Ticket,
    reservation: Reservation,
    event: Event,
) -> TicketResponse:
    return TicketResponse(
        id=ticket.id,

        reservation_id=(
            reservation.id
        ),

        ticket_type=(
            ticket.ticket_type
        ),

        price=ticket.price,

        code=ticket.code,

        status=ticket.status,

        validated_at=(
            ticket.validated_at
        ),

        event=TicketEventResponse(
            id=event.id,

            title=event.title,

            event_date=(
                event.event_date
            ),

            location=(
                event.location
            ),

            image_url=(
                event.image_url
            ),
        ),
    )


# =========================================================
# MEUS INGRESSOS
# =========================================================


@router.get(
    "/me",
    response_model=list[TicketResponse],
)
def list_my_tickets(
    db: Session = Depends(get_db),

    client: User = Depends(
        require_role(
            UserRole.CLIENT,
        )
    ),
):
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
            == client.id,

            Reservation.status
            == ReservationStatus.APPROVED,
        )
        .order_by(
            Event.event_date.asc(),
            Ticket.id.asc(),
        )
    ).all()

    return [
        build_ticket_response(
            ticket,
            reservation,
            event,
        )

        for (
            ticket,
            reservation,
            event,
        ) in rows
    ]


# =========================================================
# VALIDAR
# =========================================================


@router.post(
    "/validate",
    response_model=TicketValidationResponse,
)
def validate_ticket(
    payload: TicketValidationRequest,

    db: Session = Depends(get_db),

    gate_user: User = Depends(
        require_role(
            UserRole.GATE,
        )
    ),
):
    code = payload.code.strip()

    prefix = (
        "ingressolivre:ticket:"
    )

    if code.startswith(prefix):
        code = code[
            len(prefix):
        ]

    if not code:
        return TicketValidationResponse(
            result="INVALID",

            message=(
                "Código de ingresso inválido."
            ),
        )

    ticket = db.scalar(
        select(Ticket)
        .where(
            Ticket.code == code,
        )
        .with_for_update()
    )

    if ticket is None:
        return TicketValidationResponse(
            result="INVALID",

            message=(
                "Ingresso não encontrado."
            ),
        )

    reservation = db.get(
        Reservation,
        ticket.reservation_id,
    )

    if reservation is None:
        return TicketValidationResponse(
            result="INVALID",

            message=(
                "Reserva associada "
                "não encontrada."
            ),

            ticket_id=ticket.id,
        )

    if (
        reservation.event_id
        != payload.event_id
    ):
        return TicketValidationResponse(
            result="WRONG_EVENT",

            message=(
                "Este ingresso pertence "
                "a outro evento."
            ),

            ticket_id=ticket.id,

            event_id=(
                reservation.event_id
            ),

            ticket_type=(
                ticket.ticket_type
            ),
        )

    if (
        reservation.status
        != ReservationStatus.APPROVED
    ):
        return TicketValidationResponse(
            result="INVALID",

            message=(
                "A compra associada "
                "não está aprovada."
            ),

            ticket_id=ticket.id,

            event_id=(
                reservation.event_id
            ),

            ticket_type=(
                ticket.ticket_type
            ),
        )

    if (
        ticket.status
        == TicketStatus.CANCELLED
    ):
        return TicketValidationResponse(
            result="CANCELLED",

            message=(
                "Este ingresso foi cancelado."
            ),

            ticket_id=ticket.id,

            event_id=(
                reservation.event_id
            ),

            ticket_type=(
                ticket.ticket_type
            ),
        )

    if (
        ticket.status
        == TicketStatus.USED
    ):
        return TicketValidationResponse(
            result="USED",

            message=(
                "Este ingresso já foi utilizado."
            ),

            ticket_id=ticket.id,

            event_id=(
                reservation.event_id
            ),

            ticket_type=(
                ticket.ticket_type
            ),

            validated_at=(
                ticket.validated_at
            ),
        )

    ticket.status = (
        TicketStatus.USED
    )

    ticket.validated_at = (
        datetime.now(
            timezone.utc,
        )
    )

    ticket.validated_by_id = (
        gate_user.id
    )

    db.commit()
    db.refresh(ticket)

    return TicketValidationResponse(
        result="VALID",

        message="Entrada autorizada.",

        ticket_id=ticket.id,

        event_id=(
            reservation.event_id
        ),

        ticket_type=(
            ticket.ticket_type
        ),

        validated_at=(
            ticket.validated_at
        ),
    )


# =========================================================
# COMPARTILHAR
# =========================================================


@router.get(
    "/share/{code}",
    response_model=SharedTicketResponse,
)
def get_shared_ticket(
    code: str,

    db: Session = Depends(get_db),
):
    ticket = db.scalar(
        select(Ticket)
        .where(
            Ticket.code == code,
        )
    )

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingresso não encontrado.",
        )

    reservation = db.get(
        Reservation,
        ticket.reservation_id,
    )

    if reservation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada.",
        )

    event = db.get(
        Event,
        reservation.event_id,
    )

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado.",
        )

    return SharedTicketResponse(
        id=ticket.id,

        ticket_type=(
            ticket.ticket_type
        ),

        status=ticket.status,

        code=ticket.code,

        event=TicketEventResponse(
            id=event.id,

            title=event.title,

            event_date=(
                event.event_date
            ),

            location=(
                event.location
            ),

            image_url=(
                event.image_url
            ),
        ),
    )


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

    client: User = Depends(
        require_role(
            UserRole.CLIENT,
        )
    ),
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

    if (
        reservation.user_id
        != client.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Este ingresso não pertence "
                "ao usuário autenticado."
            ),
        )

    return build_ticket_response(
        ticket,
        reservation,
        event,
    )