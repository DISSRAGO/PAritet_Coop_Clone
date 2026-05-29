# refact by:
# cogiAPI/thanka/getThanka.php
# cogiAPI/thanka/setThanka.php
# cogiAPI/thanka/thanka.php
# cogiAPI/thanka/methods.php

import re
from types import SimpleNamespace
from typing import Any

from fastapi import APIRouter, Request

from backend.modules.cogiteka.core.cache import cache
from backend.modules.cogiteka.core.config import (
    COGI_REQUEST_SERVICE,
    COGI_SERVICE,
    DATA_DIR,
    GROUP_SERVICE,
    MARKET_SERVICE,
    PROFILE_SERVICE,
    RKC_PATH,
    SITE_NAVIGATOR_URL,
    SOC_PATH,
    START_THANKA_ID,
    STYLE_DIR,
)
from backend.modules.cogiteka.integrations.media.image_utils import save_thanka_picture
from backend.modules.cogiteka.integrations.portmonet.portmonet_api  import PortmonetApi
from backend.modules.cogiteka.integrations.portmonet.request_api import (
    get_category_market_list,
    get_goods_list,
    get_group_avatars,
    get_group_list,
    get_tvt,
)
from backend.shared.utils.utils import (
    build_nested_thanka_form,
    handle_adapter_response,
    html_decode,
    image_flag,
    is_digit,
    json_response,
    now_hash,
    read_request_data,
    registered,
    safe_unlink,
    strip_tags,
)

router = APIRouter()


def api():
    return PortmonetApi()


def cogi_adapter():
    ad = api().create_adapter(COGI_SERVICE, SOC_PATH)
    ad.debug = True
    return ad

def profile_adapter():
    return api().create_adapter(PROFILE_SERVICE, RKC_PATH)


def request_adapter():
    return api().create_adapter(COGI_REQUEST_SERVICE, SOC_PATH)


def market_adapter():
    return api().create_adapter(MARKET_SERVICE, RKC_PATH)


def group_adapter():
    return api().create_adapter(GROUP_SERVICE, SOC_PATH)


def language_types(thanka_type: str) -> dict[str, str]:
    mapping = {
        "article": ("Статья", "статью", "статьи"),
        "avatar": ("Аватар", "аватар", "аватара"),
        "cabinet": ("Кабинет", "кабинет", "кабинета"),
        "catalog": ("Каталог", "каталог", "каталога"),
        "collection": ("Коллекция", "коллекцию", "коллекции"),
        "document": ("Документ", "документ", "документа"),
        "request": ("Сервис", "сервис", "сервиса"),
        "link": ("Ссылка", "ссылку", "ссылки"),
        "repost": ("Репост", "репост", "репоста"),
    }

    type_name, accusativus, genitivus = mapping.get(
        thanka_type,
        ("Тханка", "тханку", "тханки"),
    )

    return {
        "TypeName": type_name,
        "Accusativus": accusativus,
        "Genitivus": genitivus,
    }


def set_result_arrays(result: dict) -> None:
    list_fields = [
        "Children",
        "DocumentsParts",
        "AvatarList",
        "MyThankaList",
        "MySubscribeList",
        "Content",
        "Elements",
        "LinksTo",
        "LinksFrom",
        "LinksSectors",
    ]

    for field in list_fields:
        items = result.get(field) or []

        for idx, item in enumerate(items):
            item["Annotation"] = html_decode(item.get("Annotation"))
            item["Image"] = image_flag(item.get("ID"))

            if field == "Children":
                result.setdefault("ChildrenImage", {})[idx] = item["Image"]

            if field == "DocumentsParts":
                result.setdefault("DocImage", {})[idx] = item["Image"]

    result["CenterImage"] = image_flag(result.get("Id"))

    thanka = result.get("Thanka") or {}
    result["ParentImage"] = image_flag(thanka.get("ParentId"))
    result["AuthorImage"] = image_flag(thanka.get("Author"))


