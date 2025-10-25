from fastapi import APIRouter

from .routes import analysis, dashboard, insights, operations, servicenow, widgets


def get_api_router() -> APIRouter:
    router = APIRouter()
    router.include_router(servicenow.router)
    router.include_router(analysis.router)
    router.include_router(insights.router)
    router.include_router(widgets.router)
    router.include_router(dashboard.router)
    router.include_router(operations.router)
    return router
