from fastapi import APIRouter, Depends

from app.api.dependencies import ApiSecurity, get_analysis_service
from app.schemas.analysis import (
    ComplianceAnalysisRequest,
    ComplianceAnalysisResponse,
    ControlAnalysisRequest,
    ControlAnalysisResponse,
    RiskAnalysisRequest,
    RiskAnalysisResponse,
)
from app.services.analysis import AnalysisService

router = APIRouter(prefix="/analyze", tags=["Analysis"], dependencies=[ApiSecurity])


@router.post("/controls", response_model=ControlAnalysisResponse)
def analyze_controls(
    payload: ControlAnalysisRequest,
    service: AnalysisService = Depends(get_analysis_service),
) -> ControlAnalysisResponse:
    return service.analyze_controls(payload)


@router.post("/risks", response_model=RiskAnalysisResponse)
def analyze_risks(
    payload: RiskAnalysisRequest,
    service: AnalysisService = Depends(get_analysis_service),
) -> RiskAnalysisResponse:
    return service.analyze_risks(payload)


@router.post("/compliance", response_model=ComplianceAnalysisResponse)
def analyze_compliance(
    payload: ComplianceAnalysisRequest,
    service: AnalysisService = Depends(get_analysis_service),
) -> ComplianceAnalysisResponse:
    return service.analyze_compliance(payload)
