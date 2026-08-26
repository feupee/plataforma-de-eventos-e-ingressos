from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

from app.database import get_db

from app.models import (
    User,
    UserRole,
)

from app.schemas import (
    AuthUserResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
)


router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"],
)


@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    email = (
        payload.email
        .strip()
        .lower()
    )

    user = db.scalar(
        select(User).where(
            User.email == email,
        )
    )

    if (
        user is None
        or not verify_password(
            payload.password,
            user.password_hash,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos.",
        )

    token = create_access_token(
        user,
    )

    return LoginResponse(
        access_token=token,

        user=AuthUserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
        ),
    )


@router.post(
    "/register",
    response_model=LoginResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    email = (
        payload.email
        .strip()
        .lower()
    )

    existing = db.scalar(
        select(User).where(
            User.email == email,
        )
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Já existe um usuário "
                "com este e-mail."
            ),
        )

    user = User(
        name=payload.name.strip(),

        email=email,

        password_hash=hash_password(
            payload.password,
        ),

        role=UserRole.CLIENT,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        user,
    )

    return LoginResponse(
        access_token=token,

        user=AuthUserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
        ),
    )


@router.get(
    "/me",
    response_model=AuthUserResponse,
)
def me(
    user: User = Depends(
        get_current_user,
    ),
):
    return AuthUserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
    )