def get_avatars_by_user(adapter, data):
    return adapter.execute("GetAvatarsByUser", data)


def get_referal_shareholder_list(adapter, data):
    return adapter.execute("GetReferalShareHolderList", data)


def get_shareholder(adapter, data):
    data["PropertyList"] = [
        "Account",
        "Account.Money",
        "StateName",
        "Account.FullNumber",
        "Account.Number",
        "ContractId",
        "Status",
    ]
    return adapter.execute("GetShareHolder", data)


def get_authors_account(adapter, data):
    return adapter.execute("GetAuthorsAccountNumber", data)


def get_shareholder_content_list(
    user: dict,
    fields: list[str],
    category: str,
    result_content: list,
    adapter_rkc,
    adapter_soc,
):
    content = []

    if category == "invited":
        params = {
            "UserId": user.get("id"),
            "PropertyList": [
                "UserProfile",
                "UserProfile.Name",
                "UserProfile.Login",
                "UserProfile.SMSPhone",
                "Account",
                "DateRegister",
                "StateName",
                "ContractId",
                "Account.FullNumber",
            ],
        }
        rs = get_referal_shareholder_list(adapter_rkc, params)
        if not rs.Error:
            content = rs.Result["ShareHolderList"]["ShareHolder"]
    else:
        content = result_content or []

    ids = ",".join([str(item.get("Id")) for item in content])
    rs2 = get_avatars_by_user(adapter_soc, {"users": ids})

    avatars = []
    if not rs2.Error:
        avatars = registered(rs2.Result.get("List"))

    result = []

    for usr in content:
        item = {}

        if "HolderAvatar" in fields:
            for avatar in avatars:
                if str(usr.get("Id")) == str(avatar.get("UserId")):
                    item["AvatarId"] = avatar.get("ID")
                    item["HolderAvatar"] = avatar.get("AuthorName")

        if "Date" in fields:
            item["Date"] = usr.get("DateRegister")

        if "HolderName" in fields:
            item["HolderName"] = (usr.get("UserProfile") or {}).get("Name")

        if "HolderStatus" in fields:
            item["HolderStatus"] = usr.get("StateName")

        if "AccountNumber" in fields:
            item["AccountNumber"] = (usr.get("Account") or {}).get("FullNumber")

        result.append(item)

    return result

def resolve_root_target_by_host(host: str) -> dict[str, str]:
    host = (host or "").split(":")[0].lower()

    host_map = {
        "clone.paritet.club": {"Id": "18352", "SiteId": ""},
        "www.clone.paritet.club": {"Id": "18352", "SiteId": ""},
    }

    return host_map.get(host, {"Id": str(START_THANKA_ID), "SiteId": ""})

def _resolve_user_cabinet(ad, user: dict) -> str:
    """Возвращает thanka_id кабинета авторизованного пользователя (с кэшом)."""
    login = user.get("login") or ""
    if not login:
        return ""
    key = f"{login}_profile"
    if cache.exists(key):
        return cache.get(key) or ""
    res = ad.execute(
        "GetCabinetByUser",
        {"UserId": user.get("id"), "Login": login},
    )
    if res.Error:
        return ""
    thanka_id = (res.Result or {}).get("Id") or ""
    if thanka_id:
        cache.set(key, thanka_id)
    return thanka_id


