"""Database models for Instance Service."""

from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, String, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB

from shared.utils.database import Base, UUIDMixin, TimestampMixin


class ServiceNowInstance(Base, UUIDMixin, TimestampMixin):
    """ServiceNow instance model."""

    __tablename__ = "servicenow_instances"

    # Basic information
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)

    # Authentication
    auth_type = Column(String(50), nullable=False)  # 'oauth' or 'basic'
    credentials = Column(JSONB, nullable=False)  # Encrypted credentials

    # Status and metadata
    status = Column(String(50), default='active', nullable=False)  # 'active', 'inactive', 'error'
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    last_connection_test_at = Column(DateTime(timezone=True), nullable=True)
    connection_status = Column(String(50), nullable=True)  # 'success', 'failed'
    error_message = Column(Text, nullable=True)

    # Organization relationship
    organization_id = Column(UUID(as_uuid=True), nullable=False)

    # Indexes
    __table_args__ = (
        Index('ix_servicenow_instances_organization_id', organization_id),
        Index('ix_servicenow_instances_status', status),
        Index('ix_servicenow_instances_name', name),
    )

    def __repr__(self):
        return f"<ServiceNowInstance(id={self.id}, name={self.name}, url={self.url})>"


class InstanceSyncHistory(Base, UUIDMixin, TimestampMixin):
    """History of instance synchronization operations."""

    __tablename__ = "instance_sync_history"

    instance_id = Column(UUID(as_uuid=True), nullable=False)
    sync_type = Column(String(50), nullable=False)  # 'manual', 'scheduled', 'automatic'
    status = Column(String(50), nullable=False)  # 'running', 'completed', 'failed'
    records_synced = Column(Text, nullable=True)  # JSON with counts
    started_at = Column(DateTime(timezone=True), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)

    __table_args__ = (
        Index('ix_instance_sync_history_instance_id', instance_id),
        Index('ix_instance_sync_history_status', status),
    )

    def __repr__(self):
        return f"<InstanceSyncHistory(id={self.id}, instance_id={self.instance_id}, status={self.status})>"
