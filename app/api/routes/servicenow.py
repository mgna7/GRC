from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.api.dependencies import ApiSecurity, get_servicenow_connector
from app.schemas.servicenow import (
    ServiceNowConnectionRequest,
    ServiceNowConnectionResponse,
    ServiceNowInstanceSummary,
    ServiceNowListResponse,
    ServiceNowUpdateRequest,
)
from app.services.servicenow_connector import ServiceNowConnector

router = APIRouter(prefix="/servicenow", tags=["ServiceNow"], dependencies=[ApiSecurity])


@router.post("/connect", response_model=ServiceNowConnectionResponse)
def connect_servicenow(
    payload: ServiceNowConnectionRequest,
    connector: ServiceNowConnector = Depends(get_servicenow_connector),
) -> ServiceNowConnectionResponse:
    instance, verified = connector.create_or_update_instance(
        instance_name=payload.instance_name,
        instance_url=str(payload.instance_url),
        api_user=payload.api_user,
        api_token=payload.api_token,
        metadata=payload.metadata,
    )
    return ServiceNowConnectionResponse(
        instance_id=instance.id,
        instance_name=instance.instance_name,
        instance_url=instance.instance_url,
        created_at=instance.created_at,
        metadata=instance.instance_metadata,
        connection_verified=verified,
    )


@router.get("", response_model=ServiceNowListResponse)
def list_instances(
    connector: ServiceNowConnector = Depends(get_servicenow_connector),
) -> ServiceNowListResponse:
    instances = connector.list_instances()
    items = [
        ServiceNowInstanceSummary(
            id=instance.id,
            instance_name=instance.instance_name,
            instance_url=instance.instance_url,
            is_active=instance.is_active,
            control_count=len(instance.control_records or []),
            risk_count=len(instance.risk_records or []),
            widget_count=len(instance.widget_configurations or []),
            updated_at=instance.updated_at,
            metadata=instance.instance_metadata,
        )
        for instance in instances
    ]
    return ServiceNowListResponse(items=items)


@router.patch("/{instance_id}", response_model=ServiceNowInstanceSummary)
def update_instance(
    payload: ServiceNowUpdateRequest,
    instance_id: UUID = Path(..., description="Identifier of the ServiceNow instance."),
    connector: ServiceNowConnector = Depends(get_servicenow_connector),
) -> ServiceNowInstanceSummary:
    if payload.model_dump(exclude_unset=True) == {}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No changes supplied.")
    instance = connector.update_instance(
        instance_id=instance_id,
        instance_name=payload.instance_name,
        api_user=payload.api_user,
        metadata=payload.metadata,
        is_active=payload.is_active,
    )
    return ServiceNowInstanceSummary(
        id=instance.id,
        instance_name=instance.instance_name,
        instance_url=instance.instance_url,
        is_active=instance.is_active,
        control_count=len(instance.control_records or []),
        risk_count=len(instance.risk_records or []),
        widget_count=len(instance.widget_configurations or []),
        updated_at=instance.updated_at,
        metadata=instance.instance_metadata,
    )


@router.delete("/{instance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_instance(
    instance_id: UUID = Path(..., description="Identifier of the ServiceNow instance."),
    connector: ServiceNowConnector = Depends(get_servicenow_connector),
) -> None:
    connector.delete_instance(instance_id)