def thanka_url_parser(url: str, user: dict, host: str = "") -> dict[str, str]:
    ad = cogi_adapter()

    thanka_id = ""
    site_id = ""

    if url in ("", "/"):
        # Для авторизованного юзера корень ведёт в его кабинет (это MVP V0.51,
        # без публичной корневой тханки 18352). Для анонима — fallback на хост-мап.
        thanka_id = _resolve_user_cabinet(ad, user)
        if not thanka_id:
            root_target = resolve_root_target_by_host(host)
            thanka_id = str(root_target.get("Id", "")) if root_target.get("Id") else ""
            site_id = str(root_target.get("SiteId", "")) if root_target.get("SiteId") else ""
        print("URL_PARSER_ROOT", {"host": host, "Id": thanka_id, "SiteId": site_id})
    else:
        address = url.split("/")
        if address and address[0] == "":
            address.pop(0)

        first = address[0] if len(address) > 0 else ""
        second = address[1] if len(address) > 1 else ""

        if first in ("navigator", "lite"):
            if second == "":
                # /navigator/ без суффикса → кабинет пользователя
                thanka_id = _resolve_user_cabinet(ad, user)
            else:
                # second может быть UUID, числом или DocumentPath — в любом случае
                # берём последний сегмент как id.
                thanka_id = address[-1]

        elif first == "profile":
            thanka_id = _resolve_user_cabinet(ad, user)
            if not thanka_id:
                return {"Id": "", "SiteId": ""}

        elif first == "sitepage":
            site_id = second

        else:
            if second and is_digit(second):
                site_id = second
            else:
                path = second if second else first
                res = ad.execute("GetIdByCustomURL", {"url": path})

                if res.Result.get("Type") == "navigator":
                    thanka_id = res.Result.get("Id")
                elif res.Result.get("Type") == "sitepage":
                    site_id = res.Result.get("Id")

    return {
        "Id": thanka_id,
        "SiteId": site_id,
    }

def parse_text(adapter, text: str, author: Any) -> tuple[str, str]:
    text = text.replace("&nbsp;", " ")

    tags = re.findall(r"(#\w+)", text, flags=re.UNICODE)

    normalized = []

    for tag in tags:
        parts = re.split(r"(?<=[а-яa-z])(?=[А-ЯA-Z])", tag)
        normalized.append("_".join(parts).lower())

    res = adapter.execute(
        "CreateHashtagsLeafs",
        {
            "Names": ";".join(normalized),
            "Author": author,
        },
    )

    result = res.Result
    line_list = str(result.get("IDList", "")).split(";") if result else []

    words = text.split(" ")

    for i, word in enumerate(words):
        for j, tag in enumerate(normalized):
            if tag in word and "href=" not in word and j < len(line_list):
                words[i] = f"<a href='{SITE_NAVIGATOR_URL}{line_list[j]}'>{word}</a>"

    return " ".join(words), ";".join(line_list)


def remove_hashtags_links(description: str, deletehashtags: list[str]) -> str:
    if not deletehashtags:
        return description

    anchors = re.findall(r"(<a[^>]*>[^#].*?</a>)", description, flags=re.UNICODE)
    chunks = re.split(r"(<a[^>]*>[^#].*?</a>)", description, flags=re.UNICODE)

    replace_map = {}

    for anchor in anchors:
        for deleted in deletehashtags:
            if deleted and deleted in anchor:
                replace_map[anchor] = strip_tags(anchor)

    result = ""

    for chunk in chunks:
        result += replace_map.get(chunk, chunk)

    return result


def normalize_get_thanka_result(result: dict, thanka_id: str, site_id: str) -> dict:
    if thanka_id:
        result["Id"] = thanka_id

    if site_id:
        result["Id"] = site_id
        css_file = STYLE_DIR / f"{site_id}.css"
        result["Style"] = css_file.read_text(encoding="utf-8") if css_file.exists() else ""

    for field in ["Children", "Content", "AvatarList"]:
        result[field] = registered(result.get(field))

    result["Hash"] = now_hash()

    if thanka_id:
        for field in [
            "Elements",
            "LocationEvent",
            "MyThankaList",
            "SiteList",
            "MySubscribeList",
            "DocumentsParts",
            "Notifications",
            "LinksTo",
            "LinksFrom",
            "LinksSectors",
        ]:
            result[field] = registered(result.get(field))

    object_data = result.get("Object") or {}
    thanka_data = result.get("Thanka") or {}

    type_data = language_types(str(object_data.get("Type") or ""))

    result["TypeName"] = type_data["TypeName"]
    result["Accusativus"] = type_data["Accusativus"]
    result["Genitivus"] = type_data["Genitivus"]

    thanka_data["Annotation"] = html_decode(thanka_data.get("Annotation"))
    object_data["Description"] = html_decode(object_data.get("Description"))

    result["Thanka"] = thanka_data
    result["Object"] = object_data

    return result


