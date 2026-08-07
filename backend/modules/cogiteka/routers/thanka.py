import re
import uuid as uuid
from typing import Any


from fastapi import APIRouter, Request
from fastapi import HTTPException, status


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
from backend.modules.cogiteka.integrations.portmonet.portmonet_api import PortmonetApi
from backend.modules.cogiteka.integrations.portmonet.request_api import (
    get_category_market_list,
    get_goods_list,
    get_group_avatars,
    get_group_list,
    get_tvt,
)
from backend.shared.utils.utils import (
    build_nested_thanka_form,
    get_value,
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
from backend.shared.db import get_conn


router = APIRouter()


SYSTEM_ROOT_THANKA_ID = "9349b844-0226-49f3-b72b-16854cb32371"



# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────


def api() -> PortmonetApi:
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
        "article": ("", "", ""),
        "avatar": ("", "", ""),
        "cabinet": ("", "", ""),
        "catalog": ("", "", ""),
        "collection": ("", "", ""),
        "document": ("", "", ""),
        "request": ("", "", ""),
        "link": ("", "", ""),
        "repost": ("", "", ""),
        "product": ("", "", ""),
    }
    typename, accusativus, genitivus = mapping.get(thanka_type, ("", "", ""))
    return {"TypeName": typename, "Accusativus": accusativus, "Genitivus": genitivus}



def set_result_arrays(result: dict) -> None:
    list_fields = [
        "Children", "DocumentsParts", "AvatarList", "MyThankaList",
        "MySubscribeList", "Content", "Elements", "LinksTo", "LinksFrom", "LinksSectors",
    ]
    for field in list_fields:
        items = result.get(field) or []
        if not isinstance(items, list):
            continue
        for idx, item in enumerate(items):
            if not isinstance(item, dict):
                continue
            item["Annotation"] = html_decode(item.get("Annotation"))
            item["Image"] = image_flag(item.get("ID"))
            if field == "Children":
                result.setdefault("ChildrenImage", {})[idx] = item["Image"]
            if field == "DocumentsParts":
                result.setdefault("DocImage", {})[idx] = item["Image"]
    thanka = result.get("Thanka") or {}
    result["CenterImage"] = image_flag(result.get("Id"))
    result["ParentImage"] = image_flag(thanka.get("ParentId"))
    result["AuthorImage"] = image_flag(thanka.get("Author"))



def get_avatars_by_user(adapter, data):
    return adapter.execute("GetAvatarsByUser", data)



def get_referal_shareholder_list(adapter, data):
    return adapter.execute("GetReferalShareHolderList", data)



def get_shareholder(adapter, data):
    data["PropertyList"] = ["Account", "Account.Money", "StateName", "Account.FullNumber",
                            "Account.Number", "ContractId", "Status"]
    return adapter.execute("GetShareHolder", data)



def get_authors_account(adapter, data):
    return adapter.execute("GetAuthorsAccountNumber", data)



def as_list_safe(value: Any) -> list:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]



def get_shareholder_content_list(user: dict, fields: list[str], category: str,
                                 result_content: list, adapter_rkc, adapter_soc):
    content = []
    if category == "invited":
        params = {
            "UserId": user.get("id"),
            "PropertyList": ["UserProfile", "UserProfile.Name", "UserProfile.Login",
                             "UserProfile.SMSPhone", "Account", "DateRegister", "StateName",
                             "ContractId", "Account.FullNumber"],
        }
        rs = get_referal_shareholder_list(adapter_rkc, params)
        if not rs.Error:
            content = registered(rs.Result) or as_list_safe(get_value(rs.Result, "ShareHolderList"))
        else:
            content = result_content or []
    ids = ",".join(str(get_value(item, "Id") or get_value(item, "ID")) for item in content)
    rs2 = get_avatars_by_user(adapter_soc, {"users": ids})
    avatars = registered(rs2.Result) if not rs2.Error else []
    result = []
    for usr in content:
        item = {}
        if "HolderAvatar" in fields:
            for avatar in avatars:
                if str(get_value(usr, "Id") or get_value(usr, "ID")) == str(get_value(avatar, "UserId")):
                    item["AvatarId"] = get_value(avatar, "ID")
                    item["HolderAvatar"] = get_value(avatar, "AuthorName")
        if "Date" in fields:
            item["Date"] = get_value(usr, "DateRegister")
        if "HolderName" in fields:
            profile = get_value(usr, "UserProfile") or {}
            item["HolderName"] = get_value(profile, "Name")
        if "HolderStatus" in fields:
            item["HolderStatus"] = get_value(usr, "StateName")
        if "AccountNumber" in fields:
            account = get_value(usr, "Account") or {}
            item["AccountNumber"] = get_value(account, "FullNumber")
        result.append(item)
    return result



