from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, HttpUrl


class InstanceOverview(BaseModel):
    instance_id: UUID
    instance_name: str
    instance_url: HttpUrl
    is_active: bool
    created_at: datetime
    updated_at: datetime
    control_count: int
    risk_count: int
    widget_count: int
    latest_analysis_type: Optional[str] = None
    latest_analysis_summary: Optional[str] = None
    latest_analysis_at: Optional[datetime] = None


class DashboardSummary(BaseModel):
    total_instances: int
    active_instances: int
    total_controls: int
    total_risks: int
    total_widgets: int
    instances: List[InstanceOverview]


class ControlDistributionItem(BaseModel):
    control_id: str
    effectiveness: float


class ControlAnalytics(BaseModel):
    total: int
    average_effectiveness: Optional[float] = None
    distribution: List[ControlDistributionItem]


class RiskPoint(BaseModel):
    risk_id: str
    likelihood: float
    impact: float
    score: float


class ComplianceGapInsight(BaseModel):
    requirement_id: str
    gap_score: float
    recommendation: str


class ComplianceAnalytics(BaseModel):
    healthy: int
    monitor: int
    exception: int
    top_gaps: List[ComplianceGapInsight]


class ExceptionItem(BaseModel):
    severity: str
    title: str
    description: str
    recommendation: str
    category: str


class ExceptionCollection(BaseModel):
    total: int
    items: List[ExceptionItem]


class TimelineEntry(BaseModel):
    analysis_type: str
    summary: str
    generated_at: datetime


class InstanceAnalytics(BaseModel):
    instance_id: UUID
    instance_name: str
    controls: ControlAnalytics
    risks: List[RiskPoint]
    compliance: ComplianceAnalytics
    exceptions: ExceptionCollection
    timeline: List[TimelineEntry]