def enrich_request_content(result: dict, user: dict) -> None:
    request_data = result.get("Request") or {}

    if request_data.get("QueryName") == "products":
        tvt = None

        special_props = request_data.get("SpecialProps") or ""
        if special_props:
            for item in special_props.split(";"):
                if "tvt" in item:
                    tvt = item.split(":")[1]

        request_data["TvtId"] = tvt

        market = market_adapter()
        soc = request_adapter()

        if tvt:
            tvt_res = get_tvt(market, {"Id": tvt})
            if not tvt_res.Error:
                tvt_data = tvt_res.Result.get("Tvt")
                if tvt_data and tvt_data.get("Address"):
                    tvt_data["Address"] = tvt_data["Address"].get("Value")
                request_data["TvtData"] = tvt_data

        goods_res = get_goods_list(market, tvt)
        goods = goods_res.Result

        user_ids = []
        for item in goods:
            producer = item.get("ProducerValue")
            if producer and producer not in user_ids:
                user_ids.append(producer)

        avatars_res = get_avatars_by_user(soc, {"users": ",".join(map(str, user_ids))})
        avatars = registered(avatars_res.Result.get("List")) if not avatars_res.Error else []

        for avatar in avatars:
            for item in goods:
                if str(item.get("ProducerValue")) == str(avatar.get("UserId")):
                    item["ProducerAvatar"] = avatar.get("ID")
                    item["ProducerAvatarName"] = avatar.get("Name")
                item.pop("ProducerValue", None)

        category_res = get_category_market_list(soc, {})
        categories = registered(category_res.Result.get("List")) if not category_res.Error else []

        for item in goods:
            for category in categories:
                if str(item.get("ProductClassId")) == str(category.get("CategoryId")):
                    item["ProductClass"] = category.get("Id")

        result["Content"] = goods

    elif request_data.get("QueryName") == "shareholder":
        fields = str(request_data.get("Fields") or "").split(",")
        result["Content"] = get_shareholder_content_list(
        user=user,
        fields=fields,
        category=str(request_data.get("Categories") or ""),
        result_content=result.get("Content") or [],
        adapter_rkc=profile_adapter(),
        adapter_soc=request_adapter(),
)

    elif request_data.get("QueryName") == "groups":
        groups_res = get_group_list(group_adapter())
        avatars_res = get_group_avatars(request_adapter())

        groups = groups_res.Result
        avatars = avatars_res.Result

        for avatar in avatars:
            for group in groups:
                if str(group.get("Id")) == str(avatar.get("CategoryId")):
                    group["GroupAvatar"] = avatar.get("Id")

        result["Content"] = groups


