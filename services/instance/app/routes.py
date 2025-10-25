"""API routes for Instance Service."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.schemas import (
    InstanceCreate,
    InstanceUpdate,
    InstanceResponse,
    ConnectionTestResponse,
    SyncRequest,
    SyncResponse
)
from app.service import InstanceService
from app.auth import get_current_user, get_current_organization_id

router = APIRouter(prefix="/api/v1/instances", tags=["Instances"])


@router.post("", response_model=InstanceResponse, status_code=status.HTTP_201_CREATED)
async def create_instance(
    instance_data: InstanceCreate,
    db: Session = Depends(get_db),
    organization_id: UUID = Depends(get_current_organization_id)
):
    """Create a new ServiceNow instance."""
    service = InstanceService(db)
    try:
        instance = service.create_instance(organization_id, instance_data)
        return instance
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=List[InstanceResponse])
async def list_instances(
    db: Session = Depends(get_db),
    organization_id: UUID = Depends(get_current_organization_id)
):
    """List all ServiceNow instances for the organization."""
    service = InstanceService(db)
    instances = service.list_instances(organization_id)
    return instances


@router.get("/{instance_id}", response_model=InstanceResponse)
async def get_instance(
    instance_id: UUID,
    db: Session = Depends(get_db),
    organization_id: UUID = Depends(get_current_organization_id)
):
    """Get a specific ServiceNow instance."""
    service = InstanceService(db)
    instance = service.get_instance(instance_id, organization_id)
    if not instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instance not found"
        )
    return instance


@router.put("/{instance_id}", response_model=InstanceResponse)
async def update_instance(
    instance_id: UUID,
    instance_data: InstanceUpdate,
    db: Session = Depends(get_db),
    organization_id: UUID = Depends(get_current_organization_id)
):
    """Update a ServiceNow instance."""
    service = InstanceService(db)
    try:
        instance = service.update_instance(instance_id, organization_id, instance_data)
        if not instance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Instance not found"
            )
        return instance
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{instance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_instance(
    instance_id: UUID,
    db: Session = Depends(get_db),
    organization_id: UUID = Depends(get_current_organization_id)
):
    """Delete a ServiceNow instance."""
    service = InstanceService(db)
    try:
        deleted = service.delete_instance(instance_id, organization_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Instance not found"
            )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{instance_id}/test", response_model=ConnectionTestResponse)
async def test_connection(
    instance_id: UUID,
    db: Session = Depends(get_db),
    organization_id: UUID = Depends(get_current_organization_id)
):
    """Test connection to a ServiceNow instance."""
    service = InstanceService(db)
    try:
        result = service.test_connection(instance_id, organization_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{instance_id}/sync", response_model=SyncResponse)
async def sync_instance(
    instance_id: UUID,
    sync_request: SyncRequest = SyncRequest(),
    db: Session = Depends(get_db),
    organization_id: UUID = Depends(get_current_organization_id)
):
    """Initiate data synchronization from ServiceNow instance."""
    service = InstanceService(db)
    try:
        sync_history = service.sync_instance(instance_id, organization_id, sync_request.sync_type)
        return SyncResponse(
            sync_id=sync_history.id,
            status=sync_history.status,
            message="Sync initiated successfully",
            started_at=sync_history.started_at
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
