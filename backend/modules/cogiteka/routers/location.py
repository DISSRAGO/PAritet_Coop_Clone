import os

from fastapi import APIRouter, Request

from backend.modules.cogiteka.core.cache import cache
from backend.modules.cogiteka.core.config import COGI_COMMUNITY_SERVICE, SOC_PATH
from backend.modules.cogiteka.integrations.portmonet.portmonet_api import PortmonetApi
from backend.shared.utils.utils import json_response

router = APIRouter()

EXCLUDED_COUNTRY_IDS = {
    "214", "205", "164", "202", "190", "203", "161", "171", "210",
    "47", "42", "46", "52", "57", "64", "173", "66", "65", "167",
    "170", "53", "59", "32", "62", "56", "45", "33", "10", "204",
    "17", "26",
}

# Локальный режим без SOAP-адресника: отдаём заглушки, чтобы <Location>
# в редакторе не падал в catch (500 → "Произошла ошибка").
_USE_LOCAL = os.getenv("COGI_USE_PORTMONET", "0").strip().lower() not in {"1", "true", "yes", "on"}

_LOCAL_COUNTRIES = [{"Id": "1", "Name": "Россия"}]
_LOCAL_REGIONS = [{"Id": "1", "Name": "Новосибирская обл."}]
_LOCAL_CITIES = [{"Id": "1", "Name": "Новосибирск г."}]


def adapter():
    # ADDRESS_SERVICE в локальном режиме не используется, передаём пустую строку.
    return PortmonetApi().create_adapter("", SOC_PATH)


def get_country(ad):
    if cache.exists("CountryList"):
        return cache.get("CountryList")

    res = ad.execute("GetCountryList", "")
    countries = res.Result["Result"]["Country"]
    countries = [c for c in countries if str(c.get("Id")) not in EXCLUDED_COUNTRY_IDS]
    res.Result["Result"]["Country"] = countries

    cache.set("CountryList", res)
    return res


def get_region(ad, value):
    key = "RegionList" + str(value)
    if cache.exists(key):
        return cache.get(key)

    res = ad.execute("GetRegionList", {"CountryId": value})
    cache.set(key, res)
    return res


def get_city(ad, value):
    key = "CityList" + str(value)
    if cache.exists(key):
        return cache.get(key)

    res = ad.execute("GetCityList", {"RegionId": value})
    cache.set(key, res)
    return res


@router.get("/location/location.php")
@router.get("/location")
async def location_endpoint(request: Request):
    method = request.query_params.get("method")
    value = request.query_params.get("value")

    # В локальном режиме отдаём минимальные справочники — собственный адресник ещё
    # не реализован, а SOAP-бэкенд недоступен.
    if _USE_LOCAL:
        if method == "country":
            return json_response({"Country": _LOCAL_COUNTRIES})
        if method == "region":
            return json_response({"Region": _LOCAL_REGIONS})
        if method == "city":
            return json_response({"City": _LOCAL_CITIES})
        return json_response({})

    ad = adapter()

    if method == "country":
        res = get_country(ad)
    elif method == "region":
        res = get_region(ad, value)
    elif method == "city":
        res = get_city(ad, value)
    else:
        return json_response({})

    return json_response(res.Result["Result"])