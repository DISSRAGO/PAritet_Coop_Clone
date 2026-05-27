from fastapi import APIRouter, Request

from backend.modules.cogiteka.core.cache import cache
from backend.modules.cogiteka.core.config import COGI_REQUEST_SERVICE, MARKET_SERVICE, RKC_PATH, SOC_PATH
from backend.modules.cogiteka.integrations.portmonet.portmonet_api import PortmonetApi
from backend.shared.utils.utils import (
    handle_adapter_response,
    image_flag,
    json_response,
    now_hash,
    read_request_data,
    registered,
    strip_tags,
)

router = APIRouter()


def request_adapter():
    return PortmonetApi().create_adapter(COGI_REQUEST_SERVICE, SOC_PATH)


def market_adapter():
    return PortmonetApi().create_adapter(MARKET_SERVICE, RKC_PATH)


def get_all_thankas(ad, data):
    key = "fullThankaList"

    if cache.exists(key):
        full_list = cache.get(key)
        res = ad.execute("GetThankas")
    else:
        res = ad.execute("GetThankas")
        res.Result["List"] = registered(res.Result.get("List"))

        for item in res.Result["List"]:
            item["Image"] = image_flag(item.get("ID"))

        full_list = res.Result["List"]
        cache.set(key, full_list, ttl=24 * 60 * 60)

    if data.get("type") != "admin":
        full_list = [
            item for item in full_list
            if str(item.get("Privacy")) != "2"
        ]

    res.Result["Hash"] = now_hash()
    res.Result["List"] = full_list
    return res


def get_thanka_info(ad, data):
    return ad.execute("GetThankaInfo", data)


def get_goods_list(ad, tvt=None):
    params = {
        "PropertyList": [
            "Name",
            "Producer",
            "Count",
            "Price",
            "ProductClass",
            "Enabled",
            "Unit",
            "State",
            "Description",
            "ShortDescription",
        ],
        "TvtId": tvt,
    }

    result = ad.execute("GetGoodsList", params)
    goods = result.Result["GoodsList"]["Goods"]

    for item in goods:
        price_arr = item.get("Price", {}).get("AdditionalProps", {}).get("AdditionalPropsItem", [])
        item["Price"] = None

        for price in price_arr:
            if price.get("AdditionalPropsKey") == "Max":
                item["Price"] = price.get("_")

        item["Description"] = strip_tags(item.get("Description"))
        item["ShortDescription"] = strip_tags(item.get("ShortDescription"))

        producer = item.get("Producer") or {}
        item["ProducerId"] = producer.get("Id")
        item["ProducerName"] = producer.get("Name")
        item["ProducerValue"] = producer.get("Value")
        item.pop("Producer", None)

        product_class = item.get("ProductClass") or {}
        item["ProductClassId"] = product_class.get("Id")
        item["ProductClassName"] = product_class.get("Name")
        item.pop("ProductClass", None)

    result.Result = goods
    return result


def get_tvt(ad, data):
    params = {
        "ID": data.get("Id"),
        "PropertyList": [
            "Name",
            "Address",
            "Description",
        ],
    }
    return ad.execute("GetTvt", params)


def get_producer_list(ad, data):
    return ad.execute("GetMarketList", data)


def get_tvt_list(ad):
    params = {
        "PropertyList": [
            "Id",
            "Name",
            "Address",
            "Description",
        ],
    }

    result = ad.execute("GetTvtList", params)
    tvt_list = result.Result["TvtList"]["Tvt"]

    for item in tvt_list:
        item["Description"] = strip_tags(item.get("Description"))
        address = item.get("Address") or {}
        item["Address"] = address.get("Value")

    result.Result = tvt_list
    return result


def get_category_market_list(ad, data):
    return ad.execute("GetCategoryMarketList", data)


def get_group_list(ad):
    params = {
        "PropertyList": ["Name", "Description", "FullText"],
        "Filter": "def",
    }

    res = ad.execute("GetGroupList", params)
    result = res.Result["CognitiveObjects"]["CognitiveObject"]

    for item in result:
        item["Description"] = strip_tags(item.get("Description"))
        item["ShortDescription"] = strip_tags(item.get("FullText"))

    res.Result = result
    return res


def get_group_avatars(ad):
    res = ad.execute("GetGroupAvatars", {})
    res.Result = registered(res.Result.get("List"))
    return res


@router.post("/request/request.php")
@router.post("/request")
async def request_endpoint(request: Request):
    data, _ = await read_request_data(request)
    method = data.get("method")

    ad = request_adapter()
    market = market_adapter()

    if method == "getAllThankas":
        res = get_all_thankas(ad, data)
    elif method == "getThankaInfo":
        res = get_thanka_info(ad, data)
    elif method == "getGoodsList":
        tvt = data.get("TvtId") or data.get("tvt") or data.get("Id")
        res = get_goods_list(market, tvt)
    elif method == "getTvtList":
        res = get_tvt_list(market)
    elif method == "getProducerList":
        res = get_producer_list(ad, data)
    elif method == "getTvt":
        res = get_tvt(market, data)
    else:
        return json_response({})

    return handle_adapter_response(res, "request")