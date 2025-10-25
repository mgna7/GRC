"""Database utilities and base models."""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Column, DateTime, MetaData
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import as_declarative, declared_attr
from sqlalchemy.orm import Session


# Naming convention for constraints
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

metadata = MetaData(naming_convention=convention)


@as_declarative(metadata=metadata)
class Base:
    """Base class for all database models."""

    id: Any
    __name__: str

    @declared_attr
    def __tablename__(cls) -> str:
        """Generate table name from class name."""
        return cls.__name__.lower()


class UUIDMixin:
    """Mixin for UUID primary key."""

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)


class TimestampMixin:
    """Mixin for timestamp columns."""

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class TenantMixin:
    """Mixin for multi-tenant support."""

    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)


def set_tenant_context(db: Session, organization_id: uuid.UUID):
    """Set tenant context for row-level security."""
    db.execute(f"SET app.current_organization_id = '{organization_id}'")


def paginate(query, page: int = 1, page_size: int = 20):
    """Paginate SQLAlchemy query."""
    offset = (page - 1) * page_size
    return query.offset(offset).limit(page_size)
