"""Orchestrates ServiceNow data collection."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List

from app.config import Settings
from app.integrations.servicenow_client import ServiceNowClient


class InstanceSyncManager:
    """Fetches datasets from ServiceNow or mock payloads."""

    def __init__(self, client: ServiceNowClient, settings: Settings):
        self.client = client
        self.settings = settings

    def collect(self) -> Dict[str, List[Dict[str, Any]]]:
        if self.settings.servicenow_use_mock:
            return self._load_mock_payload()
        return {
            "controls": self._fetch_dataset(self.settings.servicenow_control_table, "controls"),
            "risks": self._fetch_dataset(self.settings.servicenow_risk_table, "risks"),
            "compliance": self._fetch_dataset(self.settings.servicenow_compliance_table, "compliance"),
        }

    def _fetch_dataset(self, table: str, dataset: str) -> List[Dict[str, Any]]:
        fields = self.settings.fields_for(dataset)
        limit = self.settings.servicenow_dataset_limit
        records = self.client.fetch_table(table, fields=fields, limit=limit)
        return records[:limit]

    def _load_mock_payload(self) -> Dict[str, List[Dict[str, Any]]]:
        payload_path = Path(self.settings.servicenow_mock_payload)
        if not payload_path.exists():
            return {"controls": [], "risks": [], "compliance": []}
        data = json.loads(payload_path.read_text())
        for key in ("controls", "risks", "compliance"):
            data.setdefault(key, [])
            data[key] = data[key][: self.settings.servicenow_dataset_limit]
        return data
