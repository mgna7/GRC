"""HTTP client for interacting with ServiceNow APIs."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

import httpx

from app.config import Settings


class ServiceNowClient:
    """Wrapper around ServiceNow REST API."""

    def __init__(self, base_url: str, auth_type: str, credentials: Dict[str, Any], settings: Settings):
        self.base_url = base_url.rstrip("/")
        self.auth_type = auth_type
        self.credentials = credentials
        self.settings = settings
        self._token: Optional[str] = None
        self._client: Optional[httpx.Client] = None

    def __enter__(self) -> "ServiceNowClient":
        self._client = httpx.Client(
            base_url=self.base_url,
            timeout=self.settings.servicenow_timeout,
            headers=self._build_headers(),
        )
        return self

    def __exit__(self, exc_type, exc, tb):
        if self._client:
            self._client.close()

    def _build_headers(self) -> Dict[str, str]:
        headers = {"Accept": "application/json"}
        if self.auth_type == "basic":
            return headers
        token = self._token or self._obtain_oauth_token()
        headers["Authorization"] = f"Bearer {token}"
        return headers

    def _http_client(self) -> httpx.Client:
        if not self._client:
            self.__enter__()
        if self.auth_type == "basic" and self._client:
            username = self.credentials.get("username")
            password = self.credentials.get("password")
            if not username or not password:
                raise ValueError("Username and password are required for basic authentication")
            self._client.auth = httpx.BasicAuth(username, password)
        return self._client  # type: ignore[return-value]

    def _obtain_oauth_token(self) -> str:
        client_id = self.credentials.get("client_id")
        client_secret = self.credentials.get("client_secret")
        if not client_id or not client_secret:
            raise ValueError("OAuth credentials are incomplete")
        token_url = f"{self.base_url}/oauth_token.do"
        response = httpx.post(
            token_url,
            data={"grant_type": "client_credentials", "client_id": client_id, "client_secret": client_secret},
            timeout=self.settings.servicenow_timeout,
        )
        response.raise_for_status()
        token = response.json().get("access_token")
        if not token:
            raise ValueError("ServiceNow did not return an access token")
        self._token = token
        return token

    def ping(self) -> Dict[str, Any]:
        """Validate credentials by fetching a single row from the ping table."""
        table = self.settings.servicenow_ping_table
        result = self.fetch_table(table, fields=["sys_id"], limit=1)
        return {"table": table, "records": len(result)}

    def fetch_table(
        self,
        table: str,
        fields: Optional[List[str]] = None,
        limit: Optional[int] = None,
        query: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        params = {
            "sysparm_limit": limit or self.settings.servicenow_page_size,
            "sysparm_display_value": "true",
        }
        if fields:
            params["sysparm_fields"] = ",".join(fields)
        if query:
            params["sysparm_query"] = query

        client = self._http_client()
        response = client.get(f"/api/now/table/{table}", params=params)
        response.raise_for_status()
        payload = response.json()
        return payload.get("result", [])

    def close(self):
        if self._client:
            self._client.close()
            self._client = None
