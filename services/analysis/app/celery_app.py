"""
Celery Application Configuration for Analysis Service
"""
import os
from celery import Celery

# Get configuration from environment
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://complianceiq:rabbitmq_dev_password@rabbitmq:5672/")
REDIS_URL = os.getenv("REDIS_URL", "redis://:redis_dev_password@redis:6379/4")

# Create Celery app
celery_app = Celery(
    "analysis_tasks",
    broker=RABBITMQ_URL,
    backend=REDIS_URL,
    include=["app.tasks"]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max
    task_soft_time_limit=3000,  # 50 minutes soft limit
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Task routes (optional - for future task organization)
celery_app.conf.task_routes = {
    "app.tasks.analyze_controls": {"queue": "analysis"},
    "app.tasks.analyze_risks": {"queue": "analysis"},
    "app.tasks.analyze_compliance": {"queue": "analysis"},
}

if __name__ == "__main__":
    celery_app.start()
