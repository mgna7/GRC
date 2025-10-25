from datetime import datetime
from typing import Any, Dict, List
from uuid import UUID

from pydantic import BaseModel


class InsightPayload(BaseModel):
    analysis_type: str
    summary: str
    payload: Dict[str, Any]
    generated_at: datetime


class InsightsResponse(BaseModel):
    instance_id: UUID
    insights: List[InsightPayload]
