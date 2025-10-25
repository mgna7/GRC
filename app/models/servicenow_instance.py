import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ServiceNowInstance(Base):
    __tablename__ = "servicenow_instances"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    instance_name: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    instance_url: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)
    api_user: Mapped[str] = mapped_column(String(128), nullable=False)
    api_token_hash: Mapped[str] = mapped_column(String(256), nullable=False)
    instance_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    control_records: Mapped[list["ControlData"]] = relationship(
        "ControlData", back_populates="instance", cascade="all, delete-orphan"
    )
    risk_records: Mapped[list["RiskData"]] = relationship(
        "RiskData", back_populates="instance", cascade="all, delete-orphan"
    )
    analysis_results: Mapped[list["AnalysisResult"]] = relationship(
        "AnalysisResult", back_populates="instance", cascade="all, delete-orphan"
    )
    ml_models: Mapped[list["MLModel"]] = relationship(
        "MLModel", back_populates="instance", cascade="all, delete-orphan"
    )
    widget_configurations: Mapped[list["WidgetConfiguration"]] = relationship(
        "WidgetConfiguration", back_populates="instance", cascade="all, delete-orphan"
    )
