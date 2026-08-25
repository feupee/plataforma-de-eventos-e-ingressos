from datetime import datetime, timezone

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
# VALIDAR INGRESSO
# =========================================================


@router.post(
    "/validate",
    response_model=TicketValidationResponse,
)
def validate_ticket(
    payload: TicketValidationRequest,
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # VALIDAR USUÁRIO DA PORTARIA
    # -----------------------------------------------------

    gate_user = db.get(
        User,
        payload.gate_user_id,
    )

    if gate_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário da portaria não encontrado.",
        )

    if gate_user.role != UserRole.GATE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "O usuário informado não possui "
                "perfil de portaria."
            ),
        )

    # -----------------------------------------------------
    # REMOVER PREFIXO DO QR
    # -----------------------------------------------------

    code = payload.code.strip()

    prefix = "ingressolivre:ticket:"

    if code.startswith(prefix):
        code = code[len(prefix):]

    if not code:
        return TicketValidationResponse(
            result="INVALID",
            message="Código de ingresso inválido.",
        )

    # -----------------------------------------------------
    # LOCK DO TICKET
    #
    # Se duas portarias tentarem validar o mesmo ingresso,
    # apenas uma consegue processar primeiro.
    # -----------------------------------------------------

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
            message="Ingresso não encontrado.",
        )

    reservation = db.get(
        Reservation,
        ticket.reservation_id,
    )

    if reservation is None:
        return TicketValidationResponse(
            result="INVALID",
            message=(
                "Reserva associada ao ingresso "
                "não foi encontrada."
            ),
            ticket_id=ticket.id,
        )

    # -----------------------------------------------------
    # EVENTO DO INGRESSO
    # -----------------------------------------------------

    if reservation.event_id != payload.event_id:
        return TicketValidationResponse(
            result="WRONG_EVENT",
            message=(
                "Este ingresso pertence a outro evento."
            ),
            ticket_id=ticket.id,
            event_id=reservation.event_id,
            ticket_type=ticket.ticket_type,
        )

    # -----------------------------------------------------
    # RESERVA PRECISA ESTAR APROVADA
    # -----------------------------------------------------

    if (
        reservation.status
        != ReservationStatus.APPROVED
    ):
        return TicketValidationResponse(
            result="INVALID",
            message=(
                "A compra associada a este ingresso "
                "não está aprovada."
            ),
            ticket_id=ticket.id,
            event_id=reservation.event_id,
            ticket_type=ticket.ticket_type,
        )

    # -----------------------------------------------------
    # INGRESSO CANCELADO
    # -----------------------------------------------------

    if ticket.status == TicketStatus.CANCELLED:
        return TicketValidationResponse(
            result="CANCELLED",
            message="Este ingresso foi cancelado.",
            ticket_id=ticket.id,
            event_id=reservation.event_id,
            ticket_type=ticket.ticket_type,
        )

    # -----------------------------------------------------
    # JÁ UTILIZADO
    # -----------------------------------------------------

    if ticket.status == TicketStatus.USED:
        return TicketValidationResponse(
            result="USED",
            message="Este ingresso já foi utilizado.",
            ticket_id=ticket.id,
            event_id=reservation.event_id,
            ticket_type=ticket.ticket_type,
            validated_at=ticket.validated_at,
        )

    # -----------------------------------------------------
    # VALIDAR
    # -----------------------------------------------------

    validation_time = datetime.now(
        timezone.utc
    )

    ticket.status = TicketStatus.USED
    ticket.validated_at = validation_time
    ticket.validated_by_id = gate_user.id

    db.commit()
    db.refresh(ticket)

    return TicketValidationResponse(
        result="VALID",
        message="Entrada autorizada.",
        ticket_id=ticket.id,
        event_id=reservation.event_id,
        ticket_type=ticket.ticket_type,
        validated_at=ticket.validated_at,
    )


# =========================================================
# INGRESSO INDIVIDUAL
# =========================================================

# =========================================================
# INGRESSO COMPARTILHADO
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
        select(Ticket).where(
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
        ticket_type=ticket.ticket_type,
        status=ticket.status,
        code=ticket.code,
        event=TicketEventResponse(
            id=event.id,
            title=event.title,
            event_date=event.event_date,
            location=event.location,
            image_url=event.image_url,
        ),
    )


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