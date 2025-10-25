"""API routes for Auth Service."""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.schemas import (
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
from app.service import AuthService
from shared.middleware.auth import get_current_user
from shared.models.common import UserContext

settings = get_settings()
router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request_data: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Register a new user and organization.

    This endpoint creates a new user account and associated organization.
    Returns access and refresh tokens upon successful registration.
    """
    auth_service = AuthService(db)

    try:
        user, access_token, refresh_token = auth_service.register_user(
            request=request_data,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.jwt_access_token_expire_minutes * 60,
            user=UserResponse.from_orm(user)
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
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
    """
    Authenticate user and return tokens.

    Validates user credentials and returns access and refresh tokens.
    Failed login attempts are tracked and accounts are locked after 5 failures.
    """
    auth_service = AuthService(db)

    try:
        user, access_token, refresh_token = auth_service.login(
            request=request_data,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.jwt_access_token_expire_minutes * 60,
            user=UserResponse.from_orm(user)
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
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
    """
    Refresh access token using refresh token.

    Exchange a valid refresh token for a new access token.
    """
    auth_service = AuthService(db)

    try:
        access_token = auth_service.refresh_access_token(
            refresh_token=request_data.refresh_token,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.jwt_access_token_expire_minutes * 60
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    request_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Logout user by revoking refresh token.

    Revokes the provided refresh token, effectively logging out the user.
    """
    auth_service = AuthService(db)

    try:
        auth_service.logout(refresh_token=request_data.refresh_token)
        return MessageResponse(message="Successfully logged out", success=True)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during logout"
        )


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    request_data: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    Request password reset.

    Sends a password reset email to the user (if email exists).
    Always returns success to prevent email enumeration.
    """
    auth_service = AuthService(db)

    try:
        message = auth_service.request_password_reset(email=request_data.email)
        return MessageResponse(message=message, success=True)

    except Exception as e:
        # Always return success to prevent email enumeration
        return MessageResponse(
            message="If the email exists, a password reset link has been sent",
            success=True
        )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    request_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Reset password using token.

    Resets the user's password using the token sent via email.
    """
    auth_service = AuthService(db)

    try:
        auth_service.reset_password(
            token=request_data.token,
            new_password=request_data.new_password
        )
        return MessageResponse(message="Password reset successful", success=True)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    request_data: VerifyEmailRequest,
    db: Session = Depends(get_db)
):
    """
    Verify user email address.

    Verifies the user's email using the token sent during registration.
    """
    auth_service = AuthService(db)

    try:
        auth_service.verify_email(token=request_data.token)
        return MessageResponse(message="Email verified successfully", success=True)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    request_data: ChangePasswordRequest,
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change password for authenticated user.

    Allows authenticated users to change their password.
    Requires current password for verification.
    """
    auth_service = AuthService(db)

    try:
        auth_service.change_password(
            user_id=current_user.user_id,
            current_password=request_data.current_password,
            new_password=request_data.new_password
        )
        return MessageResponse(message="Password changed successfully", success=True)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user information.

    Returns the profile of the currently authenticated user.
    """
    from app.models import User

    user = db.query(User).filter(User.id == current_user.user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse.from_orm(user)


@router.post("/validate-token", response_model=dict)
async def validate_token(
    current_user: UserContext = Depends(get_current_user)
):
    """
    Validate access token.

    Validates the provided access token and returns user information.
    Used by other microservices to validate tokens.
    """
    return {
        "valid": True,
        "user_id": str(current_user.user_id),
        "organization_id": str(current_user.organization_id),
        "email": current_user.email,
        "roles": current_user.roles,
        "permissions": current_user.permissions
    }
