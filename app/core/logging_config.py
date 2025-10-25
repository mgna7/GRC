import logging
from logging.config import dictConfig
from typing import Any, Dict

from .config import get_settings


def configure_logging() -> None:
    """Configure structured logging for the application."""
    settings = get_settings()

    logging_config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json_formatter": {
                "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
                "fmt": "%(asctime)s %(levelname)s %(name)s %(message)s",
            },
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            },
        },
        "handlers": {
            "default": {
                "level": "DEBUG" if settings.debug else "INFO",
                "formatter": "default",
                "class": "logging.StreamHandler",
            },
        },
        "loggers": {
            "uvicorn": {"handlers": ["default"], "level": "INFO", "propagate": False},
            "complianceiq": {"handlers": ["default"], "level": "DEBUG", "propagate": False},
        },
        "root": {"handlers": ["default"], "level": "DEBUG" if settings.debug else "INFO"},
    }

    dictConfig(logging_config)
