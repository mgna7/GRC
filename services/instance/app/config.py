"""Configuration for Instance Service."""

from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings for the Instance service."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    service_name: str = "instance-service"
    environment: str = "development"

    # ServiceNow connectivity
    servicenow_timeout: float = 30.0
    servicenow_page_size: int = 200
    servicenow_dataset_limit: int = 200
    servicenow_ping_table: str = "sys_user"
    servicenow_control_table: str = "sn_compliance_control"
    servicenow_risk_table: str = "sn_risk_risk"
    servicenow_compliance_table: str = "sn_compliance_policy"
    servicenow_control_fields: str = "sys_id,name,number,state"
    servicenow_risk_fields: str = "sys_id,name,number,state,impact"
    servicenow_compliance_fields: str = "sys_id,name,number,state,type"
    servicenow_use_mock: bool = True
    servicenow_mock_payload: str = "services/instance/app/data/mock_servicenow_payload.json"

    @field_validator("servicenow_control_fields", "servicenow_risk_fields", "servicenow_compliance_fields")
    @classmethod
    def _normalize_fields(cls, value: str) -> str:
        return ",".join(part.strip() for part in value.split(",") if part.strip())

    def fields_for(self, dataset: str) -> List[str]:
        mapping = {
            "controls": self.servicenow_control_fields,
            "risks": self.servicenow_risk_fields,
            "compliance": self.servicenow_compliance_fields,
        }
        return mapping.get(dataset, "").split(",")


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
