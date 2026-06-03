import os

from backend.modules.cogiteka.core.config import HOST
from backend.modules.cogiteka.integrations.portmonet.soap_adapter import SoapAdapter
from backend.modules.cogiteka.integrations.portmonet.local_adapter import LocalCogiAdapter


def env_flag(name: str, default: str = "0") -> bool:
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes", "on"}


def _use_portmonet() -> bool:
    """
    True  — реальный SOAP-стенд (portmonet или другой внешний бэк).
    False — локальная PostgreSQL через LocalCogiAdapter (дефолт для dev).
    Меняется переменной COGI_USE_PORTMONET=1.
    """
    return env_flag("COGI_USE_PORTMONET", "0")


class PortmonetApi:
    def create_adapter(self, service: str, path: str):
        if not _use_portmonet():
            return LocalCogiAdapter()

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
    ):
        if not _use_portmonet():
            adapter = LocalCogiAdapter()
            adapter.access_token = token
            return adapter

        adapter = SoapAdapter()
        adapter.host = HOST
        adapter.path = path
        adapter.access_token = token
        adapter.service = service
        adapter.debug = env_flag("COGI_SOAP_DEBUG")
        return adapter
