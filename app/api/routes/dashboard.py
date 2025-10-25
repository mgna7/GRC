from uuid import UUID

from fastapi import APIRouter, Depends, Path

from app.api.dependencies import ApiSecurity, get_dashboard_service
from app.schemas.dashboard import DashboardSummary, InstanceAnalytics
from app.services.dashboard import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"], dependencies=[ApiSecurity])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    service: DashboardService = Depends(get_dashboard_service),
) -> DashboardSummary:
    return service.get_summary()


@router.get("/instances/{instance_id}/metrics", response_model=InstanceAnalytics)
def get_instance_metrics(
    instance_id: UUID = Path(..., description="Identifier of the ServiceNow instance."),
    service: DashboardService = Depends(get_dashboard_service),
) -> InstanceAnalytics:
    return service.get_instance_analytics(instance_id)
