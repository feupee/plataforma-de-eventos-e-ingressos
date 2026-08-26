import os

import httpx

from dotenv import load_dotenv

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    status,
)

from app.schemas_external import (
    ExternalEventResponse,
)


load_dotenv()


router = APIRouter(
    prefix="/external-events",
    tags=["Eventos externos"],
)


TICKETMASTER_API_URL = (
    "https://app.ticketmaster.com"
    "/discovery/v2/events.json"
)


def get_ticketmaster_api_key() -> str:
    api_key = os.getenv(
        "TICKETMASTER_API_KEY"
    )

    if not api_key:
        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "TICKETMASTER_API_KEY "
                "não configurada no backend."
            ),
        )

    return api_key


def select_event_image(
    images: list[dict],
) -> str | None:
    if not images:
        return None

    preferred_images = [
        image
        for image in images
        if image.get("ratio") == "16_9"
    ]

    candidates = (
        preferred_images
        if preferred_images
        else images
    )

    candidates = sorted(
        candidates,
        key=lambda image: (
            image.get("width", 0)
        ),
        reverse=True,
    )

    return candidates[0].get(
        "url"
    )


def normalize_event(
    event: dict,
) -> ExternalEventResponse:
    dates = event.get(
        "dates",
        {},
    )

    start = dates.get(
        "start",
        {},
    )

    embedded = event.get(
        "_embedded",
        {},
    )

    venues = embedded.get(
        "venues",
        [],
    )

    venue = (
        venues[0]
        if venues
        else {}
    )

    city = (
        venue
        .get("city", {})
        .get("name")
    )

    state = (
        venue
        .get("state", {})
        .get("name")
    )

    country = (
        venue
        .get("country", {})
        .get("name")
    )

    classifications = event.get(
        "classifications",
        [],
    )

    category = None

    if classifications:
        segment = (
            classifications[0]
            .get("segment", {})
        )

        category = segment.get(
            "name"
        )

    price_ranges = event.get(
        "priceRanges",
        [],
    )

    price_min = None
    price_max = None
    currency = None

    if price_ranges:
        price_range = (
            price_ranges[0]
        )

        price_min = (
            price_range.get("min")
        )

        price_max = (
            price_range.get("max")
        )

        currency = (
            price_range.get(
                "currency"
            )
        )

    image_url = (
        select_event_image(
            event.get(
                "images",
                [],
            )
        )
    )

    return ExternalEventResponse(
        id=event.get(
            "id",
            "",
        ),

        name=event.get(
            "name",
            "Evento sem nome",
        ),

        date=start.get(
            "localDate"
        ),

        time=start.get(
            "localTime"
        ),

        venue=venue.get(
            "name"
        ),

        city=city,

        state=state,

        country=country,

        image_url=image_url,

        ticketmaster_url=(
            event.get("url")
        ),

        price_min=price_min,
        price_max=price_max,

        currency=currency,

        category=category,
    )


@router.get(
    "",
    response_model=list[
        ExternalEventResponse
    ],
)
def search_external_events(
    keyword: str | None = Query(
        default=None,
        max_length=100,
    ),

    city: str | None = Query(
        default=None,
        max_length=100,
    ),

    country_code: str | None = Query(
        default=None,
        min_length=2,
        max_length=2,
    ),

    size: int = Query(
        default=12,
        ge=1,
        le=20,
    ),
):
    params = {
        "apikey":
            get_ticketmaster_api_key(),

        "size":
            size,

        "sort":
            "date,asc",

        "locale":
            "*",
    }

    if keyword:
        params["keyword"] = (
            keyword.strip()
        )

    if city:
        params["city"] = (
            city.strip()
        )

    if country_code:
        params["countryCode"] = (
            country_code
            .strip()
            .upper()
        )

    try:
        response = httpx.get(
            TICKETMASTER_API_URL,

            params=params,

            timeout=15.0,
        )

        response.raise_for_status()

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=(
                status.HTTP_504_GATEWAY_TIMEOUT
            ),
            detail=(
                "A Ticketmaster demorou "
                "demais para responder."
            ),
        )

    except httpx.HTTPStatusError as exc:
        if (
            exc.response.status_code
            == 401
        ):
            raise HTTPException(
                status_code=(
                    status.HTTP_502_BAD_GATEWAY
                ),
                detail=(
                    "API Key da Ticketmaster "
                    "inválida."
                ),
            )

        raise HTTPException(
            status_code=(
                status.HTTP_502_BAD_GATEWAY
            ),
            detail=(
                "Não foi possível consultar "
                "a Ticketmaster."
            ),
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=(
                status.HTTP_502_BAD_GATEWAY
            ),
            detail=(
                "Não foi possível conectar "
                "à Ticketmaster."
            ),
        )

    data = response.json()

    events = (
        data
        .get("_embedded", {})
        .get("events", [])
    )

    return [
        normalize_event(event)
        for event in events
    ]