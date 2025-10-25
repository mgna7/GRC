from uuid import UUID

from fastapi import APIRouter, Depends, Path

from app.api.dependencies import ApiSecurity, get_insight_service
from app.schemas.insights import InsightsResponse
from app.services.insights import InsightService

router = APIRouter(prefix="/insights", tags=["Insights"], dependencies=[ApiSecurity])


@router.get("/{instance_id}", response_model=InsightsResponse)
def get_insights(
    instance_id: UUID = Path(..., description="Identifier of the ServiceNow instance."),
    service: InsightService = Depends(get_insight_service),
) -> InsightsResponse:
    return service.get_insights(instance_id)
