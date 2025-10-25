from fastapi import Header, HTTPException, Request, status

from .config import get_settings


def authenticate_admin(email: str, password: str) -> bool:
    settings = get_settings()
    return email.lower() == settings.admin_email.lower() and password == settings.admin_password


async def verify_request(
    request: Request,
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
) -> None:
    """Allow access when either a valid session exists or an API key is provided."""
    settings = get_settings()

    if request.session.get("user"):
        return

    if x_api_key and x_api_key == settings.service_account_token:
        return

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required.",
    )


def require_session(request: Request) -> dict:
    user = request.session.get("user")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login required.",
        )
    return user
