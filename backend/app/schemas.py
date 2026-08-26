from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)

from app.models import (
    EventStatus,
    PaymentStatus,
    ReservationStatus,
    TicketStatus,
    TicketType,
    UserRole,
)


# =========================================================
# EVENTOS
# =========================================================


class EventBase(BaseModel):
    title: str
    description: str
    category: str

    event_date: datetime
    location: str

    full_price: Decimal
    half_price: Decimal

    capacity: int

    image_url: str | None = None

    age_rating: str


class EventCreate(EventBase):
    status: EventStatus = EventStatus.DRAFT


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None

    event_date: datetime | None = None
    location: str | None = None

    full_price: Decimal | None = None
    half_price: Decimal | None = None

    capacity: int | None = None

    image_url: str | None = None

    age_rating: str | None = None

    status: EventStatus | None = None


class EventResponse(EventBase):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    organizer_id: int

    status: EventStatus

    created_at: datetime


# =========================================================
# RESERVAS
# =========================================================


class ReservationCreate(BaseModel):
    event_id: int

    full_quantity: int = Field(
        default=0,
        ge=0,
    )

    half_quantity: int = Field(
        default=0,
        ge=0,
    )


class ReservationResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    user_id: int
    event_id: int

    full_quantity: int
    half_quantity: int

    total_amount: Decimal

    status: ReservationStatus

    created_at: datetime


class EventAvailabilityResponse(BaseModel):
    event_id: int

    capacity: int
    reserved: int
    available: int


# =========================================================
# PAGAMENTO
# =========================================================


class PaymentSimulationRequest(BaseModel):
    reservation_id: int

    result: Literal[
        "APPROVED",
        "REJECTED",
    ]


class PaymentSimulationResponse(BaseModel):
    payment_id: int
    reservation_id: int

    payment_status: PaymentStatus
    reservation_status: ReservationStatus

    ticket_count: int

    message: str


# =========================================================
# INGRESSOS
# =========================================================


class TicketEventResponse(BaseModel):
    id: int

    title: str

    event_date: datetime

    location: str

    image_url: str | None


class TicketResponse(BaseModel):
    id: int

    reservation_id: int

    ticket_type: TicketType

    price: Decimal

    code: str

    status: TicketStatus

    validated_at: datetime | None

    event: TicketEventResponse


class TicketValidationRequest(BaseModel):
    code: str = Field(
        min_length=1,
    )

    event_id: int


class TicketValidationResponse(BaseModel):
    result: Literal[
        "VALID",
        "USED",
        "INVALID",
        "WRONG_EVENT",
        "CANCELLED",
    ]

    message: str

    ticket_id: int | None = None

    event_id: int | None = None

    ticket_type: TicketType | None = None

    validated_at: datetime | None = None


class SharedTicketResponse(BaseModel):
    id: int

    ticket_type: TicketType

    status: TicketStatus

    code: str

    event: TicketEventResponse


# =========================================================
# AUTENTICAÇÃO
# =========================================================


class LoginRequest(BaseModel):
    email: str

    password: str


class RegisterRequest(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=120,
    )

    email: str = Field(
        min_length=5,
        max_length=255,
    )

    password: str = Field(
        min_length=6,
        max_length=128,
    )


class AuthUserResponse(BaseModel):
    id: int

    name: str

    email: str

    role: UserRole


class LoginResponse(BaseModel):
    access_token: str

    token_type: str = "bearer"

    user: AuthUserResponse