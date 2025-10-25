from fastapi import APIRouter, Depends

from app.api.dependencies import ApiSecurity, get_widget_service
from app.schemas.widget import WidgetConfigRequest, WidgetConfigResponse
from app.services.widgets import WidgetService

router = APIRouter(prefix="/widgets", tags=["Widgets"], dependencies=[ApiSecurity])


@router.post("/configure", response_model=WidgetConfigResponse)
def configure_widgets(
    payload: WidgetConfigRequest,
    service: WidgetService = Depends(get_widget_service),
) -> WidgetConfigResponse:
    return service.configure(payload)
