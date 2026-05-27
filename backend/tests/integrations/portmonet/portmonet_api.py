backend.modules.cogiteka.core.config import HOST
backend.modules.cogiteka.integrations.portmonet.soap_adapter import SoapAdapter


class PortmonetApi:
    def create_adapter(self, service: str, path: str) -> SoapAdapter:
        adapter = SoapAdapter()
        adapter.host = HOST
        adapter.path = path
        adapter.service = service
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
        return adapter