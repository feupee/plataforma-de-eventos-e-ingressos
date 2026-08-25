from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.events import router as events_router
from app.routers.payments import router as payments_router
from app.routers.reservations import router as reservations_router


app = FastAPI(
    title="IngressoLivre API",
    description="API da plataforma de eventos e ingressos IngressoLivre.",
    version="0.1.0",
)


# =========================================================
# CORS
# =========================================================

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


# =========================================================
# ROUTERS
# =========================================================

app.include_router(events_router)
app.include_router(reservations_router)
app.include_router(payments_router)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "IngressoLivre API funcionando"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }