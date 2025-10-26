"""Business logic for Instance Service."""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

from sqlalchemy.exc import IntegrityError
import httpx
from sqlalchemy.orm import Session

from app.config import get_settings
from app.integrations.servicenow_client import ServiceNowClient
from app.models import InstanceDataset, InstanceSyncHistory, ServiceNowInstance
from app.schemas import ConnectionTestRequest, InstanceCreate, InstanceUpdate
from app.sync_manager import InstanceSyncManager
from shared.utils.encryption import encryption_handler

settings = get_settings()


class InstanceService:
    """Service for managing ServiceNow instances."""

    def __init__(self, db: Session):
        self.db = db

    # -------------------------------------------------------------------------
    # Credential helpers
    # -------------------------------------------------------------------------
    def _encrypt_credentials(self, auth_type: str, **credentials) -> dict:
        if auth_type == "basic":
            return {
                "type": "basic",
                "username": credentials.get("username"),
                "password": encryption_handler.encrypt(credentials.get("password")),
            }
        if auth_type == "oauth":
            return {
                "type": "oauth",
                "client_id": credentials.get("client_id"),
                "client_secret": encryption_handler.encrypt(credentials.get("client_secret")),
            }
        raise ValueError(f"Unsupported auth type: {auth_type}")

    def _decrypt_credentials(self, credentials: dict) -> dict:
        decrypted = credentials.copy()
        if credentials.get("type") == "basic" and credentials.get("password"):
            decrypted["password"] = encryption_handler.decrypt(credentials["password"])
        if credentials.get("type") == "oauth" and credentials.get("client_secret"):
            decrypted["client_secret"] = encryption_handler.decrypt(credentials["client_secret"])
        return decrypted

    def _build_client(self, url: str, auth_type: str, credentials: dict) -> ServiceNowClient:
        return ServiceNowClient(url, auth_type, credentials, settings)

    # -------------------------------------------------------------------------
    # CRUD operations
    # -------------------------------------------------------------------------
    def create_instance(self, organization_id: UUID, instance_data: InstanceCreate) -> ServiceNowInstance:
        credentials = self._encrypt_credentials(
            instance_data.auth_type,
            username=instance_data.username,
            password=instance_data.password,
            client_id=instance_data.client_id,
            client_secret=instance_data.client_secret,
        )

        instance = ServiceNowInstance(
            name=instance_data.name,
            url=instance_data.url,
            description=instance_data.description,
            auth_type=instance_data.auth_type,
            credentials=credentials,
            status="active",
            organization_id=organization_id,
        )

        try:
            self.db.add(instance)
            self.db.commit()
            self.db.refresh(instance)
            return instance
        except IntegrityError as exc:
            self.db.rollback()
            raise ValueError(f"Failed to create instance: {str(exc)}") from exc

    def get_instance(self, instance_id: UUID, organization_id: UUID) -> Optional[ServiceNowInstance]:
        return (
            self.db.query(ServiceNowInstance)
            .filter(ServiceNowInstance.id == instance_id, ServiceNowInstance.organization_id == organization_id)
            .first()
        )

    def list_instances(self, organization_id: UUID) -> List[ServiceNowInstance]:
        return (
            self.db.query(ServiceNowInstance)
            .filter(ServiceNowInstance.organization_id == organization_id)
            .order_by(ServiceNowInstance.created_at.desc())
            .all()
        )

    def update_instance(
        self,
        instance_id: UUID,
        organization_id: UUID,
        instance_data: InstanceUpdate,
    ) -> Optional[ServiceNowInstance]:
        instance = self.get_instance(instance_id, organization_id)
        if not instance:
            return None

        if instance_data.name is not None:
            instance.name = instance_data.name
        if instance_data.url is not None:
            instance.url = instance_data.url
        if instance_data.description is not None:
            instance.description = instance_data.description
        if instance_data.status is not None:
            instance.status = instance_data.status

        if any([instance_data.username, instance_data.password, instance_data.client_id, instance_data.client_secret]):
            credentials = self._encrypt_credentials(
                instance.auth_type,
                username=instance_data.username or instance.credentials.get("username"),
                password=instance_data.password,
                client_id=instance_data.client_id or instance.credentials.get("client_id"),
                client_secret=instance_data.client_secret,
            )
            instance.credentials = credentials

        try:
            self.db.commit()
            self.db.refresh(instance)
            return instance
        except IntegrityError as exc:
            self.db.rollback()
            raise ValueError(f"Failed to update instance: {str(exc)}") from exc

    def delete_instance(self, instance_id: UUID, organization_id: UUID) -> bool:
        instance = self.get_instance(instance_id, organization_id)
        if not instance:
            return False
        try:
            self.db.delete(instance)
            self.db.commit()
            return True
        except Exception as exc:  # pylint: disable=broad-except
            self.db.rollback()
            raise ValueError(f"Failed to delete instance: {str(exc)}") from exc

    # -------------------------------------------------------------------------
    # Connection + sync
    # -------------------------------------------------------------------------
    def test_credentials(self, request_data: ConnectionTestRequest) -> Dict[str, Any]:
        credentials = {
            "username": request_data.username,
            "password": request_data.password,
            "client_id": request_data.client_id,
            "client_secret": request_data.client_secret,
        }
        try:
            with self._build_client(request_data.url, request_data.auth_type, credentials) as client:
                result = client.ping()
                return {
                    "success": True,
                    "message": "Connection verified",
                    "details": result,
                }
        except (httpx.HTTPStatusError, httpx.RequestError) as exc:
            raise ValueError(f"ServiceNow connection failed: {str(exc)}") from exc

    def test_connection(self, instance_id: UUID, organization_id: UUID) -> Dict[str, Any]:
        instance = self.get_instance(instance_id, organization_id)
        if not instance:
            raise ValueError("Instance not found")

        credentials = self._decrypt_credentials(instance.credentials)
        instance.last_connection_test_at = datetime.utcnow()

        try:
            with self._build_client(instance.url, instance.auth_type, credentials) as client:
                result = client.ping()
            instance.connection_status = "success"
            instance.error_message = None
            self.db.commit()
            return {
                "success": True,
                "message": "Connection test successful",
                "details": result,
            }
        except (httpx.HTTPStatusError, httpx.RequestError) as exc:
            instance.connection_status = "failed"
            instance.error_message = str(exc)
            self.db.commit()
            return {
                "success": False,
                "message": f"Connection test failed: {str(exc)}",
            }
        except Exception as exc:  # pylint: disable=broad-except
            instance.connection_status = "failed"
            instance.error_message = str(exc)
            self.db.commit()
            return {
                "success": False,
                "message": f"Connection test failed: {str(exc)}",
            }

    def sync_instance(self, instance_id: UUID, organization_id: UUID, sync_type: str = "manual") -> InstanceSyncHistory:
        instance = self.get_instance(instance_id, organization_id)
        if not instance:
            raise ValueError("Instance not found")

        sync_history = InstanceSyncHistory(
            instance_id=instance_id,
            sync_type=sync_type,
            status="running",
            started_at=datetime.utcnow(),
        )
        self.db.add(sync_history)
        instance.last_sync_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(sync_history)

        credentials = self._decrypt_credentials(instance.credentials)
        dataset_summary: Dict[str, int] = {}

        try:
            with self._build_client(instance.url, instance.auth_type, credentials) as client:
                manager = InstanceSyncManager(client, settings)
                payload = manager.collect()

            for dataset, records in payload.items():
                dataset_summary[dataset] = len(records)
                self._upsert_dataset(instance_id, dataset, records)

            sync_history.status = "completed"
            sync_history.completed_at = datetime.utcnow()
            sync_history.records_synced = json.dumps(dataset_summary)
            self.db.commit()
            self.db.refresh(sync_history)
            return sync_history
        except (httpx.HTTPStatusError, httpx.RequestError) as exc:
            sync_history.status = "failed"
            sync_history.completed_at = datetime.utcnow()
            sync_history.error_message = str(exc)
            self.db.commit()
            self.db.refresh(sync_history)
            raise ValueError(f"ServiceNow API error: {str(exc)}") from exc
        except Exception as exc:  # pylint: disable=broad-except
            sync_history.status = "failed"
            sync_history.completed_at = datetime.utcnow()
            sync_history.error_message = str(exc)
            self.db.commit()
            self.db.refresh(sync_history)
            raise

    # -------------------------------------------------------------------------
    # Dataset helpers
    # -------------------------------------------------------------------------
    def _upsert_dataset(self, instance_id: UUID, dataset_type: str, payload: List[dict]):
        dataset = (
            self.db.query(InstanceDataset)
            .filter(InstanceDataset.instance_id == instance_id, InstanceDataset.dataset_type == dataset_type)
            .first()
        )
        record_count = len(payload)
        now = datetime.utcnow()

        if dataset:
            dataset.payload = payload
            dataset.record_count = record_count
            dataset.last_synced_at = now
        else:
            dataset = InstanceDataset(
                id=uuid4(),
                instance_id=instance_id,
                dataset_type=dataset_type,
                payload=payload,
                record_count=record_count,
                last_synced_at=now,
            )
            self.db.add(dataset)
        self.db.commit()

    def list_datasets(self, instance_id: UUID, organization_id: UUID) -> List[InstanceDataset]:
        instance = self.get_instance(instance_id, organization_id)
        if not instance:
            raise ValueError("Instance not found")
        return (
            self.db.query(InstanceDataset)
            .filter(InstanceDataset.instance_id == instance.id)
            .order_by(InstanceDataset.dataset_type.asc())
            .all()
        )