def build_thanka_stub(
    thanka_id: str = "",
    site_id: str = "",
    error: Any = True,
    raw_address: str = "",
    parsed_address: dict | None = None,
    method: str = "",
    params: dict | None = None,
    removed: Any = None,
    soap_fault: Any = None,
    soap_request: Any = None,
    soap_response: Any = None,
    status: Any = None,
) -> dict:
    is_site = bool(site_id)
    entity_id = site_id or thanka_id
    object_type = "site" if is_site else "article"

    result = {
        "Id": entity_id,
        "CabinetId": 0,
        "IsAdmin": False,
        "PrivacyLevel": 1,
        "Thanka": {
            "Id": entity_id,
            "Name": "КОГИТЕКА",
            "Annotation": "",
            "Privacy": 1,
            "Comments": False,
            "MainPage": True if is_site else False,
            "ParentId": "",
            "ParentName": "",
            "Author": "",
            "AuthorName": "",
        },
        "Object": {
            "Type": object_type,
            "Description": "",
            "Name": "КОГИТЕКА",
        },
        "MainPage": {
            "ID": entity_id,
            "Url": ""
        } if is_site else {},
        "AdmittedSubscribe": False,
        "Request": {},
        "Content": [],
        "Children": [],
        "AvatarList": [],
        "MyThankaList": [],
        "MySubscribeList": [],
        "DocumentsParts": [],
        "LinksTo": [],
        "LinksFrom": [],
        "LinksSectors": [],
        "Elements": [],
        "LocationEvent": [
            {"Name": ""},
            {"Name": ""},
            {"Name": ""},
        ],
        "Notifications": [],
        "SiteList": [],
        "Style": "",
        "ChildrenImage": {},
        "DocImage": {},
        "CenterImage": False,
        "ParentImage": False,
        "AuthorImage": False,
        "TypeName": "Сайт" if is_site else "Статья",
        "Accusativus": "сайт" if is_site else "статью",
        "Genitivus": "сайта" if is_site else "статьи",
        "Hash": now_hash(),
        "Error": error,
        "Debug": {
            "raw_address": raw_address,
            "parsed_address": parsed_address or {},
            "method": method,
            "params": params or {},
            "adapter_error": str(error),
            "removed": removed,
            "soap_fault": soap_fault,
            "soap_request": soap_request,
            "soap_response": soap_response,
            "status": status,
        },
    }

    if is_site:
        css_file = STYLE_DIR / f"{site_id}.css"
        result["Style"] = css_file.read_text(encoding="utf-8") if css_file.exists() else ""

    return result

@router.post("/thanka/getThanka")
@router.post("/thanka/getThanka.php")  # legacy alias
async def get_thanka_endpoint(request: Request):
    user, _ = await read_request_data(request)

    raw_address = user.get("address", "")
    request_host = request.headers.get("host", "").split(":")[0].lower()
    parsed_address = thanka_url_parser(raw_address, user, request_host)

    thanka_id = parsed_address.get("Id", "")
    site_id = parsed_address.get("SiteId", "")

    print("GET_THANKA_DEBUG user=", user)
    print("GET_THANKA_DEBUG host=", request_host)
    print("GET_THANKA_DEBUG raw_address=", raw_address)
    print("GET_THANKA_DEBUG parsed_address=", parsed_address)
    
    if not thanka_id and not site_id:
        print("GET_THANKA_DEBUG no thanka_id and no site_id")
        return json_response(
            build_thanka_stub(
                thanka_id=thanka_id,
                site_id=site_id,
                error="not found",
                raw_address=raw_address,
                parsed_address=parsed_address,
                method="",
                params={},
                removed=None,
                soap_fault=None,
                soap_request=None,
                soap_response=None,
                status=None,
            )
        )

    method = "GetSitePage" if site_id else "GetThanka"
    params = {
        "Id": thanka_id,
        "UserId": user.get("id", ""),
        "Login": user.get("login", ""),
        "SiteId": site_id,
    }

    print("GET_THANKA_DEBUG method=", method)
    print("GET_THANKA_DEBUG params=", params)

    ad = cogi_adapter()
    ad.debug = True
    res = ad.execute(method, params)

    error = getattr(res, "Error", None)
    result = getattr(res, "Result", None)
    result_dict = result if isinstance(result, dict) else {}
    removed = result_dict.get("Removed")
    status = getattr(res, "Status", None)
    soap_xml = getattr(res, "SoapXML", None)
    soap_fault = getattr(res, "SoapFault", None)

    print("GET_THANKA_DEBUG adapter_error=", error)
    print("GET_THANKA_DEBUG adapter_result=", result)
    print("GET_THANKA_DEBUG removed=", removed)
    print("GET_THANKA_DEBUG status=", status)
    print("GET_THANKA_DEBUG fault=", soap_fault)
    print("GET_THANKA_DEBUG soap_request=", getattr(soap_xml, "Request", None))
    print("GET_THANKA_DEBUG soap_response=", getattr(soap_xml, "Response", None))

    if error or removed is True or result_dict == {}:
        return json_response(
            build_thanka_stub(
                thanka_id=thanka_id,
                site_id=site_id,
                error=True,
                raw_address=raw_address,
                parsed_address=parsed_address,
                method=method,
                params=params,
                removed=removed,
                soap_fault=soap_fault.__dict__ if soap_fault else None,
                soap_request=getattr(soap_xml, "Request", None),
                soap_response=getattr(soap_xml, "Response", None),
                status=status.__dict__ if status else None,
            )
        )

    normalized = normalize_get_thanka_result(result_dict, thanka_id, site_id)

    if (normalized.get("Object") or {}).get("Type") == "request":
        enrich_request_content(normalized, user)

    set_result_arrays(normalized)

    return json_response(normalized)

