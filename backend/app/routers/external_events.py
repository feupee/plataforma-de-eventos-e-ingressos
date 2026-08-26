import os
import time

from datetime import datetime
from decimal import Decimal
from zoneinfo import ZoneInfo

import httpx

from dotenv import load_dotenv

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from sqlalchemy import (
    and_,
    select,
)

from sqlalchemy.orm import Session

from app.auth import require_role
from app.database import get_db

from app.models import (
    Event,
    EventStatus,
    User,
    UserRole,
)

from app.schemas_external import (
    CategorySyncResult,
    ExternalEventResponse,
    ExternalEventsSyncAllRequest,
    ExternalEventsSyncAllResponse,
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


# =========================================================
# CATEGORIAS DO INGRESSOLIVRE
# =========================================================

CATEGORY_SYNC_PRESETS = [
    {
        "category": "Teatro",
        "classification_name": "Arts & Theatre",
        "keyword": "theatre",
    },
    {
        "category": "Infantil & Família",
        "classification_name": "Family",
        "keyword": "family",
    },
    {
        "category": "Comédia",
        "classification_name": "Comedy",
        "keyword": "comedy",
    },
    {
        "category": "Esportes",
        "classification_name": "Sports",
        "keyword": None,
    },
    {
        "category": "Shows & Música",
        "classification_name": "Music",
        "keyword": None,
    },
    {
        "category": "Festivais",
        "classification_name": None,
        "keyword": "festival",
    },
    {
        "category": "Com desconto",
        "classification_name": None,
        "keyword": "sale",
    },
    {
        "category": "Gastronomia",
        "classification_name": None,
        "keyword": "food",
    },
    {
        "category": "Evento Online",
        "classification_name": None,
        "keyword": "virtual",
    },
    {
        "category": "Cursos",
        "classification_name": None,
        "keyword": "workshop",
    },
    {
        "category": "Tecnologia",
        "classification_name": None,
        "keyword": "technology",
    },
    {
        "category": "Games",
        "classification_name": None,
        "keyword": "gaming",
    },
    {
        "category": "Festas",
        "classification_name": None,
        "keyword": "party",
    },
    {
        "category": "Palestras",
        "classification_name": None,
        "keyword": "conference",
    },
    {
        "category": "Feiras",
        "classification_name": None,
        "keyword": "expo",
    },
    {
        "category": "Arte & Cultura",
        "classification_name": "Arts & Theatre",
        "keyword": "art",
    },
]


# =========================================================
# API KEY
# =========================================================


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


# =========================================================
# IMAGEM
# =========================================================


def select_event_image(
    images: list[dict],
) -> str | None:
    if not images:
        return None

    preferred = [
        image
        for image in images
        if image.get("ratio") == "16_9"
    ]

    candidates = (
        preferred
        if preferred
        else images
    )

    candidates = sorted(
        candidates,
        key=lambda image: image.get(
            "width",
            0,
        ),
        reverse=True,
    )

    return candidates[0].get(
        "url"
    )


# =========================================================
# NORMALIZA EVENTO
# =========================================================


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

    state_name = (
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
        category = (
            classifications[0]
            .get("segment", {})
            .get("name")
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

        timezone=dates.get(
            "timezone"
        ),

        venue=venue.get(
            "name"
        ),

        city=city,

        state=state_name,

        country=country,

        image_url=(
            select_event_image(
                event.get(
                    "images",
                    [],
                )
            )
        ),

        ticketmaster_url=(
            event.get("url")
        ),

        price_min=price_min,

        price_max=price_max,

        currency=currency,

        category=category,
    )


# =========================================================
# CONSULTA TICKETMASTER
# =========================================================


def fetch_ticketmaster_events(
    keyword: str | None = None,

    classification_name: str | None = None,

    country_code: str | None = None,

    size: int = 5,
) -> list[ExternalEventResponse]:
    params = {
        "apikey":
            get_ticketmaster_api_key(),

        "size":
            size,

        "locale":
            "*",
    }

    if keyword:
        params["keyword"] = (
            keyword.strip()
        )

    if classification_name:
        params["classificationName"] = (
            classification_name
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

            timeout=20.0,
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
        print(
            "Ticketmaster HTTP error:",
            exc.response.status_code,
            exc.response.text,
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

    except httpx.RequestError as exc:
        print(
            "Ticketmaster request error:",
            exc,
        )

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

    raw_events = (
        data
        .get("_embedded", {})
        .get("events", [])
    )

    return [
        normalize_event(
            event
        )
        for event in raw_events
    ]


# =========================================================
# DATA
# =========================================================


def build_event_datetime(
    event: ExternalEventResponse,
) -> datetime | None:
    if not event.date:
        return None

    event_time = (
        event.time
        if event.time
        else "12:00:00"
    )

    try:
        parsed = (
            datetime.fromisoformat(
                f"{event.date}T{event_time}"
            )
        )

    except ValueError:
        return None

    if event.timezone:
        try:
            parsed = parsed.replace(
                tzinfo=ZoneInfo(
                    event.timezone
                )
            )

        except Exception:
            pass

    return parsed


# =========================================================
# LOCAL
# =========================================================


def build_location(
    event: ExternalEventResponse,
) -> str:
    parts = [
        event.venue,
        event.city,
        event.state,
        event.country,
    ]

    parts = [
        part
        for part in parts
        if part
    ]

    if not parts:
        return "Local não informado"

    return " - ".join(
        parts
    )[:255]


# =========================================================
# DESCRIÇÃO
# =========================================================


def build_description(
    event: ExternalEventResponse,
) -> str:
    description = (
        "Evento importado da "
        "Ticketmaster Discovery API."
    )

    if event.ticketmaster_url:
        description += (
            "\n\nMais informações: "
            f"{event.ticketmaster_url}"
        )

    return description


# =========================================================
# PREÇOS
# =========================================================


def get_local_prices(
    event: ExternalEventResponse,

    default_full_price: Decimal,

    default_half_price: Decimal,
) -> tuple[Decimal, Decimal]:
    # Se a Ticketmaster fornecer
    # preços em reais, usamos o menor.
    if (
        event.currency == "BRL"
        and event.price_min is not None
        and event.price_min >= 0
    ):
        full_price = Decimal(
            str(
                event.price_min
            )
        ).quantize(
            Decimal("0.01")
        )

        half_price = (
            full_price
            / Decimal("2")
        ).quantize(
            Decimal("0.01")
        )

        return (
            full_price,
            half_price,
        )

    return (
        default_full_price,
        default_half_price,
    )


# =========================================================
# VERIFICA DUPLICIDADE
# =========================================================


def event_already_exists(
    db: Session,

    title: str,

    event_date: datetime,

    location: str,
) -> bool:
    existing = db.scalar(
        select(Event)
        .where(
            and_(
                Event.title
                == title,

                Event.event_date
                == event_date,

                Event.location
                == location,
            )
        )
    )

    return (
        existing is not None
    )


# =========================================================
# CRIA EVENTO LOCAL
# =========================================================


def create_local_event(
    db: Session,

    organizer: User,

    external_event:
        ExternalEventResponse,

    local_category: str,

    default_full_price: Decimal,

    default_half_price: Decimal,

    default_capacity: int,
) -> bool:
    event_date = (
        build_event_datetime(
            external_event
        )
    )

    if event_date is None:
        return False

    location = build_location(
        external_event
    )

    title = (
        external_event.name[
            :200
        ]
    )

    if event_already_exists(
        db,

        title,

        event_date,

        location,
    ):
        return False

    (
        full_price,
        half_price,
    ) = get_local_prices(
        external_event,

        default_full_price,

        default_half_price,
    )

    event = Event(
        organizer_id=(
            organizer.id
        ),

        title=title,

        description=(
            build_description(
                external_event
            )
        ),

        # IMPORTANTE:
        # usamos a NOSSA categoria,
        # não a categoria da Ticketmaster.
        category=local_category,

        event_date=event_date,

        location=location,

        full_price=full_price,

        half_price=half_price,

        capacity=default_capacity,

        image_url=(
            external_event.image_url
        ),

        age_rating="Livre",

        status=(
            EventStatus.PUBLISHED
        ),
    )

    db.add(event)

    db.flush()

    return True


# =========================================================
# PESQUISA MANUAL
# =========================================================


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

    _organizer: User = Depends(
        require_role(
            UserRole.ORGANIZER,
        )
    ),
):
    return fetch_ticketmaster_events(
        keyword=keyword,

        country_code=(
            country_code
        ),

        size=size,
    )


# =========================================================
# SINCRONIZAR TODAS AS CATEGORIAS
# =========================================================


@router.post(
    "/sync-all",
    response_model=(
        ExternalEventsSyncAllResponse
    ),
)
def sync_all_categories(
    payload:
        ExternalEventsSyncAllRequest,

    db: Session = Depends(
        get_db
    ),

    organizer: User = Depends(
        require_role(
            UserRole.ORGANIZER,
        )
    ),
):
    results: list[
        CategorySyncResult
    ] = []

    total_found = 0
    total_created = 0
    total_skipped = 0

    for index, preset in enumerate(
        CATEGORY_SYNC_PRESETS
    ):
        external_events = (
            fetch_ticketmaster_events(
                keyword=(
                    preset[
                        "keyword"
                    ]
                ),

                classification_name=(
                    preset[
                        "classification_name"
                    ]
                ),

                country_code=(
                    payload.country_code
                ),

                size=(
                    payload
                    .size_per_category
                ),
            )
        )

        found = len(
            external_events
        )

        created = 0
        skipped = 0

        for external_event in external_events:
            was_created = (
                create_local_event(
                    db=db,

                    organizer=organizer,

                    external_event=(
                        external_event
                    ),

                    local_category=(
                        preset[
                            "category"
                        ]
                    ),

                    default_full_price=(
                        payload
                        .default_full_price
                    ),

                    default_half_price=(
                        payload
                        .default_half_price
                    ),

                    default_capacity=(
                        payload
                        .default_capacity
                    ),
                )
            )

            if was_created:
                created += 1
            else:
                skipped += 1

        total_found += found
        total_created += created
        total_skipped += skipped

        results.append(
            CategorySyncResult(
                category=(
                    preset[
                        "category"
                    ]
                ),

                found=found,

                created=created,

                skipped=skipped,
            )
        )

        # Ticketmaster possui limite padrão
        # de chamadas por segundo.
        if (
            index
            < len(
                CATEGORY_SYNC_PRESETS
            ) - 1
        ):
            time.sleep(
                0.25
            )

    db.commit()

    return (
        ExternalEventsSyncAllResponse(
            total_found=(
                total_found
            ),

            total_created=(
                total_created
            ),

            total_skipped=(
                total_skipped
            ),

            categories=results,

            message=(
                f"{total_created} evento(s) "
                "foram adicionados ao catálogo."
            ),
        )
    )