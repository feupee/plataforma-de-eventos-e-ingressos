from fastapi import FastAPI

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from app.routers.auth import (
    router as auth_router,
)

from app.routers.events import (
    router as events_router,
)

from app.routers.payments import (
    router as payments_router,
)

from app.routers.reservations import (
    router as reservations_router,
)

from app.routers.tickets import (
    router as tickets_router,
)


app = FastAPI(
    title="IngressoLivre API",

    description=(
        "API da plataforma "
        "IngressoLivre."
    ),

    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


app.include_router(
    auth_router
)

app.include_router(
    events_router
)

app.include_router(
    reservations_router
)

app.include_router(
    payments_router
)

app.include_router(
    tickets_router
)


@app.get("/")
def root():
    return {
        "message":
            "IngressoLivre API funcionando"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }