from sqlalchemy import inspect, text

from app import models
from app.database import Base, engine


def create_tables():
    print("=== INICIANDO CREATE_TABLES ===")

    print("\nURL do banco:")
    print(engine.url.render_as_string(hide_password=True))

    print("\nModels registrados:")
    print(list(Base.metadata.tables.keys()))

    print("\nTestando conexão...")

    with engine.connect() as connection:
        database = connection.execute(
            text("SELECT current_database()")
        ).scalar()

        schema = connection.execute(
            text("SELECT current_schema()")
        ).scalar()

        user = connection.execute(
            text("SELECT current_user")
        ).scalar()

        print(f"Database: {database}")
        print(f"Schema: {schema}")
        print(f"Usuário: {user}")

    print("\nCriando tabelas...")

    Base.metadata.create_all(bind=engine)

    print("create_all executado.")

    inspector = inspect(engine)

    print("\nTabelas encontradas no banco:")
    print(inspector.get_table_names())

    print("\n=== FINALIZADO ===")


if __name__ == "__main__":
    create_tables()