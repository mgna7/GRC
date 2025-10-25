from fastapi import APIRouter, Depends, Form, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse, Response
from fastapi.templating import Jinja2Templates

from app.api.dependencies import get_dashboard_service, get_servicenow_connector
from app.core.security import authenticate_admin, require_session
from app.services.dashboard import DashboardService
from app.services.servicenow_connector import ServiceNowConnector

templates = Jinja2Templates(directory="app/web/templates")

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def dashboard(
    request: Request,
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> HTMLResponse:
    if not request.session.get("user"):
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    summary = dashboard_service.get_summary()
    context = {
        "request": request,
        "summary": summary,
        "user": request.session.get("user"),
    }
    return templates.TemplateResponse("dashboard.html", context)


@router.get("/settings", response_class=HTMLResponse)
async def settings(
    request: Request,
    connector: ServiceNowConnector = Depends(get_servicenow_connector),
) -> HTMLResponse:
    require_session(request)
    instances = connector.list_instances()
    context = {
        "request": request,
        "instances": instances,
        "user": request.session.get("user"),
    }
    return templates.TemplateResponse("settings.html", context)


@router.get("/login", response_class=HTMLResponse)
async def login_form(request: Request) -> HTMLResponse:
    if request.session.get("user"):
        return RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)
    return templates.TemplateResponse("login.html", {"request": request, "error": None, "user": None})


@router.post("/login", response_class=HTMLResponse)
async def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
) -> Response:
    if not authenticate_admin(email, password):
        return templates.TemplateResponse(
            "login.html",
            {"request": request, "error": "Invalid credentials. Please try again.", "user": None},
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    request.session["user"] = {"email": email}
    return RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)


@router.post("/logout")
async def logout(request: Request) -> Response:
    request.session.clear()
    return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