def resolve_root_target_by_host(host: str) -> dict[str, str]:
    host = (host or "").split(":")[0].lower()
    hostmap = {
        "clone.paritet.club": {"Id": "18352", "SiteId": ""},
        "www.clone.paritet.club": {"Id": "18352", "SiteId": ""},
    }
    return hostmap.get(host, {"Id": str(START_THANKA_ID), "SiteId": ""})



def resolve_user_cabinet(ad, user: dict) -> str:
    """
    Возвращает thanka_id кабинета авторизованного пользователя (с кэшем).


    Приоритет идентификации:
    1) subjectid / subject_id из user
    2) login
    """
    thanka_id = ""


    if not isinstance(user, dict):
        return thanka_id


    login = str(user.get("login") or "").strip()
    subjectid = str(user.get("subjectid") or user.get("subject_id") or "").strip()
    userid = user.get("id")


    if not login and not subjectid:
        return thanka_id


    key = f"subj:{subjectid}:profile" if subjectid else f"login:{login}:profile"


    try:
        if cache.exists(key):
            return str(cache.get(key) or "").strip()
    except Exception:
        pass


    try:
        res = ad.execute(
            "GetCabinetByUser",
            {
                "UserId": userid,
                "Login": login,
                "SubjectId": subjectid,
            },
        )
    except Exception as exc:
        print("DEBUG GetCabinetByUser execute failed", {
            "login": login,
            "subjectid": subjectid,
            "userid": userid,
            "exc": repr(exc),
        })
        return thanka_id


    print("DEBUG GetCabinetByUser", {
        "login": login,
        "subjectid": subjectid,
        "userid": userid,
        "error": getattr(res, "Error", None),
        "result": getattr(res, "Result", None),
        "status": getattr(getattr(res, "Status", None), "dict", lambda: None)(),
    })


    if getattr(res, "Error", None):
        return thanka_id


    result_obj = getattr(res, "Result", None) or {}


    raw_id = get_value(result_obj, "Id")


    thanka_id = str(raw_id or "").strip()


    if thanka_id:
        try:
            cache.set(key, thanka_id)
        except Exception:
            pass


    return thanka_id


def is_uuid(s: str) -> bool:
    """Проверяет, что строка — канонический UUID."""
    try:
        uuid.UUID(str(s))
        return True
    except (ValueError, AttributeError, TypeError):
        return False


