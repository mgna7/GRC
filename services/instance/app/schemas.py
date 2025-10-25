"""Pydantic schemas for Instance Service API."""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, field_validator
from uuid import UUID


class InstanceBase(BaseModel):
    """Base schema for instance."""
    name: str = Field(..., min_length=1, max_length=255)
    url: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    auth_type: str = Field(..., pattern="^(oauth|basic)$")

    @field_validator('url')
    @classmethod
    def validate_url(cls, v: str) -> str:
        """Validate ServiceNow URL format."""
        v = v.strip()
        if not v.startswith(('http://', 'https://')):
            v = f'https://{v}'
        if not v.endswith('.service-now.com') and 'service-now.com' not in v:
            raise ValueError('URL must be a ServiceNow domain')
        return v


class InstanceCreate(InstanceBase):
    """Schema for creating an instance."""
    username: Optional[str] = None
    password: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None

    @field_validator('username')
    @classmethod
    def validate_basic_auth(cls, v: Optional[str], info) -> Optional[str]:
        """Validate basic auth credentials are provided."""
        if info.data.get('auth_type') == 'basic' and not v:
            raise ValueError('Username required for basic auth')
        return v

    @field_validator('client_id')
    @classmethod
    def validate_oauth(cls, v: Optional[str], info) -> Optional[str]:
        """Validate OAuth credentials are provided."""
        if info.data.get('auth_type') == 'oauth' and not v:
            raise ValueError('Client ID required for OAuth')
        return v


class InstanceUpdate(BaseModel):
    """Schema for updating an instance."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    url: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(active|inactive|error)$")
    username: Optional[str] = None
    password: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None


class InstanceResponse(InstanceBase):
    """Schema for instance response."""
    id: UUID
    status: str
    organization_id: UUID
    last_sync_at: Optional[datetime] = None
    last_connection_test_at: Optional[datetime] = None
    connection_status: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InstanceListResponse(BaseModel):
    """Schema for list of instances."""
    instances: list[InstanceResponse]
    total: int


class ConnectionTestRequest(BaseModel):
    """Schema for connection test request."""
    url: str
    auth_type: str = Field(..., pattern="^(oauth|basic)$")
    username: Optional[str] = None
    password: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None


class ConnectionTestResponse(BaseModel):
    """Schema for connection test response."""
    success: bool
    message: str
    details: Optional[Dict[str, Any]] = None


class SyncRequest(BaseModel):
    """Schema for sync request."""
    sync_type: str = Field(default='manual', pattern="^(manual|scheduled|automatic)$")


class SyncResponse(BaseModel):
    """Schema for sync response."""
    sync_id: UUID
    status: str
    message: str
    started_at: datetime
