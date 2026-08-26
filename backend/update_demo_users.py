from sqlalchemy import select

from app.auth import (
    hash_password,
)

from app.database import (
    SessionLocal,
)

from app.models import (
    User,
    UserRole,
)


USERS = [
    {
        "name":
            "Organizador Demo",

        "email":
            "organizador@ingressolivre.local",

        "password":
            "organizador123",

        "role":
            UserRole.ORGANIZER,
    },

    {
        "name":
            "Cliente Demo",

        "email":
            "cliente@ingressolivre.local",

        "password":
            "cliente123",

        "role":
            UserRole.CLIENT,
    },

    {
        "name":
            "Cliente Dois",

        "email":
            "cliente2@ingressolivre.local",

        "password":
            "cliente123",

        "role":
            UserRole.CLIENT,
    },

    {
        "name":
            "Portaria Demo",

        "email":
            "portaria@ingressolivre.local",

        "password":
            "portaria123",

        "role":
            UserRole.GATE,
    },
]


def main():
    db = SessionLocal()

    try:
        for data in USERS:
            user = db.scalar(
                select(User).where(
                    User.email
                    == data["email"],
                )
            )

            if user is None:
                user = User(
                    name=data["name"],

                    email=data["email"],

                    password_hash=(
                        hash_password(
                            data[
                                "password"
                            ]
                        )
                    ),

                    role=data["role"],
                )

                db.add(user)

            else:
                user.name = (
                    data["name"]
                )

                user.password_hash = (
                    hash_password(
                        data[
                            "password"
                        ]
                    )
                )

                user.role = (
                    data["role"]
                )

        db.commit()

        print(
            "Usuários atualizados."
        )

    finally:
        db.close()


if __name__ == "__main__":
    main()