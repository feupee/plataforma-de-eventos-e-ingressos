from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select

from app.database import SessionLocal
from app.models import (
    Event,
    EventStatus,
    User,
    UserRole,
)


BR_TIMEZONE = timezone(
    timedelta(hours=-3)
)


def create_user_if_not_exists(
    db,
    name: str,
    email: str,
    role: UserRole,
):
    user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    if user:
        print(
            f"Usuário já existe: {email}"
        )

        return user

    user = User(
        name=name,
        email=email,

        # Temporário.
        # Ainda não estamos implementando autenticação.
        password_hash="SEED_WITHOUT_AUTH",

        role=role,
    )

    db.add(user)
    db.flush()

    print(
        f"Usuário criado: {email}"
    )

    return user


def create_event_if_not_exists(
    db,
    organizer: User,
    title: str,
    description: str,
    category: str,
    event_date: datetime,
    location: str,
    full_price: Decimal,
    half_price: Decimal,
    capacity: int,
    image_url: str,
    age_rating: str,
):
    event = db.scalar(
        select(Event).where(
            Event.title == title
        )
    )

    if event:
        print(
            f"Evento já existe: {title}"
        )

        return event

    event = Event(
        organizer_id=organizer.id,
        title=title,
        description=description,
        category=category,
        event_date=event_date,
        location=location,
        full_price=full_price,
        half_price=half_price,
        capacity=capacity,
        image_url=image_url,
        age_rating=age_rating,
        status=EventStatus.PUBLISHED,
    )

    db.add(event)

    print(
        f"Evento criado: {title}"
    )

    return event


def seed():
    db = SessionLocal()

    try:
        print(
            "=== INICIANDO SEED ==="
        )

        organizer = create_user_if_not_exists(
            db=db,
            name="Organizador IngressoLivre",
            email="organizador@ingressolivre.local",
            role=UserRole.ORGANIZER,
        )

        create_user_if_not_exists(
            db=db,
            name="Cliente IngressoLivre",
            email="cliente@ingressolivre.local",
            role=UserRole.CLIENT,
        )

        create_user_if_not_exists(
            db=db,
            name="Portaria IngressoLivre",
            email="portaria@ingressolivre.local",
            role=UserRole.GATE,
        )

        db.flush()

        create_event_if_not_exists(
            db=db,
            organizer=organizer,
            title="Festival de Música 2026",
            description=(
                "Uma noite com diferentes atrações musicais "
                "e experiências ao vivo."
            ),
            category="Shows & Música",
            event_date=datetime(
                2026,
                9,
                12,
                20,
                0,
                tzinfo=BR_TIMEZONE,
            ),
            location="Uberlândia - MG",
            full_price=Decimal("100.00"),
            half_price=Decimal("50.00"),
            capacity=1000,
            image_url="/carousel/evento1.png",
            age_rating="16",
        )

        create_event_if_not_exists(
            db=db,
            organizer=organizer,
            title="Tech Conference",
            description=(
                "Conferência sobre tecnologia, desenvolvimento "
                "de software e inovação."
            ),
            category="Tecnologia",
            event_date=datetime(
                2026,
                9,
                20,
                9,
                0,
                tzinfo=BR_TIMEZONE,
            ),
            location="São Paulo - SP",
            full_price=Decimal("120.00"),
            half_price=Decimal("60.00"),
            capacity=800,
            image_url="/carousel/evento2.png",
            age_rating="Livre",
        )

        create_event_if_not_exists(
            db=db,
            organizer=organizer,
            title="Festival Gastronômico",
            description=(
                "Festival com gastronomia, restaurantes "
                "e experiências culinárias."
            ),
            category="Gastronomia",
            event_date=datetime(
                2026,
                9,
                28,
                12,
                0,
                tzinfo=BR_TIMEZONE,
            ),
            location="Belo Horizonte - MG",
            full_price=Decimal("60.00"),
            half_price=Decimal("30.00"),
            capacity=1500,
            image_url="/carousel/evento3.png",
            age_rating="Livre",
        )

        create_event_if_not_exists(
            db=db,
            organizer=organizer,
            title="Stand-up Comedy Night",
            description=(
                "Uma noite dedicada à comédia e apresentações "
                "de stand-up."
            ),
            category="Comédia",
            event_date=datetime(
                2026,
                10,
                5,
                20,
                30,
                tzinfo=BR_TIMEZONE,
            ),
            location="Uberlândia - MG",
            full_price=Decimal("50.00"),
            half_price=Decimal("25.00"),
            capacity=400,
            image_url="/carousel/evento4.png",
            age_rating="16",
        )

        create_event_if_not_exists(
            db=db,
            organizer=organizer,
            title="Campeonato de E-Sports",
            description=(
                "Competição de jogos eletrônicos com equipes "
                "e jogadores convidados."
            ),
            category="Games",
            event_date=datetime(
                2026,
                10,
                18,
                10,
                0,
                tzinfo=BR_TIMEZONE,
            ),
            location="São Paulo - SP",
            full_price=Decimal("80.00"),
            half_price=Decimal("40.00"),
            capacity=2000,
            image_url="/carousel/evento5.png",
            age_rating="12",
        )

        db.commit()

        print(
            "=== SEED CONCLUÍDO ==="
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed()