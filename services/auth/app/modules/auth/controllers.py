from fastapi import Request
from sqlalchemy.orm import Session
from app.config import get_settings
from shared.models.common import UserContext
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
from .services import AuthService

settings = get_settings()


def _build_login_response(user, access_token, refresh_token) -> LoginResponse:
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.jwt_access_token_expire_minutes * 60,
        user=UserResponse.from_orm(user)
    )


def register_user_controller(
    request_data: RegisterRequest,
    request: Request,
    db: Session
) -> LoginResponse:
    service = AuthService(db)
    user, access_token, refresh_token = service.register_user(
        request=request_data,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    return _build_login_response(user, access_token, refresh_token)


def login_user_controller(
    request_data: LoginRequest,
    request: Request,
    db: Session
) -> LoginResponse:
    service = AuthService(db)
    user, access_token, refresh_token = service.login(
        request=request_data,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    return _build_login_response(user, access_token, refresh_token)


def refresh_token_controller(
    request_data: RefreshTokenRequest,
    request: Request,
    db: Session
) -> TokenResponse:
    service = AuthService(db)
    access_token = service.refresh_access_token(
        refresh_token=request_data.refresh_token,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.jwt_access_token_expire_minutes * 60
    )


def logout_controller(
    request_data: RefreshTokenRequest,
    db: Session
) -> MessageResponse:
    service = AuthService(db)
    service.logout(refresh_token=request_data.refresh_token)
    return MessageResponse(message="Successfully logged out", success=True)


def forgot_password_controller(
    request_data: PasswordResetRequest,
    db: Session
) -> MessageResponse:
    service = AuthService(db)
    message = service.request_password_reset(email=request_data.email)
    return MessageResponse(message=message, success=True)


def reset_password_controller(
    request_data: PasswordResetConfirm,
    db: Session
) -> MessageResponse:
    service = AuthService(db)
    service.reset_password(
        token=request_data.token,
        new_password=request_data.new_password
    )
    return MessageResponse(message="Password reset successful", success=True)


def verify_email_controller(
    request_data: VerifyEmailRequest,
    db: Session
) -> MessageResponse:
    service = AuthService(db)
    service.verify_email(token=request_data.token)
    return MessageResponse(message="Email verified successfully", success=True)


def change_password_controller(
    request_data: ChangePasswordRequest,
    current_user: UserContext,
    db: Session
) -> MessageResponse:
    service = AuthService(db)
    service.change_password(
        user_id=current_user.user_id,
        current_password=request_data.current_password,
        new_password=request_data.new_password
    )
    return MessageResponse(message="Password changed successfully", success=True)


def get_current_user_controller(
    current_user: UserContext,
    db: Session
) -> UserResponse:
    from .models import User
    user = db.query(User).filter(User.id == current_user.user_id).first()
    if not user:
        raise ValueError("User not found")
    return UserResponse.from_orm(user)


def validate_token_controller(
    current_user: UserContext
) -> dict:
    return {
        "valid": True,
        "user_id": str(current_user.user_id),
        "organization_id": str(current_user.organization_id),
        "email": current_user.email,
        "roles": current_user.roles,
        "permissions": current_user.permissions
    }
