import os

from backend.modules.cogiteka.core.config import HOST
from backend.modules.cogiteka.integrations.portmonet.soap_adapter import SoapAdapter


def env_flag(name: str, default: str = "0") -> bool:
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes", "on"}


class PortmonetApi:
    def create_adapter(self, service: str, path: str) -> SoapAdapter:
        adapter = SoapAdapter()
        adapter.host = HOST
        adapter.path = path
        adapter.service = service
        adapter.debug = env_flag("COGI_SOAP_DEBUG")
        return adapter

    def create_adapter_with_token(
        self,
        service: str,
        path: str,
        token: str,
    ) -> SoapAdapter:
        adapter = SoapAdapter()
        adapter.host = HOST
        adapter.path = path
        adapter.access_token = token
        adapter.service = service
        adapter.debug = env_flag("COGI_SOAP_DEBUG")
        return adapter