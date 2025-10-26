from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from shared.middleware.auth import get_current_user
from shared.models.common import UserContext
from .controllers import (
    register_user_controller,
    login_user_controller,
    refresh_token_controller,
    logout_controller,
    forgot_password_controller,
    reset_password_controller,
    verify_email_controller,
    change_password_controller,
    get_current_user_controller,
    validate_token_controller
)
from .schemas import (
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    TokenResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
    ChangePasswordRequest,
    VerifyEmailRequest,
    MessageResponse,
    UserResponse
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request_data: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        return register_user_controller(request_data, request, db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )


@router.post("/login", response_model=LoginResponse)
async def login(
    request_data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        return login_user_controller(request_data, request, db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request_data: RefreshTokenRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        return refresh_token_controller(request_data, request, db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    request_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    try:
        return logout_controller(request_data, db)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during logout"
        )


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    request_data: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    try:
        return forgot_password_controller(request_data, db)
    except Exception:
        return MessageResponse(
            message="If the email exists, a password reset link has been sent",
            success=True
        )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    request_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    try:
        return reset_password_controller(request_data, db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    request_data: VerifyEmailRequest,
    db: Session = Depends(get_db)
):
    try:
        return verify_email_controller(request_data, db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    request_data: ChangePasswordRequest,
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return change_password_controller(request_data, current_user, db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return get_current_user_controller(current_user, db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc)
        )


@router.post("/validate-token", response_model=dict)
async def validate_token(
    current_user: UserContext = Depends(get_current_user)
):
    return validate_token_controller(current_user)
