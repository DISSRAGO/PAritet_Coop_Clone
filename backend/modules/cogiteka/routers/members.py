from fastapi import APIRouter, Request

from backend.modules.cogiteka.core.config import COGI_MEMBERS_SERVICE, SOC_PATH
from backend.modules.cogiteka.integrations.portmonet.portmonet_api import PortmonetApi
from backend.shared.utils.utils import handle_adapter_response, read_request_data, registered

router = APIRouter()


def adapter():
    return PortmonetApi().create_adapter(COGI_MEMBERS_SERVICE, SOC_PATH)


def get_thanka_subscriber_list(ad, data):
    res = ad.execute("GetThankaSubscriberList", data)
    res.Result["AdmittedSubscriberList"] = registered(res.Result.get("AdmittedSubscriberList"))
    res.Result["UnadmittedSubscriberList"] = registered(res.Result.get("UnadmittedSubscriberList"))
    return res


METHODS = {
    "getThankaSubscriberList": get_thanka_subscriber_list,
    "accertSubscriber": lambda ad, data: ad.execute("AccertSubscriber", data),
    "rejectSubscriber": lambda ad, data: ad.execute("RejectSubscriber", data),
    "addThankaSubscriber": lambda ad, data: ad.execute("AddThankaSubscriber", data),
    "thankaUnsubscribe": lambda ad, data: ad.execute("ThankaUnsubscribe", data),
}


@router.post("/members/members.php")
@router.post("/members")
async def members_endpoint(request: Request):
    data, _ = await read_request_data(request)
    res = METHODS[data.get("method")](adapter(), data)
    return handle_adapter_response(res, "members")