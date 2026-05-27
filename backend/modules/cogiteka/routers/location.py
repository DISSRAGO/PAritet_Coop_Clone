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


def adapter():
    return PortmonetApi().create_adapter(ADDRESS_SERVICE, SOC_PATH)


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