"""Authentication middleware for microservices."""

from typing import Optional
from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from shared.models.common import UserContext
from shared.utils.jwt import jwt_handler


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserContext:
    """Extract and validate user from JWT token."""
    token = credentials.credentials

    try:
        payload = jwt_handler.verify_access_token(token)

        user_context = UserContext(
            user_id=UUID(payload["user_id"]),
            organization_id=UUID(payload["organization_id"]),
            email=payload["email"],
            roles=payload.get("roles", []),
            permissions=payload.get("permissions", [])
        )

        return user_context

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_user(
    authorization: Optional[str] = Header(None)
) -> Optional[UserContext]:
    """Get user from token if present, otherwise return None."""
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.replace("Bearer ", "")

    try:
        payload = jwt_handler.verify_access_token(token)
        return UserContext(
            user_id=UUID(payload["user_id"]),
            organization_id=UUID(payload["organization_id"]),
            email=payload["email"],
            roles=payload.get("roles", []),
            permissions=payload.get("permissions", [])
        )
    except:
        return None


def require_permission(permission: str):
    """Dependency to require specific permission."""
    async def permission_checker(user: UserContext = Depends(get_current_user)) -> UserContext:
        if not user.has_permission(permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' required"
            )
        return user
    return permission_checker


def require_role(role: str):
    """Dependency to require specific role."""
    async def role_checker(user: UserContext = Depends(get_current_user)) -> UserContext:
        if not user.has_role(role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{role}' required"
            )
        return user
    return role_checker


def require_admin(user: UserContext = Depends(get_current_user)) -> UserContext:
    """Dependency to require admin role."""
    if not user.is_admin():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user
