from datetime import datetime, timezone
from typing import List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models import ControlData, RiskData
from app.schemas.analysis import (
    ControlAnalysisRequest,
    ControlAnalysisResponse,
    ControlRecord,
    RiskAnalysisRequest,
    RiskAnalysisResponse,
    RiskRecord,
)
from .analysis import AnalysisService


class OperationsService:
    """Trigger AI analyses using previously synced data."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.analysis_service = AnalysisService(db)

    def _load_controls(self, instance_id: UUID) -> List[ControlRecord]:
        stmt = select(ControlData).where(ControlData.instance_id == instance_id)
        controls = self.db.scalars(stmt).all()
        if not controls:
            raise AppError("No control data available for this instance.", status_code=404)
        return [
            ControlRecord(
                control_id=control.control_id,
                name=control.name,
                description=control.description,
                attributes=control.attributes,
            )
            for control in controls
        ]

    def _load_risks(self, instance_id: UUID) -> List[RiskRecord]:
        stmt = select(RiskData).where(RiskData.instance_id == instance_id)
        risks = self.db.scalars(stmt).all()
        if not risks:
            raise AppError("No risk data available for this instance.", status_code=404)
        return [
            RiskRecord(
                risk_id=risk.risk_id,
                category=risk.category,
                description=risk.description,
                attributes=risk.attributes,
            )
            for risk in risks
        ]

    def trigger_control_analysis(self, instance_id: UUID) -> ControlAnalysisResponse:
        control_records = self._load_controls(instance_id)
        request = ControlAnalysisRequest(instance_id=instance_id, controls=control_records)
        return self.analysis_service.analyze_controls(request)

    def trigger_risk_analysis(self, instance_id: UUID) -> RiskAnalysisResponse:
        risk_records = self._load_risks(instance_id)
        request = RiskAnalysisRequest(instance_id=instance_id, risks=risk_records)
        return self.analysis_service.analyze_risks(request)
