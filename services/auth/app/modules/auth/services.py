"""Auth service business logic."""

import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Tuple
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.config import get_settings
from .models import User, RefreshToken, LoginHistory
from .schemas import RegisterRequest, LoginRequest
from shared.utils.encryption import encryption_handler
from shared.utils.jwt import jwt_handler

settings = get_settings()


class AuthService:
    """Authentication service."""

    def __init__(self, db: Session):
        self.db = db

    def register_user(
        self,
        request: RegisterRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Tuple[User, str, str]:
        """Register new user and organization."""
        # Check if user already exists
        existing_user = self.db.query(User).filter(
            User.email == request.email.lower()
        ).first()

        if existing_user:
            raise ValueError("User with this email already exists")

        # Create organization (this would be done via Organization Service in production)
        organization_id = uuid4()

        # Hash password
        password_hash = encryption_handler.hash_password(request.password)

        # Generate verification token
        verification_token = secrets.token_urlsafe(32)
        verification_expires = datetime.utcnow() + timedelta(hours=24)

        # Create user
        user = User(
            id=uuid4(),
            email=request.email.lower(),
            password_hash=password_hash,
            organization_id=organization_id,
            is_active=True,
            is_verified=False,  # Require email verification
            verification_token=verification_token,
            verification_token_expires_at=verification_expires,
            failed_login_attempts=0
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # Create tokens
        access_token, refresh_token = self._create_tokens(
            user, ip_address, user_agent
        )

        return user, access_token, refresh_token

    def login(
        self,
        request: LoginRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Tuple[User, str, str]:
        """Authenticate user and return tokens."""
        # Find user
        user = self.db.query(User).filter(
            User.email == request.email.lower()
        ).first()

        # Log login attempt
        login_history = LoginHistory(
            id=uuid4(),
            user_id=user.id if user else None,
            success=False,
            ip_address=ip_address,
            user_agent=user_agent,
            failure_reason=None
        )

        if not user:
            login_history.failure_reason = "User not found"
            self.db.add(login_history)
            self.db.commit()
            raise ValueError("Invalid email or password")

        # Check if account is locked
        if user.locked_until and user.locked_until > datetime.utcnow():
            login_history.failure_reason = "Account locked"
            self.db.add(login_history)
            self.db.commit()
            raise ValueError(f"Account is locked until {user.locked_until}")

        # Verify password
        if not encryption_handler.verify_password(request.password, user.password_hash):
            # Increment failed attempts
            user.failed_login_attempts += 1

            # Lock account after 5 failed attempts
            if user.failed_login_attempts >= 5:
                user.locked_until = datetime.utcnow() + timedelta(minutes=30)
                login_history.failure_reason = "Too many failed attempts - account locked"
            else:
                login_history.failure_reason = "Invalid password"

            self.db.add(login_history)
            self.db.commit()
            raise ValueError("Invalid email or password")

        # Check if user is active
        if not user.is_active:
            login_history.failure_reason = "Account inactive"
            self.db.add(login_history)
            self.db.commit()
            raise ValueError("Account is inactive")

        # Reset failed attempts
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login_at = datetime.utcnow()

        # Log successful login
        login_history.success = True
        login_history.user_id = user.id
        self.db.add(login_history)

        self.db.commit()
        self.db.refresh(user)

        # Create tokens
        access_token, refresh_token = self._create_tokens(
            user, ip_address, user_agent
        )

        return user, access_token, refresh_token

    def refresh_access_token(
        self,
        refresh_token: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> str:
        """Refresh access token using refresh token."""
        # Verify refresh token
        try:
            payload = jwt_handler.verify_refresh_token(refresh_token)
        except ValueError as e:
            raise ValueError("Invalid or expired refresh token")

        # Hash token for database lookup
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

        # Check if token exists and is not revoked
        db_token = self.db.query(RefreshToken).filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.is_revoked == False
        ).first()

        if not db_token:
            raise ValueError("Refresh token not found or revoked")

        if db_token.expires_at < datetime.utcnow():
            raise ValueError("Refresh token expired")

        # Get user
        user = self.db.query(User).filter(
            User.id == UUID(payload["user_id"])
        ).first()

        if not user or not user.is_active:
            raise ValueError("User not found or inactive")

        # Create new access token
        access_token = jwt_handler.create_access_token(
            user_id=user.id,
            organization_id=user.organization_id,
            email=user.email,
            roles=self._get_user_roles(user),
            permissions=self._get_user_permissions(user)
        )

        return access_token

    def logout(self, refresh_token: str):
        """Revoke refresh token."""
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

        db_token = self.db.query(RefreshToken).filter(
            RefreshToken.token_hash == token_hash
        ).first()

        if db_token:
            db_token.is_revoked = True
            db_token.revoked_at = datetime.utcnow()
            self.db.commit()

    def request_password_reset(self, email: str) -> str:
        """Generate password reset token."""
        user = self.db.query(User).filter(
            User.email == email.lower()
        ).first()

        if not user:
            # Don't reveal if user exists
            return "If the email exists, a password reset link has been sent"

        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expires_at = datetime.utcnow() + timedelta(hours=1)

        self.db.commit()

        # TODO: Send email with reset link
        # In production, you would send an email here

        return reset_token  # Return for development/testing

    def reset_password(self, token: str, new_password: str):
        """Reset password using token."""
        user = self.db.query(User).filter(
            User.reset_token == token
        ).first()

        if not user:
            raise ValueError("Invalid reset token")

        if user.reset_token_expires_at < datetime.utcnow():
            raise ValueError("Reset token expired")

        # Hash new password
        user.password_hash = encryption_handler.hash_password(new_password)
        user.reset_token = None
        user.reset_token_expires_at = None
        user.failed_login_attempts = 0
        user.locked_until = None

        self.db.commit()

    def verify_email(self, token: str):
        """Verify user email."""
        user = self.db.query(User).filter(
            User.verification_token == token
        ).first()

        if not user:
            raise ValueError("Invalid verification token")

        if user.verification_token_expires_at < datetime.utcnow():
            raise ValueError("Verification token expired")

        user.is_verified = True
        user.verification_token = None
        user.verification_token_expires_at = None

        self.db.commit()

    def change_password(
        self,
        user_id: UUID,
        current_password: str,
        new_password: str
    ):
        """Change user password."""
        user = self.db.query(User).filter(User.id == user_id).first()

        if not user:
            raise ValueError("User not found")

        # Verify current password
        if not encryption_handler.verify_password(current_password, user.password_hash):
            raise ValueError("Current password is incorrect")

        # Hash new password
        user.password_hash = encryption_handler.hash_password(new_password)

        self.db.commit()

    def _create_tokens(
        self,
        user: User,
        ip_address: Optional[str],
        user_agent: Optional[str]
    ) -> Tuple[str, str]:
        """Create access and refresh tokens for user."""
        # Create access token
        access_token = jwt_handler.create_access_token(
            user_id=user.id,
            organization_id=user.organization_id,
            email=user.email,
            roles=self._get_user_roles(user),
            permissions=self._get_user_permissions(user)
        )

        # Create refresh token
        refresh_token = jwt_handler.create_refresh_token(user_id=user.id)

        # Store refresh token in database
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        expires_at = datetime.utcnow() + timedelta(days=settings.jwt_refresh_token_expire_days)

        db_refresh_token = RefreshToken(
            id=uuid4(),
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent
        )

        self.db.add(db_refresh_token)
        self.db.commit()

        return access_token, refresh_token

    def _get_user_roles(self, user: User) -> list[str]:
        """Get user roles."""
        # TODO: Fetch from User Service or database
        # For now, return basic roles
        roles = ["user"]
        if user.is_superuser:
            roles.append("super_admin")
        return roles

    def _get_user_permissions(self, user: User) -> list[str]:
        """Get user permissions."""
        # TODO: Fetch from User Service or database
        # For now, return basic permissions
        if user.is_superuser:
            return ["*"]  # All permissions
        return [
            "instances:read",
            "instances:create",
            "analysis:read",
            "analysis:create",
            "insights:read"
        ]