def thanka_url_parser(url: str, user: dict, host: str) -> dict[str, str]:
    """
    Парсит адрес (то, что приходит как address) в пару {Id, SiteId}.


    Логика максимально близка к легаси:
    - "" / "/"            → кабинет пользователя, иначе корневая тханка по host_map
    - /navigator/...      → thanka по UUID/числу или по CustomURL через GetIdByCustomURL
    - /profile            → кабинет пользователя, без фоллбэка на админскую тханку
    - /sitepage/{id}      → site_id
    - прочие пути         → резолвятся через GetIdByCustomURL
    """
    ad = cogi_adapter()


    thanka_id = ""
    site_id = ""


    if url in ("", "/"):
        thanka_id = resolve_user_cabinet(ad, user)
        if not thanka_id:
            root_target = resolve_root_target_by_host(host)
            thanka_id = str(root_target.get("Id", "")) if root_target.get("Id") else ""
            site_id = str(root_target.get("SiteId", "")) if root_target.get("SiteId") else ""
    else:
        address = url.split("/")
        if address and address[0] == "":
            address.pop(0)


        first = address[0] if len(address) > 0 else ""
        second = address[1] if len(address) > 1 else ""


        if first in ("navigator", "lite"):
            if second == "":
                thanka_id = resolve_user_cabinet(ad, user)
            else:
                last_seg = address[-1]
                if is_uuid(last_seg) or is_digit(last_seg):
                    thanka_id = last_seg
                else:
                    res = ad.execute("GetIdByCustomURL", {"url": last_seg})
                    result_obj = getattr(res, "Result", None) or {}
                    rtype = get_value(result_obj, "Type")


                    if rtype == "navigator":
                        thanka_id = str(get_value(result_obj, "Id") or "").strip()
                    elif rtype == "sitepage":
                        site_id = str(get_value(result_obj, "Id") or "").strip()
                    else:
                        thanka_id = last_seg


        elif first == "profile":
            thanka_id = resolve_user_cabinet(ad, user)
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
                result_obj = getattr(res, "Result", None) or {}
                rtype = get_value(result_obj, "Type")


                if rtype == "navigator":
                    thanka_id = str(get_value(result_obj, "Id") or "").strip()
                elif rtype == "sitepage":
                    site_id = str(get_value(result_obj, "Id") or "").strip()


    return {"Id": thanka_id, "SiteId": site_id}



def parse_text(adapter, text: str, author: Any) -> tuple[str, str]:
    text = text.replace("&nbsp;", " ")
    tags = re.findall(r"#[\w-]+", text, flags=re.UNICODE)
    normalized = []
    for tag in tags:
        parts = re.split(r"[^a-z^A-Z]", tag)
        normalized.append("".join(parts).lower())
    res = adapter.execute("CreateHashtagsLeafs", {"Names": "|".join(normalized), "Author": author})
    result = res.Result
    id_list_val = get_value(result, "IDList") if result else None
    line_list = str(id_list_val).split("|") if id_list_val is not None else []
    words = text.split(" ")
    for i, word in enumerate(words):
        for j, tag in enumerate(normalized):
            if tag in word and "href" not in word and j < len(line_list):
                words[i] = f'<a href="{SITE_NAVIGATOR_URL}{line_list[j]}">{word}</a>'
    return " ".join(words), "|".join(line_list)



def remove_hashtags_links(description: str, delete_hashtags: list[str]) -> str:
    if not delete_hashtags:
        return description
    anchors = re.findall(r"<a.+?>.*?</a>", description, flags=re.UNICODE)
    chunks = re.split(r"<a.+?>.*?</a>", description, flags=re.UNICODE)
    replace_map = {}
    for anchor in anchors:
        for deleted in delete_hashtags:
            if deleted and deleted in anchor:
                replace_map[anchor] = strip_tags(anchor)
    result = []
    for chunk in chunks:
        result.append(replace_map.get(chunk, chunk))
    return "".join(result)