@router.post("/thanka/setThanka")
@router.post("/thanka/setThanka.php")  # legacy alias
async def set_thanka_endpoint(request: Request):
    data, files = await read_request_data(request)
    data = build_nested_thanka_form(data)

    ad = cogi_adapter()
    result = None
    result_id = data.get("Id")
    hashtags_line = ""
    delete_hashtags = []

    obj = data.get("Object") or {}
    thanka = data.get("Thanka") or {}

    if obj.get("Description"):
        parsed, hashtags_line = parse_text(
        ad,
        str(obj.get("Description") or ""),
        thanka.get("Author"),
        )
        obj["Description"] = parsed
        data["Object"] = obj

    editor_type = data.get("EditorType")

    if editor_type == "edit":
        result_id = data.get("Id")

        if hashtags_line:
            res_links = ad.execute(
                "CreateLinksThankaHashtag",
                {
                    "thanka": result_id,
                    "hashtags": hashtags_line,
                },
            )
            delete_raw = res_links.Result.get("deletelist", "") if res_links.Result else ""
            delete_hashtags = delete_raw.split(",") if delete_raw else []

        obj["Description"] = remove_hashtags_links(obj.get("Description", ""), delete_hashtags)
        data["Object"] = obj

        res = ad.execute("SetThanka", data)
        result = res.Result

    elif editor_type in ("createsite", "create", "add"):
        res = ad.execute("CreateThanka", data)
        result = res.Result
        result_id = result.get("Id")

        if hashtags_line:
            ad.execute(
                "CreateLinksThankaHashtag",
                {
                    "thanka": result_id,
                    "hashtags": hashtags_line,
                },
            )

    elif editor_type == "object":
        res = ad.execute("SetObject", data)
        result = res.Result

    elif editor_type == "version":
        res = ad.execute("SetVersion", data)
        result = res.Result

    elif editor_type == "newversion":
        res = ad.execute("SetNewVersion", data)
        result = res.Result

    else:
        return json_response({"Error": "unknown EditorType"}, status_code=400)

    if "Picture" in files and result_id:
        pc = data.get("PictureCoords")
        if isinstance(pc, dict):
            coords = {
                "top": pc.get("top", 0),
                "left": pc.get("left", 0),
                "height": pc.get("height", 0),
                "width": pc.get("width", 0),
            }
        else:
            coords = {
                "top": data.get("PictureCoords_top", 0),
                "left": data.get("PictureCoords_left", 0),
                "height": data.get("PictureCoords_height", 0),
                "width": data.get("PictureCoords_width", 0),
            }
        # защита от нулевого crop: если width/height пустые или 0 — сбрасываем
        # в None, и save_thanka_picture возьмёт полный размер исходника.
        try:
            if float(coords.get("width") or 0) <= 0 or float(coords.get("height") or 0) <= 0:
                coords = {"top": 0, "left": 0, "width": 0, "height": 0}
        except (TypeError, ValueError):
            coords = {"top": 0, "left": 0, "width": 0, "height": 0}
        print("SET_THANKA_PIC", {"id": result_id, "coords": coords, "filename": getattr(files["Picture"], "filename", None)})
        await save_thanka_picture(result_id, files["Picture"], DATA_DIR, coords)

    if res.Error:
        return json_response({"Error": True}, status_code=404)

    return json_response(result)


