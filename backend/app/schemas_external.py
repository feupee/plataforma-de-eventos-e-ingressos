from pydantic import BaseModel


class ExternalEventResponse(BaseModel):
    id: str

    name: str

    date: str | None = None
    time: str | None = None

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