def normalize_get_thanka_result(result: dict, thanka_id: str, site_id: str) -> dict:
    if thanka_id:
        result["Id"] = thanka_id
    if site_id:
        result["Id"] = site_id


    css_file = STYLE_DIR / f"{site_id}.css"
    result["Style"] = css_file.read_text(encoding="utf-8") if css_file.exists() else ""


    for field in ("Children", "Content", "AvatarList"):
        result[field] = registered(result.get(field))


    result["Hash"] = now_hash()


    for field in (
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
    ):
        result[field] = registered(result.get(field))


    if not isinstance(result.get("Notifications"), list):
        result["Notifications"] = []


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
            for item in special_props.split("|"):
                if "tvt" in item:
                    tvt = item.split("|")[1]
        request_data["TvtId"] = tvt
        market = market_adapter()
        soc = request_adapter()
        if tvt:
            tvt_res = get_tvt(market, Id=tvt)
            if not tvt_res.Error:
                tvt_data = get_value(tvt_res.Result, "Tvt")
                if tvt_data and get_value(tvt_data, "Address"):
                    request_data["TvtData"] = tvt_data
        goods_res = get_goods_list(market, tvt)
        goods = goods_res.Result
        user_ids = []
        for item in goods:
            producer = get_value(item, "ProducerValue")
            if producer and producer not in user_ids:
                user_ids.append(producer)
        avatars_res = get_avatars_by_user(soc, {"users": ",".join(map(str, user_ids))})
        avatars = registered(avatars_res.Result) if not avatars_res.Error else []
        for avatar in avatars:
            for item in goods:
                if str(get_value(item, "ProducerValue")) == str(get_value(avatar, "UserId")):
                    item["ProducerAvatar"] = get_value(avatar, "ID")
                    item["ProducerAvatarName"] = get_value(avatar, "Name")
        if goods and isinstance(goods[-1], dict):
            goods[-1].pop("ProducerValue", None)
        category_res = get_category_market_list(soc)
        categories = registered(category_res.Result) if not category_res.Error else []
        for item in goods:
            for category in categories:
                if str(get_value(item, "ProductClassId")) == str(get_value(category, "CategoryId")):
                    item["ProductClass"] = get_value(category, "Id")
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
                if str(get_value(group, "Id")) == str(get_value(avatar, "CategoryId")):
                    group["GroupAvatar"] = get_value(avatar, "Id")
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
            "Name": "",
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
            "Name": "",
        },
        "MainPage": {
            "ID": entity_id,
            "Url": "" if is_site else "",
        },
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
        "LocationEvent": {"Name": ""},
        "Notifications": [],
        "SiteList": [],
        "Style": "",
        "ChildrenImage": [],
        "DocImage": [],
        "CenterImage": False,
        "ParentImage": False,
        "AuthorImage": False,
        "TypeName": "" if is_site else "",
        "Accusativus": "" if is_site else "",
        "Genitivus": "" if is_site else "",
        "Hash": now_hash(),
        "Error": error,
        "Debug": {
            "rawAddress": raw_address,
            "parsedAddress": parsed_address or {},
            "method": method,
            "params": params or {},
            "adapterError": str(error),
            "removed": removed,
            "soapFault": soap_fault,
            "soapRequest": soap_request,
            "soapResponse": soap_response,
            "status": status,
        },
    }


    if is_site:
        css_file = STYLE_DIR / f"{site_id}.css"
        result["Style"] = css_file.read_text(encoding="utf-8") if css_file.exists() else ""


    return result
# ─────────────────────────────────────────────────────────────────────────────
# Эндпоинты тханки
# ─────────────────────────────────────────────────────────────────────────────


@router.get("/thanka/system-root")
async def get_system_root_thanka():
    return {"thankaId": SYSTEM_ROOT_THANKA_ID, "title": "admin", "status": "active", "isSystem": True}



@router.get("/thanka/system-root/types")
async def get_system_root_types():
    async with get_conn() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT thanka_type_id, code, name, 0::bigint AS count FROM homonet.thanka_type ORDER BY name"
            )
            rows = await cur.fetchall()
            await cur.execute(
                "SELECT tt.code, COUNT(t.thanka_id) AS cnt FROM homonet.thanka_type tt "
                "LEFT JOIN homonet.thanka t ON t.thanka_type_id = tt.thanka_type_id GROUP BY tt.code"
            )
            counts = await cur.fetchall()
    palette = {
        "bot": "722ed1", "document": "13c2c2", "catalog": "faad14",
        "collection": "eb2f96", "link": "52c41a", "article": "1890ff", "product": "ff4d4f",
    }
    count_by_code = {row["code"]: row["cnt"] for row in counts}
    return {
        "data": [
            {
                "typeId": str(row["thanka_type_id"]),
                "code": row["code"],
                "name": row["name"],
                "color": palette.get(row["code"], "8c8c8c"),
                "count": int(count_by_code.get(row["code"], 0)),
            }
            for row in rows
        ]
    }



