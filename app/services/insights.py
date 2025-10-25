from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models import AnalysisResult, ServiceNowInstance
from app.schemas.insights import InsightPayload, InsightsResponse


class InsightService:
    """Read and format cached analysis results."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_insights(self, instance_id: UUID) -> InsightsResponse:
        instance = self.db.get(ServiceNowInstance, instance_id)
        if not instance:
            raise AppError("ServiceNow instance not found.", status_code=404)

        stmt = (
            select(AnalysisResult)
            .where(AnalysisResult.instance_id == instance_id)
            .order_by(AnalysisResult.generated_at.desc())
        )
        results = self.db.scalars(stmt).all()
        insights = [
            InsightPayload(
                analysis_type=result.analysis_type,
                summary=result.summary,
                payload=result.payload,
                generated_at=result.generated_at,
            )
            for result in results
        ]
        return InsightsResponse(instance_id=instance_id, insights=insights)
