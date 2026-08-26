from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import require_role
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
    User,
    UserRole,
)

from app.schemas import (
    PaymentSimulationRequest,
    PaymentSimulationResponse,
)


router = APIRouter(
    prefix="/payments",
    tags=["Pagamentos"],
)


@router.post(
    "/simulate",
    response_model=PaymentSimulationResponse,
)
def simulate_payment(
    payload: PaymentSimulationRequest,

    db: Session = Depends(get_db),

    client: User = Depends(
        require_role(
            UserRole.CLIENT,
        )
    ),
):
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

    # O cliente só pode pagar a própria reserva.
    if reservation.user_id != client.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Esta reserva não pertence "
                "ao usuário autenticado."
            ),
        )

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
                Payment.id.desc(),
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
                    "Reserva aprovada sem "
                    "pagamento associado."
                ),
            )

        return PaymentSimulationResponse(
            payment_id=approved_payment.id,

            reservation_id=reservation.id,

            payment_status=approved_payment.status,

            reservation_status=reservation.status,

            ticket_count=int(ticket_count),

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
                "Esta reserva não está "
                "disponível para pagamento."
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

        db.commit()
        db.refresh(payment)

        return PaymentSimulationResponse(
            payment_id=payment.id,

            reservation_id=reservation.id,

            payment_status=payment.status,

            reservation_status=reservation.status,

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
        for _ in range(
            reservation.full_quantity
        ):
            db.add(
                Ticket(
                    reservation_id=reservation.id,

                    ticket_type=TicketType.FULL,

                    price=event.full_price,

                    status=TicketStatus.VALID,
                )
            )

        for _ in range(
            reservation.half_quantity
        ):
            db.add(
                Ticket(
                    reservation_id=reservation.id,

                    ticket_type=TicketType.HALF,

                    price=event.half_price,

                    status=TicketStatus.VALID,
                )
            )

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

        reservation_status=reservation.status,

        ticket_count=int(ticket_count),

        message=(
            "Pagamento aprovado e "
            "ingressos gerados."
        ),
    )