@router.get("/thanka/types/{type_code}/thankas")
async def get_thankas_by_type(type_code: str):
    async with get_conn() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT thanka_type_id, code, name FROM homonet.thanka_type WHERE code = %s", (type_code,)
            )
            type_row = await cur.fetchone()
            if not type_row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="thanka_type_not_found")
            await cur.execute(
                "SELECT t.thanka_id::text AS thanka_id, t.title AS title, t.status::text AS status, "
                "t.created_at AS created_at FROM homonet.thanka t WHERE t.thanka_type_id = %s "
                "ORDER BY t.created_at DESC",
                (type_row["thanka_type_id"],),
            )
            rows = await cur.fetchall()
    data = [
        {
            "thankaId": row["thanka_id"],
            "title": row["title"],
            "status": row["status"],
            "typeCode": type_row["code"],
            "typeName": type_row["name"],
            "createdAt": row["created_at"].isoformat(),
        }
        for row in rows
    ]
    return {
        "type": {
            "typeId": str(type_row["thanka_type_id"]),
            "code": type_row["code"],
            "name": type_row["name"],
            "color": "8c8c8c",
            "count": len(data),
        },
        "data": data,
    }



# ─────────────────────────────────────────────────────────────────────────────
# GET /thanka-url/{thanka_id}
# ─────────────────────────────────────────────────────────────────────────────


