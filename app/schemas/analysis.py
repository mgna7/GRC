from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ControlRecord(BaseModel):
    control_id: str
    name: str
    description: Optional[str] = None
    attributes: Dict[str, Any] = Field(default_factory=dict)


class ControlAnalysisRequest(BaseModel):
    instance_id: UUID
    controls: List[ControlRecord]


class ControlEffectivenessScore(BaseModel):
    control_id: str
    effectiveness: float
    commentary: str


class ControlAnalysisResponse(BaseModel):
    instance_id: UUID
    generated_at: datetime
    scores: List[ControlEffectivenessScore]
    summary: str


class RiskRecord(BaseModel):
    risk_id: str
    category: str
    description: Optional[str] = None
    attributes: Dict[str, Any] = Field(default_factory=dict)


class RiskAnalysisRequest(BaseModel):
    instance_id: UUID
    risks: List[RiskRecord]


class RiskInsight(BaseModel):
    risk_id: str
    correlated_controls: List[str]
    likelihood: float
    impact: float
    narrative: str


class RiskAnalysisResponse(BaseModel):
    instance_id: UUID
    generated_at: datetime
    insights: List[RiskInsight]
    summary: str


class ComplianceRecord(BaseModel):
    requirement_id: str
    requirement_text: str
    status: Optional[str] = "unknown"
    evidence: Dict[str, Any] = Field(default_factory=dict)


class ComplianceAnalysisRequest(BaseModel):
    instance_id: UUID
    framework: str
    requirements: List[ComplianceRecord]


class ComplianceGap(BaseModel):
    requirement_id: str
    gap_score: float
    recommendation: str


class ComplianceAnalysisResponse(BaseModel):
    instance_id: UUID
    framework: str
    generated_at: datetime
    gaps: List[ComplianceGap]
    summary: str
