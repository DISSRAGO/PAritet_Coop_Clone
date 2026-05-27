from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from xml.sax.saxutils import escape

import requests
import lxml.etree  as ET


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
    SOAP_ENV_NS = "http://schemas.xmlsoap.org/soap/envelope/"
    SOAP_HDR_NS = "http://www.intersystems.com/SOAPheaders"
    SERVICE_NS = "https://www.portmonet.ru"
    XSI_NS = "http://www.w3.org/2001/XMLSchema-instance"

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
        request_xml = None
        response_xml = None
        response_headers = None

        try:
            request_xml = self.build_envelope(method, data)
            http_response = self.send_request(method, request_xml)
            response_xml = http_response.text
            response_headers = "\n".join(f"{k}: {v}" for k, v in http_response.headers.items())

            parsed = self.parse_response(method, response_xml)

            result.Result = parsed.get("Result")
            result.Status = parsed.get("Status")

            if parsed.get("Fault"):
                result.Error = True
                result.SoapFault = parsed["Fault"]

            if result.Status and result.Status.Code == 0:
                result.Error = True

        except Exception as exception:
            result.Error = True
            result.ex = exception
            result.SoapFault = self.parse_soap_fault(exception)

        if self.debug:
            result.SoapXML = SoapXmlDebug(
                Request=request_xml,
                Response=response_xml,
                Headers=response_headers,
            )

        return result

    def endpoint(self) -> str:
        return f"{self.host}{self.path}{self.service}.cls"

    def send_request(self, method: str, request_xml: str) -> requests.Response:
        session = requests.Session()

        headers = {
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": method,
            "IP": self.ip or "",
        }

        if self.access_token:
            headers["Access-Token"] = self.access_token

        if self.session:
            headers["Session"] = "1"

        if self.basic_auth and self.basic_auth_param:
            username = (
                self.basic_auth_param.get("login")
                or self.basic_auth_param.get("username")
            )
            password = self.basic_auth_param.get("password")
            if username and password:
                session.auth = (username, password)

        response = session.post(
            self.endpoint(),
            data=request_xml.encode("utf-8"),
            headers=headers,
            timeout=120,
        )
        response.raise_for_status()
        return response

    def build_envelope(self, method: str, data: Any = None) -> str:
        body_xml = self.build_method_xml(method, data)
        header_xml = self.build_header_xml()

        return (
            '<?xml version="1.0" encoding="UTF-8"?>'
            f'<SOAP-ENV:Envelope xmlns:SOAP-ENV="{self.SOAP_ENV_NS}" '
            f'xmlns:tns="{self.SERVICE_NS}" '
            f'xmlns:xsi="{self.XSI_NS}">'
            f"{header_xml}"
            f"<SOAP-ENV:Body>{body_xml}</SOAP-ENV:Body>"
            f"</SOAP-ENV:Envelope>"
        )

    def build_header_xml(self) -> str:
        if self.session and not self.access_token and self.session_id:
            session_id = escape(str(self.session_id))
            return (
                f'<SOAP-ENV:Header>'
                f'<CSPCHD xmlns="{self.SOAP_HDR_NS}"><id>{session_id}</id></CSPCHD>'
                f'</SOAP-ENV:Header>'
            )
        return "<SOAP-ENV:Header/>"

    def build_method_xml(self, method: str, data: Any = None) -> str:
        if data is None:
            return f"<tns:{method}/>"

        if isinstance(data, dict):
            inner = "".join(self.build_param_xml(key, value) for key, value in data.items())
            return f"<tns:{method}>{inner}</tns:{method}>"

        return f"<tns:{method}>{escape(str(data))}</tns:{method}>"

    def build_param_xml(self, key: str, value: Any) -> str:
        key = escape(str(key))

        if value is None:
            return f"<tns:{key}></tns:{key}>"

        if isinstance(value, bool):
            text = "true" if value else "false"
            return f"<tns:{key}>{text}</tns:{key}>"

        if isinstance(value, (int, float, str)):
            return f"<tns:{key}>{escape(str(value))}</tns:{key}>"

        if isinstance(value, dict):
            inner = "".join(self.build_param_xml(child_key, child_value) for child_key, child_value in value.items())
            return f"<tns:{key}>{inner}</tns:{key}>"

        if isinstance(value, (list, tuple)):
            inner = "".join(self.build_param_xml("item", item) for item in value)
            return f"<tns:{key}>{inner}</tns:{key}>"

        return f"<tns:{key}>{escape(str(value))}</tns:{key}>"

    def parse_response(self, method: str, xml_text: str) -> dict[str, Any]:
        root = ET.fromstring(xml_text.encode("utf-8"))

        fault_node = root.find(f".//{{{self.SOAP_ENV_NS}}}Fault")
        if fault_node is not None:
            return {
                "Result": None,
                "Status": None,
                "Fault": SoapFaultInfo(
                    Code=self.find_text_local(fault_node, "faultcode"),
                    Text=self.find_text_local(fault_node, "faultstring") or "",
                ),
            }

        response_node = self.find_first_by_localname(root, f"{method}Response")
        if response_node is None:
            raise ValueError(f"SOAP response node not found for method {method}")

        response_data = self.xml_to_data(response_node)

        method_result_key = f"{method}Result"
        raw_status = response_data.pop(method_result_key, None)

        status = None
        if isinstance(raw_status, dict):
            code = raw_status.get("@Code")
            text = raw_status.get("@Text", "")
            try:
                code_int = int(code) if code is not None else 1
            except Exception:
                code_int = 1
            status = RequestStatus(Code=code_int, Text=str(text))

        return {
            "Result": response_data,
            "Status": status,
            "Fault": None,
        }

    def xml_to_data(self, element: ET._Element) -> Any:
        children = list(element)
        text = (element.text or "").strip()
        attrs = {f"@{self.local_name(k)}": v for k, v in element.attrib.items()}

        if not children:
            if attrs:
                if text:
                    attrs["#text"] = text
                return attrs
            return text

        result: dict[str, Any] = dict(attrs)

        for child in children:
            key = self.local_name(child.tag)
            value = self.xml_to_data(child)

            if key in result:
                if not isinstance(result[key], list):
                    result[key] = [result[key]]
                result[key].append(value)
            else:
                result[key] = value

        if text:
            result["#text"] = text

        return result

    def parse_soap_fault(self, exception: Exception) -> SoapFaultInfo:
        return SoapFaultInfo(
            Code=exception.__class__.__name__,
            Text=str(exception),
        )

    @staticmethod
    def local_name(tag: str) -> str:
        if "}" in tag:
            return tag.split("}", 1)[1]
        return tag

    def find_first_by_localname(self, root: ET._Element, name: str) -> ET._Element | None:
        nodes = root.xpath(f'//*[local-name()="{name}"]')
        return nodes[0] if nodes else None

    def find_text_local(self, root: ET._Element, name: str) -> str | None:
        node = self.find_first_by_localname(root, name)
        if node is None:
            return None
        text = (node.text or "").strip()
        return text or None