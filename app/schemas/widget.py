from datetime import datetime
from typing import Any, Dict, List
from uuid import UUID

from pydantic import BaseModel


class WidgetConfigRequest(BaseModel):
    instance_id: UUID
    widgets: List[Dict[str, Any]]


class WidgetConfigResponse(BaseModel):
    instance_id: UUID
    pushed_at: datetime
    widgets: List[Dict[str, Any]]
