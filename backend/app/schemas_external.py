from decimal import Decimal

from pydantic import (
    BaseModel,
    Field,
)


class ExternalEventResponse(BaseModel):
    id: str

    name: str

    date: str | None = None
    time: str | None = None
    timezone: str | None = None

    venue: str | None = None

    city: str | None = None
    state: str | None = None
    country: str | None = None

    image_url: str | None = None

    ticketmaster_url: str | None = None

    price_min: float | None = None
    price_max: float | None = None

    currency: str | None = None

    category: str | None = None


class CategorySyncResult(BaseModel):
    category: str

    found: int
    created: int
    skipped: int


class ExternalEventsSyncAllRequest(BaseModel):
    country_code: str = Field(
        default="US",
        min_length=2,
        max_length=2,
    )

    size_per_category: int = Field(
        default=5,
        ge=1,
        le=10,
    )

    default_full_price: Decimal = Field(
        default=Decimal("100.00"),
        ge=0,
    )

    default_half_price: Decimal = Field(
        default=Decimal("50.00"),
        ge=0,
    )

    default_capacity: int = Field(
        default=500,
        gt=0,
    )


class ExternalEventsSyncAllResponse(BaseModel):
    total_found: int

    total_created: int

    total_skipped: int

    categories: list[CategorySyncResult]

    message: str