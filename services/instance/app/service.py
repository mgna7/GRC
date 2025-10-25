"""Business logic for Instance Service."""

import json
from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models import ServiceNowInstance, InstanceSyncHistory
from app.schemas import InstanceCreate, InstanceUpdate
from shared.utils.encryption import encryption_handler


class InstanceService:
    """Service for managing ServiceNow instances."""

    def __init__(self, db: Session):
        self.db = db

    def _encrypt_credentials(self, auth_type: str, **credentials) -> dict:
        """Encrypt credentials based on auth type."""
        if auth_type == 'basic':
            return {
                'type': 'basic',
                'username': credentials.get('username'),
                'password': encryption_handler.encrypt(credentials.get('password'))
            }
        elif auth_type == 'oauth':
            return {
                'type': 'oauth',
                'client_id': credentials.get('client_id'),
                'client_secret': encryption_handler.encrypt(credentials.get('client_secret'))
            }
        else:
            raise ValueError(f"Unsupported auth type: {auth_type}")

    def _decrypt_credentials(self, credentials: dict) -> dict:
        """Decrypt credentials."""
        decrypted = credentials.copy()
        if credentials.get('type') == 'basic' and 'password' in credentials:
            decrypted['password'] = encryption_handler.decrypt(credentials['password'])
        elif credentials.get('type') == 'oauth' and 'client_secret' in credentials:
            decrypted['client_secret'] = encryption_handler.decrypt(credentials['client_secret'])
        return decrypted

    def create_instance(
        self,
        organization_id: UUID,
        instance_data: InstanceCreate
    ) -> ServiceNowInstance:
        """Create a new ServiceNow instance."""
        # Encrypt credentials
        credentials = self._encrypt_credentials(
            instance_data.auth_type,
            username=instance_data.username,
            password=instance_data.password,
            client_id=instance_data.client_id,
            client_secret=instance_data.client_secret
        )

        # Create instance
        instance = ServiceNowInstance(
            name=instance_data.name,
            url=instance_data.url,
            description=instance_data.description,
            auth_type=instance_data.auth_type,
            credentials=credentials,
            status='active',
            organization_id=organization_id
        )

        try:
            self.db.add(instance)
            self.db.commit()
            self.db.refresh(instance)
            return instance
        except IntegrityError as e:
            self.db.rollback()
            raise ValueError(f"Failed to create instance: {str(e)}")

    def get_instance(self, instance_id: UUID, organization_id: UUID) -> Optional[ServiceNowInstance]:
        """Get an instance by ID."""
        return self.db.query(ServiceNowInstance).filter(
            ServiceNowInstance.id == instance_id,
            ServiceNowInstance.organization_id == organization_id
        ).first()

    def list_instances(self, organization_id: UUID) -> List[ServiceNowInstance]:
        """List all instances for an organization."""
        return self.db.query(ServiceNowInstance).filter(
            ServiceNowInstance.organization_id == organization_id
        ).order_by(ServiceNowInstance.created_at.desc()).all()

    def update_instance(
        self,
        instance_id: UUID,
        organization_id: UUID,
        instance_data: InstanceUpdate
    ) -> Optional[ServiceNowInstance]:
        """Update an instance."""
        instance = self.get_instance(instance_id, organization_id)
        if not instance:
            return None

        # Update basic fields
        if instance_data.name is not None:
            instance.name = instance_data.name
        if instance_data.url is not None:
            instance.url = instance_data.url
        if instance_data.description is not None:
            instance.description = instance_data.description
        if instance_data.status is not None:
            instance.status = instance_data.status

        # Update credentials if provided
        if any([instance_data.username, instance_data.password,
                instance_data.client_id, instance_data.client_secret]):
            credentials = self._encrypt_credentials(
                instance.auth_type,
                username=instance_data.username or instance.credentials.get('username'),
                password=instance_data.password,
                client_id=instance_data.client_id or instance.credentials.get('client_id'),
                client_secret=instance_data.client_secret
            )
            instance.credentials = credentials

        try:
            self.db.commit()
            self.db.refresh(instance)
            return instance
        except IntegrityError as e:
            self.db.rollback()
            raise ValueError(f"Failed to update instance: {str(e)}")

    def delete_instance(self, instance_id: UUID, organization_id: UUID) -> bool:
        """Delete an instance."""
        instance = self.get_instance(instance_id, organization_id)
        if not instance:
            return False

        try:
            self.db.delete(instance)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise ValueError(f"Failed to delete instance: {str(e)}")

    def test_connection(self, instance_id: UUID, organization_id: UUID) -> dict:
        """Test connection to ServiceNow instance."""
        instance = self.get_instance(instance_id, organization_id)
        if not instance:
            raise ValueError("Instance not found")

        # Update last connection test time
        instance.last_connection_test_at = datetime.utcnow()

        try:
            # Here you would implement actual ServiceNow API connection test
            # For now, we'll simulate a successful test
            instance.connection_status = 'success'
            instance.error_message = None

            self.db.commit()

            return {
                'success': True,
                'message': 'Connection test successful',
                'details': {
                    'url': instance.url,
                    'status': 'connected'
                }
            }
        except Exception as e:
            instance.connection_status = 'failed'
            instance.error_message = str(e)
            self.db.commit()

            return {
                'success': False,
                'message': f'Connection test failed: {str(e)}',
                'details': None
            }

    def sync_instance(self, instance_id: UUID, organization_id: UUID, sync_type: str = 'manual') -> InstanceSyncHistory:
        """Initiate data sync from ServiceNow instance."""
        instance = self.get_instance(instance_id, organization_id)
        if not instance:
            raise ValueError("Instance not found")

        # Create sync history record
        sync_history = InstanceSyncHistory(
            instance_id=instance_id,
            sync_type=sync_type,
            status='running',
            started_at=datetime.utcnow()
        )

        self.db.add(sync_history)

        # Update instance last sync time
        instance.last_sync_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(sync_history)

        # Here you would trigger actual sync job (Celery task, etc.)
        # For now, we'll just mark it as completed
        sync_history.status = 'completed'
        sync_history.completed_at = datetime.utcnow()
        sync_history.records_synced = json.dumps({'total': 0})

        self.db.commit()
        self.db.refresh(sync_history)

        return sync_history
