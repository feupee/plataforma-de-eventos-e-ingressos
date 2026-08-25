from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models import EventStatus


# =========================================================
# EVENT
# =========================================================


class EventBase(BaseModel):
    title: str = Field(
        min_length=3,
        max_length=200,
    )

    description: str = Field(
        min_length=3,
    )

    category: str = Field(
        min_length=2,
        max_length=100,
    )

    event_date: datetime

    location: str = Field(
        min_length=2,
        max_length=255,
    )

    full_price: Decimal = Field(
        ge=0,
        max_digits=10,
        decimal_places=2,
    )

    half_price: Decimal = Field(
        ge=0,
        max_digits=10,
        decimal_places=2,
    )

    capacity: int = Field(
        gt=0,
    )

    image_url: str | None = Field(
        default=None,
        max_length=500,
    )

    age_rating: str = Field(
        default="Livre",
        max_length=20,
    )


class EventCreate(EventBase):
    # Temporário.
    # Depois da autenticação, o organizer_id virá
    # automaticamente do usuário logado.
    organizer_id: int

    status: EventStatus = EventStatus.DRAFT


class EventUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=3,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        min_length=3,
    )

    category: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    event_date: datetime | None = None

    location: str | None = Field(
        default=None,
        min_length=2,
        max_length=255,
    )

    full_price: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=10,
        decimal_places=2,
    )

    half_price: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=10,
        decimal_places=2,
    )

    capacity: int | None = Field(
        default=None,
        gt=0,
    )

    image_url: str | None = Field(
        default=None,
        max_length=500,
    )

    age_rating: str | None = Field(
        default=None,
        max_length=20,
    )

    status: EventStatus | None = None


class EventResponse(EventBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organizer_id: int
    status: EventStatus
    created_at: datetime