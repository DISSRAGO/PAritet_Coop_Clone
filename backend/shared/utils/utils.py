import html
import json
import re
import time
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup
from fastapi import HTTPException, Request, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from backend.modules.cogiteka.core.config import DATA_DIR


async def read_request_data(request: Request) -> tuple[dict[str, Any], dict[str, UploadFile]]:
    content_type = request.headers.get("content-type", "")

    files: dict[str, UploadFile] = {}

    if "application/json" in content_type:
        body = await request.json()
        return body or {}, files

    form = await request.form()
    data: dict[str, Any] = {}

    for key, value in form.multi_items():
        if isinstance(value, UploadFile):
            files[key] = value
        else:
            data[key] = value

    return data, files


def json_response(data: Any, status_code: int = 200) -> JSONResponse:
    return JSONResponse(
        content=jsonable_encoder(data),
        status_code=status_code,
    )


def handle_adapter_response(res, log_name: str = "") -> JSONResponse:
    if res is None:
        raise HTTPException(status_code=404, detail="Empty response")

    if getattr(res, "Error", False):
        raise HTTPException(
            status_code=404,
            detail=jsonable_encoder(
                {
                    "Error": True,
                    "Status": getattr(res, "Status", None),
                    "SoapFault": getattr(res, "SoapFault", None),
                }
            ),
        )

    return json_response(res.Result)


def as_list(value: Any) -> list:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def get_value(obj: Any, key: str, default: Any = None) -> Any:
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def set_value(obj: Any, key: str, value: Any) -> None:
    if isinstance(obj, dict):
        obj[key] = value
    else:
        setattr(obj, key, value)


def registered(value: Any) -> list:
    if value is None:
        return []

    if isinstance(value, dict):
        return as_list(value.get("RegisteredObject"))

    obj = getattr(value, "RegisteredObject", None)
    return as_list(obj)


def normalize_registered_field(obj: dict, field: str) -> None:
    obj[field] = registered(obj.get(field))


def image_exists(identifier: Any) -> bool:
    if identifier is None:
        return False
    return (DATA_DIR / f"image{identifier}.jpg").exists()


def image_flag(identifier: Any) -> int:
    return 1 if image_exists(identifier) else 0


def mark_image(items: list[dict], id_key: str = "ID", target_key: str = "Image") -> None:
    for item in items:
        item[target_key] = image_flag(item.get(id_key))


def strip_tags(value: Any) -> str:
    if value is None:
        return ""
    return BeautifulSoup(str(value), "html.parser").get_text()


def html_decode(value: Any) -> str:
    if value is None:
        return ""
    return html.unescape(str(value))


def now_hash() -> int:
    return int(time.time()) % 10000


def safe_unlink(path: Path) -> None:
    try:
        if path.exists():
            path.unlink()
    except Exception:
        pass


def is_digit(value: Any) -> bool:
    return str(value).isdigit()


def replace_comma_with_semicolon_inside_braces(input_string: str) -> str:
    def repl(match):
        return match.group(0).replace(",", ";")

    return re.sub(r"\{[^}]*\}", repl, input_string)


def build_nested_thanka_form(data: dict[str, Any]) -> dict[str, Any]:
    """
    Замена PHP-костыля в setThanka.php, где поля приходят как:
    Thanka_Annotation, Object_Name, Request_QueryName...
    """
    if data.get("Thanka") or data.get("Object"):
        return data

    thanka_fields = [
        "Annotation",
        "Name",
        "CirclesNum",
        "SectorsNum",
        "Privacy",
        "OthersMakeChildren",
        "Author",
        "Comments",
        "Sort",
        "VisibleElements",
        "ThankaLink",
        "CustomURL",
        "Price",
    ]

    object_fields = [
        "Type",
        "Name",
        "Description",
        "DateEvent",
        "BirthDate",
        "TelephoneNumber",
        "Email",
        "URL",
        "RealAuthor",
        "Filename",
        "ProductId",
        "CategoryId",
        "CategoryName",
    ]

    request_fields = [
        "Fields",
        "StartDate",
        "EndDate",
        "Picture",
        "SortOrder",
        "SortField",
        "QueryName",
        "Categories",
        "SearchString",
        "SpecialProps",
    ]

    data["Thanka"] = {
        field: data.get(f"Thanka_{field}", "")
        for field in thanka_fields
    }

    data["Object"] = {
        field: data.get(f"Object_{field}", "")
        for field in object_fields
    }

    data["Request"] = {
        field if field != "SearchString" else "SearchStrings": data.get(f"Request_{field}", "")
        for field in request_fields
    }

    return data