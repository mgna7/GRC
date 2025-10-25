from collections.abc import Generator

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.security import verify_request
from app.db.session import get_db
from app.services.analysis import AnalysisService
from app.services.dashboard import DashboardService
from app.services.insights import InsightService
from app.services.operations import OperationsService
from app.services.servicenow_connector import ServiceNowConnector
from app.services.widgets import WidgetService


def get_db_session() -> Generator[Session, None, None]:
    yield from get_db()


def get_servicenow_connector(db: Session = Depends(get_db_session)) -> ServiceNowConnector:
    return ServiceNowConnector(db=db)


def get_analysis_service(db: Session = Depends(get_db_session)) -> AnalysisService:
    return AnalysisService(db=db)


def get_insight_service(db: Session = Depends(get_db_session)) -> InsightService:
    return InsightService(db=db)


def get_widget_service(db: Session = Depends(get_db_session)) -> WidgetService:
    return WidgetService(db=db)


def get_dashboard_service(db: Session = Depends(get_db_session)) -> DashboardService:
    return DashboardService(db=db)


def get_operations_service(db: Session = Depends(get_db_session)) -> OperationsService:
    return OperationsService(db=db)


ApiSecurity = Depends(verify_request)