def add_to_catalog(ad, data):
    res = ad.execute("AddToCatalog", data)
    res.Result["List"] = registered(res.Result.get("List"))
    for item in res.Result["List"]:
        item["Image"] = image_flag(item.get("ID"))
    return res


def normalize_list_response(res):
    res.Result["List"] = registered(res.Result.get("List"))
    for item in res.Result["List"]:
        item["Image"] = image_flag(item.get("ID"))
    return res


def get_all_versions(ad, data):
    res = ad.execute("GetAllVersions", data)
    res.Result["List"] = registered(res.Result.get("List"))
    return res


def get_version(ad, data):
    res = ad.execute("GetVersion", data)
    res.Result["LocationEvent"] = registered(res.Result.get("LocationEvent"))
    return res


def get_object(ad, data):
    res = ad.execute("GetObject", data)

    if not res.Error and res.Result.get("Removed") is False:
        result = res.Result
        result["Content"] = registered(result.get("Content"))
        result["LocationEvent"] = registered(result.get("LocationEvent"))

        thanka = result.get("Thanka") or {}
        obj = result.get("Object") or {}

        thanka["Annotation"] = thanka.get("Annotation") or ""
        obj["Description"] = obj.get("Description") or ""

        result["Thanka"] = thanka
        result["Object"] = obj

    return res


def remove_thanka(ad, data):
    thanka_id = data.get("Id")
    res = ad.execute("RemoveThanka", data)

    if thanka_id:
        safe_unlink(DATA_DIR / f"image{thanka_id}.jpg")

    return res


@router.post("/thanka")
@router.post("/thanka/thanka.php")  # legacy alias
async def thanka_methods_endpoint(request: Request):
    data, _ = await read_request_data(request)

    method = data.get("method")
    ad = cogi_adapter()
    paritet = profile_adapter()

    if method == "addLink":
        res = ad.execute("CreateLink", data)
    elif method == "addToCatalog":
        res = add_to_catalog(ad, data)
    elif method == "addToCollection":
        res = ad.execute("AddToCollection", data)
    elif method == "createFirstCollection":
        res = ad.execute("CreateFirstCollection", data)
    elif method == "moveThanka":
        res = ad.execute("MoveThanka", data)
    elif method == "getAllVersions":
        res = get_all_versions(ad, data)
    elif method == "getCollections":
        res = normalize_list_response(ad.execute("GetCollections", data))
    elif method == "getMyThanka":
        res = normalize_list_response(ad.execute("GetMyThanka", data))
    elif method == "getVersion":
        res = get_version(ad, data)
    elif method == "removeLink":
        res = ad.execute("RemoveLink", data)
    elif method == "removeThanka":
        res = remove_thanka(ad, data)
    elif method == "removeVersion":
        res = ad.execute("RemoveVersion", data)
    elif method == "setMain":
        res = ad.execute("SetMain", data)
    elif method == "sortSectors":
        res = ad.execute("SortSectors", data)
    elif method == "stampVersion":
        res = ad.execute("StampVersion", data)
    elif method == "getObject":
        res = get_object(ad, data)
    elif method == "getCatalogs":
        res = normalize_list_response(ad.execute("GetCatalogs", data))
    elif method == "checkCustomURL":
        res = ad.execute("CheckCustomURL", data)
    elif method == "getAuthorsAccount":
        res = get_authors_account(ad, data)
    elif method == "getShareHolder":
        res = get_shareholder(paritet, data)
    else:
        return json_response({"Error": "unknown method"}, status_code=400)

    return handle_adapter_response(res, "thanka")