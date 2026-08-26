import os

from dotenv import load_dotenv

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

from app.routers.external_events import (
    router as external_events_router,
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


# =========================================================
# VARIÁVEIS DE AMBIENTE
# =========================================================

load_dotenv()


FRONTEND_URL = os.getenv(
    "FRONTEND_URL"
)


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="IngressoLivre API",

    description=(
        "API da plataforma "
        "IngressoLivre."
    ),

    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


# Em produção, adiciona automaticamente
# a URL do frontend hospedado na Vercel.
if FRONTEND_URL:
    allowed_origins.append(
        FRONTEND_URL.rstrip("/")
    )


app.add_middleware(
    CORSMiddleware,

    allow_origins=allowed_origins,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# ROTAS
# =========================================================

app.include_router(
    auth_router
)

app.include_router(
    events_router
)

app.include_router(
    external_events_router
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


# =========================================================
# ROTAS BÁSICAS
# =========================================================

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