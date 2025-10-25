"""JWT token utilities shared across services."""

import os
from datetime import datetime, timedelta
from typing import Any, Optional
from uuid import UUID

import jwt
from jwt import DecodeError, ExpiredSignatureError, InvalidTokenError


class JWTHandler:
    """Handle JWT token encoding and decoding."""

    def __init__(
        self,
        secret_key: Optional[str] = None,
        algorithm: str = "HS256",
        access_token_expire_minutes: int = 15,
        refresh_token_expire_days: int = 7
    ):
        self.secret_key = secret_key or os.getenv("JWT_SECRET_KEY", "change-me-in-production")
        self.algorithm = algorithm
        self.access_token_expire_minutes = access_token_expire_minutes
        self.refresh_token_expire_days = refresh_token_expire_days

    def create_access_token(
        self,
        user_id: UUID,
        organization_id: UUID,
        email: str,
        roles: list[str],
        permissions: list[str],
        **extra_data
    ) -> str:
        """Create JWT access token."""
        expires_delta = timedelta(minutes=self.access_token_expire_minutes)
        expire = datetime.utcnow() + expires_delta

        payload = {
            "user_id": str(user_id),
            "organization_id": str(organization_id),
            "email": email,
            "roles": roles,
            "permissions": permissions,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access",
            **extra_data
        }

        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def create_refresh_token(self, user_id: UUID) -> str:
        """Create JWT refresh token."""
        expires_delta = timedelta(days=self.refresh_token_expire_days)
        expire = datetime.utcnow() + expires_delta

        payload = {
            "user_id": str(user_id),
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        }

        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def decode_token(self, token: str) -> dict[str, Any]:
        """Decode and validate JWT token."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except ExpiredSignatureError:
            raise ValueError("Token has expired")
        except DecodeError:
            raise ValueError("Invalid token format")
        except InvalidTokenError:
            raise ValueError("Invalid token")

    def verify_access_token(self, token: str) -> dict[str, Any]:
        """Verify access token and return payload."""
        payload = self.decode_token(token)

        if payload.get("type") != "access":
            raise ValueError("Invalid token type")

        return payload

    def verify_refresh_token(self, token: str) -> dict[str, Any]:
        """Verify refresh token and return payload."""
        payload = self.decode_token(token)

        if payload.get("type") != "refresh":
            raise ValueError("Invalid token type")

        return payload


# Global JWT handler instance
jwt_handler = JWTHandler()
