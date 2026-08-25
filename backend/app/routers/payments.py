from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db

from app.models import (
    Event,
    Payment,
    PaymentStatus,
    Reservation,
    ReservationStatus,
    Ticket,
    TicketStatus,
    TicketType,
)

from app.schemas import (
    PaymentSimulationRequest,
    PaymentSimulationResponse,
)


router = APIRouter(
    prefix="/payments",
    tags=["Pagamentos"],
)


RESERVATION_HOLD_MINUTES = 15


@router.post(
    "/simulate",
    response_model=PaymentSimulationResponse,
)
def simulate_payment(
    payload: PaymentSimulationRequest,
    db: Session = Depends(get_db),
):
    # Bloqueia a reserva durante o processamento.
    reservation = db.scalar(
        select(Reservation)
        .where(
            Reservation.id
            == payload.reservation_id
        )
        .with_for_update()
    )

    if reservation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada.",
        )

    # -----------------------------------------------------
    # IDEMPOTÊNCIA
    #
    # Se a reserva já estiver aprovada, não devemos gerar
    # ingressos novamente.
    # -----------------------------------------------------

    if (
        reservation.status
        == ReservationStatus.APPROVED
    ):
        approved_payment = db.scalar(
            select(Payment)
            .where(
                Payment.reservation_id
                == reservation.id,

                Payment.status
                == PaymentStatus.APPROVED,
            )
            .order_by(
                Payment.id.desc()
            )
        )

        ticket_count = (
            db.scalar(
                select(
                    func.count(Ticket.id)
                ).where(
                    Ticket.reservation_id
                    == reservation.id
                )
            )
            or 0
        )

        if approved_payment is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Reserva aprovada sem pagamento "
                    "associado."
                ),
            )

        return PaymentSimulationResponse(
            payment_id=approved_payment.id,
            reservation_id=reservation.id,
            payment_status=(
                approved_payment.status
            ),
            reservation_status=(
                reservation.status
            ),
            ticket_count=int(
                ticket_count
            ),
            message=(
                "Esta reserva já possui "
                "pagamento aprovado."
            ),
        )

    if (
        reservation.status
        != ReservationStatus.PENDING
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Esta reserva não está disponível "
                "para pagamento."
            ),
        )

    # -----------------------------------------------------
    # EXPIRAÇÃO
    # -----------------------------------------------------

    expiration_limit = (
        datetime.now(timezone.utc)
        - timedelta(
            minutes=RESERVATION_HOLD_MINUTES
        )
    )

    if reservation.created_at < expiration_limit:
        reservation.status = (
            ReservationStatus.EXPIRED
        )

        db.commit()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "A reserva expirou. "
                "Realize uma nova reserva."
            ),
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

    # -----------------------------------------------------
    # REGISTRAR TENTATIVA DE PAGAMENTO
    # -----------------------------------------------------

    payment = Payment(
        reservation_id=reservation.id,

        provider="simulation",

        external_payment_id=(
            f"SIM-{uuid4()}"
        ),

        amount=reservation.total_amount,

        status=PaymentStatus.PENDING,

        payment_method="SIMULATED",
    )

    db.add(payment)
    db.flush()

    # =====================================================
    # PAGAMENTO RECUSADO
    # =====================================================

    if payload.result == "REJECTED":
        payment.status = (
            PaymentStatus.REJECTED
        )

        # Reserva continua PENDING para permitir
        # uma nova tentativa.
        db.commit()
        db.refresh(payment)

        return PaymentSimulationResponse(
            payment_id=payment.id,
            reservation_id=reservation.id,
            payment_status=payment.status,
            reservation_status=(
                reservation.status
            ),
            ticket_count=0,
            message="Pagamento recusado.",
        )

    # =====================================================
    # PAGAMENTO APROVADO
    # =====================================================

    payment.status = (
        PaymentStatus.APPROVED
    )

    reservation.status = (
        ReservationStatus.APPROVED
    )

    # -----------------------------------------------------
    # NÃO GERAR INGRESSOS DUAS VEZES
    # -----------------------------------------------------

    existing_ticket_count = (
        db.scalar(
            select(
                func.count(Ticket.id)
            ).where(
                Ticket.reservation_id
                == reservation.id
            )
        )
        or 0
    )

    if existing_ticket_count == 0:
        # -------------------------------------------------
        # INGRESSOS INTEIROS
        # -------------------------------------------------

        for _ in range(
            reservation.full_quantity
        ):
            ticket = Ticket(
                reservation_id=(
                    reservation.id
                ),

                ticket_type=(
                    TicketType.FULL
                ),

                price=event.full_price,

                status=(
                    TicketStatus.VALID
                ),
            )

            db.add(ticket)

        # -------------------------------------------------
        # MEIA-ENTRADA
        # -------------------------------------------------

        for _ in range(
            reservation.half_quantity
        ):
            ticket = Ticket(
                reservation_id=(
                    reservation.id
                ),

                ticket_type=(
                    TicketType.HALF
                ),

                price=event.half_price,

                status=(
                    TicketStatus.VALID
                ),
            )

            db.add(ticket)

    db.flush()

    ticket_count = (
        db.scalar(
            select(
                func.count(Ticket.id)
            ).where(
                Ticket.reservation_id
                == reservation.id
            )
        )
        or 0
    )

    db.commit()
    db.refresh(payment)
    db.refresh(reservation)

    return PaymentSimulationResponse(
        payment_id=payment.id,
        reservation_id=reservation.id,
        payment_status=payment.status,
        reservation_status=(
            reservation.status
        ),
        ticket_count=int(
            ticket_count
        ),
        message=(
            "Pagamento aprovado e "
            "ingressos gerados."
        ),
    )