@router.get("/thanka-url/{thanka_id}")
async def get_thanka_url(thanka_id: str):
    """
    Возвращает human-readable URL тханки из БД (поле custom_url в cogobject.current_content).
    Кэшируется 10 минут.
    """
    cache_key = f"thanka_url:{thanka_id}"
    if cache.exists(cache_key):
        cached = cache.get(cache_key)
        if cached:
            return cached


    custom_url: str = ""
    async with get_conn() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                SELECT
                    COALESCE(
                        (co.current_content->>'custom_url'),
                        (co.current_content->>'CustomURL')
                    ) AS custom_url
                FROM homonet.thanka t
                LEFT JOIN homonet.cogobject co
                    ON co.thanka_id = t.thanka_id
                WHERE t.thanka_id = %s::uuid
                LIMIT 1
                """,
                (thanka_id,),
            )
            row = await cur.fetchone()
        if row:
            custom_url = str(row["custom_url"] or "").strip()


    base = (SITE_NAVIGATOR_URL or "").rstrip("/") or "https://dev.clone.paritet.club"


    if custom_url:
        slug = f"/thanka/{custom_url.lstrip('/')}"
        full_url = f"{base}{slug}"
    else:
        slug = f"/navigator/{thanka_id}"
        full_url = f"{base}{slug}"


    payload = {
        "thankaId": thanka_id,
        "customUrl": custom_url or None,
        "slug": slug,
        "fullUrl": full_url,
    }
    cache.set(cache_key, payload, ttl=600)
    return payload



# ─────────────────────────────────────────────────────────────────────────────
# SOAP-прокси эндпоинты (POST)
# ─────────────────────────────────────────────────────────────────────────────


@router.post("/thanka/getThanka")
@router.post("/thanka/getThanka.php")
async def get_thanka_endpoint(request: Request):
    user, _ = await read_request_data(request)
    raw_address = user.get("address")
    request_host = request.headers.get("host", "").split(":")[0].lower()
    parsed_address = thanka_url_parser(raw_address, user, request_host)
    thanka_id = parsed_address.get("Id")
    site_id = parsed_address.get("SiteId")


    if not thanka_id and not site_id:
        return json_response(build_thanka_stub(
            thanka_id=thanka_id, site_id=site_id, error="not found",
            raw_address=raw_address, parsed_address=parsed_address,
            method="", params=None,
        ))


    method = "GetSitePage" if site_id else "GetThanka"
    params = {
        "Id": thanka_id, "UserId": user.get("id", ""),
        "Login": user.get("login", ""), "SubjectId": user.get("subjectid", ""),
        "SiteId": site_id,
    }
    ad = cogi_adapter()
    res = ad.execute(method, params)
    error = getattr(res, "Error", None)
    result = getattr(res, "Result", None)
    result_dict = result if isinstance(result, dict) else {}
    removed = result_dict.get("Removed")
    status_obj = getattr(res, "Status", None)
    soap_xml = getattr(res, "SoapXML", None)
    soap_fault = getattr(res, "SoapFault", None)


    if error or removed is True or not result_dict:
        return json_response(build_thanka_stub(
            thanka_id=thanka_id, site_id=site_id, error=True,
            raw_address=raw_address, parsed_address=parsed_address,
            method=method, params=params, removed=removed,
            soap_fault=soap_fault.dict() if soap_fault else None,
            soap_request=getattr(soap_xml, "Request", None),
            soap_response=getattr(soap_xml, "Response", None),
            status=status_obj.dict() if status_obj else None,
        ))


    normalized = normalize_get_thanka_result(result_dict, thanka_id, site_id)
    if (normalized.get("Object") or {}).get("Type") == "request":
        enrich_request_content(normalized, user)
    set_result_arrays(normalized)
    return json_response(normalized)



@router.post("/thanka/setThanka")
@router.post("/thanka/setThanka.php")
async def set_thanka_endpoint(request: Request):
    data, files = await read_request_data(request)
    data = build_nested_thanka_form(data)
    ad = cogi_adapter()
    result = None
    result_id = get_value(data, "Id")
    hashtags_line = ""
    delete_hashtags = []
    obj = data.get("Object") or {}
    thanka = data.get("Thanka") or {}
    if obj.get("Description"):
        parsed, hashtags_line = parse_text(ad, str(obj.get("Description") or ""), thanka.get("Author"))
        obj["Description"] = parsed
        data["Object"] = obj
    editor_type = data.get("EditorType")
    elements_list: list[dict] = []
    if editor_type == "edit":
        result_id = get_value(data, "Id")
        if hashtags_line:
            res_links = ad.execute("CreateLinksThankaHashtag", {"thanka": result_id, "hashtags": hashtags_line})
            delete_raw = get_value(res_links.Result, "deletelist")
            delete_hashtags = delete_raw.split("|") if delete_raw else []
            obj["Description"] = remove_hashtags_links(obj.get("Description", ""), delete_hashtags)
            data["Object"] = obj
        res = ad.execute("SetThanka", data)
        result = res.Result
    elif editor_type in ("createsite", "create", "add"):
        res = ad.execute("CreateThanka", data)
        if getattr(res, "Error", False):
            raise HTTPException(status_code=400, detail=(getattr(res, "Status", None) and res.Status.Text) or "create_thanka_failed")
        result = res.Result
        result_id = get_value(result, "Id")
        if hashtags_line:
            ad.execute("CreateLinksThankaHashtag", {"thanka": result_id, "hashtags": hashtags_line})
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


    if result_id:
        async with get_conn() as conn:
            type_code = str(obj.get("Type") or "").lower()
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT thanka_type_id FROM homonet.thanka_type WHERE code = %s", (type_code,)
                )
                type_row = await cur.fetchone()
                thanka_type_id = type_row["thanka_type_id"] if type_row else None
                author_id = str(thanka.get("Author") or "").strip() or None
                title = str(thanka.get("Name") or thanka.get("Title") or "").strip()
                status_val = "draft"
                parent_id = str(thanka.get("ParentId") or "").strip() or None
                await cur.execute(
                    """
                    INSERT INTO homonet.thanka
                        (thanka_id, thanka_type_id, author_id, title, status, created_at, parent_id, is_system)
                    VALUES (%s::uuid, %s::uuid, %s::uuid, %s, %s::homonet.thanka_status_enum, now(), %s::uuid, false)
                    ON CONFLICT (thanka_id) DO UPDATE
                    SET thanka_type_id = EXCLUDED.thanka_type_id,
                        title = EXCLUDED.title,
                        status = EXCLUDED.status,
                        parent_id = EXCLUDED.parent_id
                    """,
                    (result_id, thanka_type_id, author_id, title, status_val, parent_id),
                )
        if "Elements" in data:
            raw_elements = data.get("Elements")
            if isinstance(raw_elements, str):
                sep = "|" if "|" in raw_elements else ","
                elements_list = [{"ID": s.strip()} for s in raw_elements.split(sep)]
            elif isinstance(raw_elements, list):
                elements_list = [
                    {"ID": str(it.strip())} if not isinstance(it, dict)
                    else {"ID": str(it.get("ID") or it.get("Id") or "").strip()}
                    for it in raw_elements
                ]
            else:
                elements_list = []
            if any(el.get("ID") for el in elements_list):
                ad.execute("SetElements", {"Id": result_id, "Elements": elements_list})
        elif editor_type == "edit":
            ad.execute("SetElements", {"Id": result_id, "Elements": elements_list})


    if "Picture" in files and result_id:
        pc = data.get("PictureCoords")
        if isinstance(pc, dict):
            coords = {k: pc.get(k, 0) for k in ("top", "left", "height", "width")}
        else:
            coords = {"top": 0, "left": 0, "height": 0, "width": 0}
        try:
            if float(coords.get("width") or 0) <= 0 or float(coords.get("height") or 0) <= 0:
                coords = {"top": 0, "left": 0, "width": 0, "height": 0}
        except (TypeError, ValueError):
            coords = {"top": 0, "left": 0, "width": 0, "height": 0}
        await save_thanka_picture(result_id, files["Picture"], DATA_DIR, coords)


    if res.Error:
        return json_response({"Error": True}, status_code=404)
    return json_response(result)



def add_to_catalog(ad, data):
    res = ad.execute("AddToCatalog", data)
    res.ResultList = registered(res.Result)
    for item in res.ResultList:
        item_id = get_value(item, "ID")
        if isinstance(item, dict):
            item["Image"] = image_flag(item_id)
        else:
            item.Image = image_flag(item_id)
    return res



def normalize_list_response(res):
    res.ResultList = registered(res.Result)
    for item in res.ResultList:
        item_id = get_value(item, "ID")
        if isinstance(item, dict):
            item["Image"] = image_flag(item_id)
        else:
            item.Image = image_flag(item_id)
    return res



def get_all_versions(ad, data):
    res = ad.execute("GetAllVersions", data)
    res.ResultList = registered(res.Result)
    return res



def get_version(ad, data):
    res = ad.execute("GetVersion", data)
    res.ResultLocationEvent = registered(get_value(res.Result, "LocationEvent"))
    return res



def get_object(ad, data):
    res = ad.execute("GetObject", data)
    removed = get_value(res.Result, "Removed")
    if not res.Error and removed is False:
        result = res.Result
        if isinstance(result, dict):
            result["Content"] = registered(result.get("Content"))
            result["LocationEvent"] = registered(result.get("LocationEvent"))
            thanka = result.get("Thanka") or {}
            obj = result.get("Object") or {}
            thanka["Annotation"] = get_value(thanka, "Annotation") or ""
            obj["Description"] = get_value(obj, "Description") or ""
            result["Thanka"] = thanka
            result["Object"] = obj
    return res



def remove_thanka(ad, data):
    thanka_id = get_value(data, "Id")
    res = ad.execute("RemoveThanka", data)
    if thanka_id:
        safe_unlink(DATA_DIR / f"image{thanka_id}.jpg")
    return res



@router.post("/thanka")
@router.post("/thanka/thanka.php")
async def thanka_methods_endpoint(request: Request):
    data, _ = await read_request_data(request)
    method = data.get("method")
    data.pop("method", None)
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
    return handle_adapter_response(res)