from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, HttpUrl


class ServiceNowConnectionRequest(BaseModel):
    instance_name: str
    instance_url: HttpUrl
    api_user: str
    api_token: str
    metadata: Optional[Dict[str, Any]] = None


class ServiceNowConnectionResponse(BaseModel):
    instance_id: UUID
    instance_name: str
    instance_url: HttpUrl
    created_at: datetime
    metadata: Dict[str, Any]
    connection_verified: bool


class ServiceNowInstanceSummary(BaseModel):
    id: UUID
    instance_name: str
    instance_url: HttpUrl
    is_active: bool
    control_count: int
    risk_count: int
    widget_count: int
    updated_at: datetime
    metadata: Dict[str, Any]


class ServiceNowListResponse(BaseModel):
    items: list[ServiceNowInstanceSummary]


class ServiceNowUpdateRequest(BaseModel):
    instance_name: Optional[str] = None
    api_user: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
