from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import requests
from zeep import Client, Settings, xsd
from zeep.exceptions import Fault, TransportError, XMLSyntaxError
from zeep.helpers import serialize_object
from zeep.plugins import HistoryPlugin
from zeep.transports import Transport


@dataclass
class RequestStatus:
    Code: int = 1
    Text: str = ""


@dataclass
class SoapFaultInfo:
    Code: str | None = None
    Text: str = ""


@dataclass
class SoapXmlDebug:
    Request: str | None = None
    Response: str | None = None
    Headers: str | None = None


@dataclass
class AdapterResponse:
    Result: Any = None
    Error: bool = False
    Status: RequestStatus | None = None
    SoapFault: SoapFaultInfo | None = None
    SoapXML: SoapXmlDebug | None = None
    ex: Exception | None = None


class SoapAdapter:
    def __init__(self) -> None:
        self.host = ""
        self.path = ""
        self.postfix = "?WSDL=1"
        self.service = ""

        self.session_id = ""
        self.ip = ""
        self.access_token = ""

        self.basic_auth_param: dict[str, Any] = {}
        self.session = False
        self.basic_auth = False
        self.trace = 1
        self.debug = False

    def execute(self, method: str, data: Any = None) -> AdapterResponse:
        result = AdapterResponse(Result=None, Error=False)
        client = None
        history = None

        try:
            client, history = self.create_client()
            operation = getattr(client.service, method)

            try:
                response = operation(data)
            except TypeError:
                if isinstance(data, dict):
                    response = operation(**data)
                else:
                    raise

            result.Result = serialize_object(response)

        except Exception as exception:
            result.Error = True
            result.ex = exception
            result.SoapFault = self.parse_soap_fault(exception)

            if self.debug and history:
                result.SoapXML = self.extract_debug_xml(history)

            return result

        status = RequestStatus(Code=1, Text="")
        result_status = self.get_value(result.Result, "Status")

        if result_status is not None:
            code = self.get_value(result_status, "Code")
            text = self.get_value(result_status, "Text")

            if code is not None:
                try:
                    status.Code = int(code)
                except Exception:
                    status.Code = 0

            if text is not None:
                status.Text = str(text)

        if status.Code == 0:
            result.Error = True

        result.Status = status

        if self.debug and history:
            result.SoapXML = self.extract_debug_xml(history)

        return result

    def create_client(self) -> tuple[Client, HistoryPlugin]:
        wsdl = f"{self.host}{self.path}{self.service}.cls{self.postfix}"

        session = requests.Session()
        headers = {
            "IP": self.ip or "",
        }

        if self.access_token:
            headers["Access-Token"] = self.access_token

        if self.session:
            headers["Session"] = "1"

        session.headers.update(headers)

        if self.basic_auth and self.basic_auth_param:
            username = (
                self.basic_auth_param.get("login")
                or self.basic_auth_param.get("username")
            )
            password = self.basic_auth_param.get("password")
            if username and password:
                session.auth = (username, password)

        transport = Transport(session=session)
        settings = Settings(strict=False, xml_huge_tree=True)
        history = HistoryPlugin()

        client = Client(
            wsdl=wsdl,
            transport=transport,
            settings=settings,
            plugins=[history],
        )

        if self.session and not self.access_token and self.session_id:
            header = self.create_csp_session_header()
            client.set_default_soapheaders([header])

        return client, history

    def create_csp_session_header(self):
        cspchd_type = xsd.Element(
            "{http://www.intersystems.com/SOAPheaders}CSPCHD",
            xsd.ComplexType(
                [
                    xsd.Element("id", xsd.String()),
                ]
            ),
        )
        return cspchd_type(id=self.session_id)

    def parse_soap_fault(self, exception: Exception) -> SoapFaultInfo:
        fault = SoapFaultInfo()

        if isinstance(exception, Fault):
            fault.Code = str(exception.code) if exception.code else None
            fault.Text = exception.message or ""
            return fault

        if isinstance(exception, TransportError):
            fault.Code = str(exception.status_code)
            fault.Text = str(exception)
            return fault

        if isinstance(exception, XMLSyntaxError):
            fault.Code = "XMLSyntaxError"
            fault.Text = str(exception)
            return fault

        fault.Code = exception.__class__.__name__
        fault.Text = str(exception)
        return fault

    def extract_debug_xml(self, history: HistoryPlugin) -> SoapXmlDebug:
        request = None
        response = None

        try:
            if history.last_sent:
                request = str(history.last_sent["envelope"])
            if history.last_received:
                response = str(history.last_received["envelope"])
        except Exception:
            pass

        return SoapXmlDebug(Request=request, Response=response, Headers=None)

    @staticmethod
    def get_value(obj: Any, key: str) -> Any:
        if obj is None:
            return None
        if isinstance(obj, dict):
            return obj.get(key)
        return getattr(obj, key, None)