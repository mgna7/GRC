from datetime import datetime, timezone
from typing import Any, Dict, List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models import ServiceNowInstance, WidgetConfiguration
from app.schemas.widget import WidgetConfigRequest, WidgetConfigResponse


class WidgetService:
    """Manage widget configuration pushes for ServiceNow dashboards."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def configure(self, request: WidgetConfigRequest) -> WidgetConfigResponse:
        instance = self.db.get(ServiceNowInstance, request.instance_id)
        if not instance:
            raise AppError("ServiceNow instance not found.", status_code=404)

        now = datetime.now(tz=timezone.utc)
        configurations: List[WidgetConfiguration] = []
        for widget_payload in request.widgets:
            widget = WidgetConfiguration(
                instance_id=instance.id,
                widget_name=widget_payload.get("name", "unnamed_widget"),
                configuration=widget_payload,
                pushed_at=now,
            )
            self.db.add(widget)
            configurations.append(widget)

        self.db.commit()
        for widget in configurations:
            self.db.refresh(widget)

        return WidgetConfigResponse(instance_id=instance.id, pushed_at=now, widgets=request.widgets)

    def latest_configurations(self, instance_id: UUID) -> List[Dict[str, Any]]:
        stmt = (
            select(WidgetConfiguration)
            .where(WidgetConfiguration.instance_id == instance_id)
            .order_by(WidgetConfiguration.pushed_at.desc())
        )
        return [row.configuration for row in self.db.scalars(stmt).all()]
