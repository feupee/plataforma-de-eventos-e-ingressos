from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from uuid import uuid4

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum as SqlEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# =========================================================
# ENUMS
# =========================================================


class UserRole(str, Enum):
    CLIENT = "CLIENT"
    ORGANIZER = "ORGANIZER"
    GATE = "GATE"


class EventStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    CANCELLED = "CANCELLED"


class ReservationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"


class TicketType(str, Enum):
    FULL = "FULL"
    HALF = "HALF"


class TicketStatus(str, Enum):
    VALID = "VALID"
    USED = "USED"
    CANCELLED = "CANCELLED"


# =========================================================
# USER
# =========================================================


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[UserRole] = mapped_column(
        SqlEnum(
            UserRole,
            name="user_role",
        ),
        default=UserRole.CLIENT,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    events: Mapped[list["Event"]] = relationship(
        back_populates="organizer",
        cascade="all, delete-orphan",
    )

    reservations: Mapped[list["Reservation"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


# =========================================================
# EVENT
# =========================================================


class Event(Base):
    __tablename__ = "events"

    __table_args__ = (
        CheckConstraint(
            "capacity > 0",
            name="check_event_capacity_positive",
        ),
        CheckConstraint(
            "full_price >= 0",
            name="check_full_price_non_negative",
        ),
        CheckConstraint(
            "half_price >= 0",
            name="check_half_price_non_negative",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    organizer_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    event_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    location: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    full_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    half_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    capacity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    age_rating: Mapped[str] = mapped_column(
        String(20),
        default="Livre",
        nullable=False,
    )

    status: Mapped[EventStatus] = mapped_column(
        SqlEnum(
            EventStatus,
            name="event_status",
        ),
        default=EventStatus.DRAFT,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    organizer: Mapped["User"] = relationship(
        back_populates="events",
    )

    reservations: Mapped[list["Reservation"]] = relationship(
        back_populates="event",
        cascade="all, delete-orphan",
    )


# =========================================================
# RESERVATION
# =========================================================


class Reservation(Base):
    __tablename__ = "reservations"

    __table_args__ = (
        CheckConstraint(
            "full_quantity >= 0",
            name="check_full_quantity_non_negative",
        ),
        CheckConstraint(
            "half_quantity >= 0",
            name="check_half_quantity_non_negative",
        ),
        CheckConstraint(
            "full_quantity + half_quantity > 0",
            name="check_reservation_has_tickets",
        ),
        CheckConstraint(
            "total_amount >= 0",
            name="check_total_amount_non_negative",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    event_id: Mapped[int] = mapped_column(
        ForeignKey(
            "events.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    full_quantity: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    half_quantity: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    status: Mapped[ReservationStatus] = mapped_column(
        SqlEnum(
            ReservationStatus,
            name="reservation_status",
        ),
        default=ReservationStatus.PENDING,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        back_populates="reservations",
    )

    event: Mapped["Event"] = relationship(
        back_populates="reservations",
    )

    payments: Mapped[list["Payment"]] = relationship(
        back_populates="reservation",
        cascade="all, delete-orphan",
    )

    tickets: Mapped[list["Ticket"]] = relationship(
        back_populates="reservation",
        cascade="all, delete-orphan",
    )


# =========================================================
# PAYMENT
# =========================================================


class Payment(Base):
    __tablename__ = "payments"

    __table_args__ = (
        CheckConstraint(
            "amount >= 0",
            name="check_payment_amount_non_negative",
        ),
        UniqueConstraint(
            "provider",
            "external_payment_id",
            name="uq_payment_provider_external_id",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    reservation_id: Mapped[int] = mapped_column(
        ForeignKey(
            "reservations.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # Exemplo:
    # "mercado_pago"
    # "stripe"
    # "paypal"
    provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    # ID retornado pelo provedor de pagamento.
    external_payment_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    status: Mapped[PaymentStatus] = mapped_column(
        SqlEnum(
            PaymentStatus,
            name="payment_status",
        ),
        default=PaymentStatus.PENDING,
        nullable=False,
        index=True,
    )

    # Exemplo:
    # credit_card
    # debit_card
    # pix
    payment_method: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    reservation: Mapped["Reservation"] = relationship(
        back_populates="payments",
    )


# =========================================================
# TICKET
# =========================================================


class Ticket(Base):
    __tablename__ = "tickets"

    __table_args__ = (
        CheckConstraint(
            "price >= 0",
            name="check_ticket_price_non_negative",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    reservation_id: Mapped[int] = mapped_column(
        ForeignKey(
            "reservations.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    ticket_type: Mapped[TicketType] = mapped_column(
        SqlEnum(
            TicketType,
            name="ticket_type",
        ),
        nullable=False,
    )

    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    code: Mapped[str] = mapped_column(
        String(36),
        unique=True,
        index=True,
        default=lambda: str(uuid4()),
        nullable=False,
    )

    status: Mapped[TicketStatus] = mapped_column(
        SqlEnum(
            TicketStatus,
            name="ticket_status",
        ),
        default=TicketStatus.VALID,
        nullable=False,
        index=True,
    )

    validated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    validated_by_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    reservation: Mapped["Reservation"] = relationship(
        back_populates="tickets",
    )

    validated_by: Mapped["User | None"] = relationship(
        foreign_keys=[validated_by_id],
    )