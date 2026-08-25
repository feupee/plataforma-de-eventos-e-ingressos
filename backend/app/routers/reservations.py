from datetime import datetime, timedelta, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy import (
    and_,
    func,
    or_,
    select,
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Event,
    EventStatus,
    Reservation,
    ReservationStatus,
    User,
    UserRole,
)
from app.schemas import (
    EventAvailabilityResponse,
    ReservationCreate,
    ReservationResponse,
)


router = APIRouter(
    prefix="/reservations",
    tags=["Reservas"],
)


RESERVATION_HOLD_MINUTES = 15


def get_active_reserved_quantity(
    db: Session,
    event_id: int,
) -> int:
    cutoff = (
        datetime.now(timezone.utc)
        - timedelta(
            minutes=RESERVATION_HOLD_MINUTES,
        )
    )

    quantity = db.scalar(
        select(
            func.coalesce(
                func.sum(
                    Reservation.full_quantity
                    + Reservation.half_quantity
                ),
                0,
            )
        ).where(
            Reservation.event_id == event_id,
            or_(
                Reservation.status
                == ReservationStatus.APPROVED,

                and_(
                    Reservation.status
                    == ReservationStatus.PENDING,

                    Reservation.created_at
                    >= cutoff,
                ),
            ),
        )
    )

    return int(quantity or 0)


# =========================================================
# DISPONIBILIDADE
# =========================================================


@router.get(
    "/events/{event_id}/availability",
    response_model=EventAvailabilityResponse,
)
def get_event_availability(
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

    reserved = get_active_reserved_quantity(
        db,
        event_id,
    )

    available = max(
        event.capacity - reserved,
        0,
    )

    return EventAvailabilityResponse(
        event_id=event.id,
        capacity=event.capacity,
        reserved=reserved,
        available=available,
    )


# =========================================================
# CRIAR RESERVA
# =========================================================


@router.post(
    "",
    response_model=ReservationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_reservation(
    payload: ReservationCreate,
    db: Session = Depends(get_db),
):
    requested_quantity = (
        payload.full_quantity
        + payload.half_quantity
    )

    if requested_quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Selecione pelo menos um ingresso."
            ),
        )

    user = db.get(
        User,
        payload.user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado.",
        )

    if user.role != UserRole.CLIENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "O usuário informado não possui "
                "perfil de cliente."
            ),
        )

    # -----------------------------------------------------
    # LOCK
    #
    # Duas reservas do mesmo evento não podem verificar
    # a capacidade simultaneamente.
    # -----------------------------------------------------

    event = db.scalar(
        select(Event)
        .where(
            Event.id == payload.event_id,
        )
        .with_for_update()
    )

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado.",
        )

    if event.status != EventStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Este evento não está disponível "
                "para reservas."
            ),
        )

    reserved = get_active_reserved_quantity(
        db,
        event.id,
    )

    available = (
        event.capacity - reserved
    )

    if requested_quantity > available:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Apenas {available} ingresso(s) "
                "estão disponíveis."
            ),
        )

    total_amount = (
        event.full_price
        * payload.full_quantity
        + event.half_price
        * payload.half_quantity
    )

    reservation = Reservation(
        user_id=payload.user_id,
        event_id=event.id,

        full_quantity=(
            payload.full_quantity
        ),

        half_quantity=(
            payload.half_quantity
        ),

        total_amount=total_amount,

        status=ReservationStatus.PENDING,
    )

    db.add(reservation)

    try:
        db.commit()
        db.refresh(reservation)

    except Exception:
        db.rollback()
        raise

    return reservation


# =========================================================
# CONSULTAR RESERVA
# =========================================================


@router.get(
    "/{reservation_id}",
    response_model=ReservationResponse,
)
def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
):
    reservation = db.get(
        Reservation,
        reservation_id,
    )

    if reservation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada.",
        )

    return reservation