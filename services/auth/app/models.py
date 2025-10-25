"""Database models for Auth Service."""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, String, Integer, Index, func
from sqlalchemy.dialects.postgresql import UUID

from shared.utils.database import Base, UUIDMixin, TimestampMixin


class User(Base, UUIDMixin, TimestampMixin):
    """User model."""

    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Password reset
    reset_token = Column(String(255), nullable=True, index=True)
    reset_token_expires_at = Column(DateTime(timezone=True), nullable=True)

    # Email verification
    verification_token = Column(String(255), nullable=True, index=True)
    verification_token_expires_at = Column(DateTime(timezone=True), nullable=True)

    # Account locking
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index('ix_users_email_lower', func.lower(email)),
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class RefreshToken(Base, UUIDMixin):
    """Refresh token model for token rotation."""

    __tablename__ = "refresh_tokens"

    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    token_hash = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    user_agent = Column(String(500), nullable=True)
    ip_address = Column(String(45), nullable=True)

    def __repr__(self):
        return f"<RefreshToken(id={self.id}, user_id={self.user_id})>"


class LoginHistory(Base, UUIDMixin):
    """Login history for audit trail."""

    __tablename__ = "login_history"

    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    success = Column(Boolean, nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    failure_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self):
        return f"<LoginHistory(id={self.id}, user_id={self.user_id}, success={self.success})>"
