from functools import lru_cache
from typing import List, Optional

from pydantic import HttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    app_name: str = "ComplianceIQ Backend"
    environment: str = "local"
    debug: bool = True
    api_prefix: str = "/api/v1"
    secret_key: str = "change-me"
    access_token_header: str = "X-API-Key"
    service_account_token: str = "local-dev-token"
    admin_email: str = "admin@complianceiq.local"
    admin_password: str = "ChangeMe123!"

    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/complianceiq"
    alembic_schema: Optional[str] = None

    allowed_origins: List[str] = ["*"]

    servicenow_timeout_seconds: int = 15

    # Optional defaults for a development ServiceNow Personal Developer Instance (PDI)
    default_servicenow_instance_name: Optional[str] = 'PDI'
    default_servicenow_instance_url: Optional[HttpUrl] = 'https://dev264844.service-now.com/'
    default_servicenow_api_user: Optional[str] = 'admin'
    default_servicenow_api_token: Optional[str] = 'now_BsIs7lMrtFM6woT6YFRJlY6QknicQDWHSUVLDYeMUuLbNKbxSTfKpN8z3StsvtCnnuyJbZvxd8C2ZPEWu0pNtQ'

@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""
    return Settings()
