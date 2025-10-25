import hashlib
from datetime import datetime, timezone
from typing import Any, Dict
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import AppError
from app.models import ServiceNowInstance


class ServiceNowConnector:
    """Manage ServiceNow connections and health checks."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.settings = get_settings()

    def _hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    def _simulate_connection(self, instance_url: str, api_user: str, api_token: str) -> bool:
        # Placeholder for real ServiceNow auth; in tests we just ensure fields exist.
        return all([instance_url, api_user, api_token])

    def create_or_update_instance(
        self,
        *,
        instance_name: str,
        instance_url: str,
        api_user: str,
        api_token: str,
        metadata: Dict[str, Any] | None = None,
    ) -> tuple[ServiceNowInstance, bool]:
        metadata = metadata or {}
        connection_ok = self._simulate_connection(instance_url, api_user, api_token)
        if not connection_ok:
            raise AppError("Unable to authenticate with the ServiceNow instance.")

        stmt = select(ServiceNowInstance).where(ServiceNowInstance.instance_url == instance_url)
        existing = self.db.execute(stmt).scalar_one_or_none()
        now = datetime.now(tz=timezone.utc)
        token_hash = self._hash_token(api_token)

        if existing:
            existing.instance_name = instance_name
            existing.api_user = api_user
            existing.api_token_hash = token_hash
            existing.instance_metadata = metadata
            existing.updated_at = now
            instance = existing
        else:
            instance = ServiceNowInstance(
                instance_name=instance_name,
                instance_url=instance_url,
                api_user=api_user,
                api_token_hash=token_hash,
                instance_metadata=metadata,
                created_at=now,
                updated_at=now,
            )
            self.db.add(instance)

        self.db.commit()
        self.db.refresh(instance)
        return instance, connection_ok

    def get_instance(self, instance_id: UUID) -> ServiceNowInstance:
        instance = self.db.get(ServiceNowInstance, instance_id)
        if not instance:
            raise AppError("ServiceNow instance not found.", status_code=404)
        return instance

    def list_instances(self) -> list[ServiceNowInstance]:
        stmt = select(ServiceNowInstance).order_by(ServiceNowInstance.created_at.asc())
        return self.db.scalars(stmt).all()

    def update_instance(
        self,
        instance_id: UUID,
        *,
        instance_name: str | None = None,
        api_user: str | None = None,
        metadata: Dict[str, Any] | None = None,
        is_active: bool | None = None,
    ) -> ServiceNowInstance:
        instance = self.get_instance(instance_id)
        now = datetime.now(tz=timezone.utc)

        if instance_name is not None:
            instance.instance_name = instance_name
        if api_user is not None:
            instance.api_user = api_user
        if metadata is not None:
            instance.instance_metadata = metadata
        if is_active is not None:
            instance.is_active = is_active

        instance.updated_at = now
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def delete_instance(self, instance_id: UUID) -> None:
        instance = self.get_instance(instance_id)
        self.db.delete(instance)
        self.db.commit()
