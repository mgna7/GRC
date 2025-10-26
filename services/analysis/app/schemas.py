"""Pydantic schemas for Analysis Service."""

from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, List
from datetime import datetime


class AnalysisRequest(BaseModel):
    """Schema for creating an analysis."""
    instance_id: UUID
    analysis_type: str = Field(..., pattern="^(comprehensive|risk|compliance|control)$")
    modules: Optional[List[str]] = None
    title: Optional[str] = None
    description: Optional[str] = None


class AnalysisResponse(BaseModel):
    """Schema for analysis response."""
    id: UUID
    instance_id: UUID
    analysis_type: str
    status: str  # pending, running, completed, failed
    task_id: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    message: str
    title: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True


class AnalysisStatusResponse(BaseModel):
    """Schema for analysis status."""
    id: UUID
    status: str
    progress: int = 0  # 0-100
    message: Optional[str] = None


class AnalysisListResponse(BaseModel):
    """Schema for list of analyses."""
    analyses: List[AnalysisResponse]
    total: int
