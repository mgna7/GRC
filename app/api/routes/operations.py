from uuid import UUID

from fastapi import APIRouter, Depends, Path

from app.api.dependencies import ApiSecurity, get_operations_service
from app.schemas.analysis import ControlAnalysisResponse, RiskAnalysisResponse
from app.services.operations import OperationsService

router = APIRouter(prefix="/operations", tags=["Operations"], dependencies=[ApiSecurity])


@router.post("/{instance_id}/controls/replay", response_model=ControlAnalysisResponse)
def replay_control_analysis(
    instance_id: UUID = Path(..., description="Identifier of the ServiceNow instance."),
    service: OperationsService = Depends(get_operations_service),
) -> ControlAnalysisResponse:
    return service.trigger_control_analysis(instance_id)


@router.post("/{instance_id}/risks/replay", response_model=RiskAnalysisResponse)
def replay_risk_analysis(
    instance_id: UUID = Path(..., description="Identifier of the ServiceNow instance."),
    service: OperationsService = Depends(get_operations_service),
) -> RiskAnalysisResponse:
    return service.trigger_risk_analysis(instance_id)
