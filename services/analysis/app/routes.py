"""API routes for Analysis Service."""

from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from typing import Optional
from datetime import datetime

from app.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisStatusResponse,
    AnalysisListResponse
)
from app.tasks import analyze_controls, analyze_risks, analyze_compliance

router = APIRouter(prefix="/api/v1/analysis", tags=["Analysis"])


@router.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_analysis(request: AnalysisRequest):
    """Create and start a new analysis."""
    try:
        # Generate analysis ID
        analysis_id = UUID('12345678-1234-5678-1234-567812345678')  # TODO: Generate proper UUID

        # Start appropriate analysis task based on type
        if request.analysis_type in ['comprehensive', 'control']:
            # Start control analysis task
            task = analyze_controls.delay(
                str(request.instance_id),
                []  # Controls will be fetched from instance
            )
        elif request.analysis_type == 'risk':
            # Start risk analysis task
            task = analyze_risks.delay(
                str(request.instance_id),
                []  # Risks will be fetched from instance
            )
        elif request.analysis_type == 'compliance':
            # Start compliance analysis task
            task = analyze_compliance.delay(
                str(request.instance_id),
                []  # Compliance data will be fetched from instance
            )
        else:
            # Default to comprehensive
            task = analyze_controls.delay(
                str(request.instance_id),
                []
            )

        return AnalysisResponse(
            id=analysis_id,
            instance_id=request.instance_id,
            analysis_type=request.analysis_type,
            status='pending',
            task_id=task.id,
            created_at=datetime.utcnow(),
            message='Analysis started successfully'
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Failed to start analysis: {str(e)}'
        )


@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: UUID):
    """Get analysis by ID."""
    # TODO: Implement actual database lookup
    return AnalysisResponse(
        id=analysis_id,
        instance_id=UUID('00000000-0000-0000-0000-000000000000'),
        analysis_type='comprehensive',
        status='completed',
        task_id='task-123',
        created_at=datetime.utcnow(),
        message='Analysis completed successfully'
    )


@router.get("/{analysis_id}/status", response_model=AnalysisStatusResponse)
async def get_analysis_status(analysis_id: UUID):
    """Get analysis status."""
    return AnalysisStatusResponse(
        id=analysis_id,
        status='completed',
        progress=100,
        message='Analysis completed'
    )


@router.get("/{analysis_id}/results")
async def get_analysis_results(analysis_id: UUID):
    """Get analysis results."""
    return {
        'analysis_id': str(analysis_id),
        'status': 'completed',
        'results': {
            'controls': [],
            'risks': [],
            'compliance': []
        }
    }


@router.get("", response_model=AnalysisListResponse)
async def list_analyses(
    instance_id: Optional[UUID] = None,
    limit: int = 10
):
    """List all analyses."""
    return AnalysisListResponse(
        analyses=[],
        total=0
    )
