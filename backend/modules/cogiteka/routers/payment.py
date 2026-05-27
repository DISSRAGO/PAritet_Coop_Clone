from fastapi import APIRouter, Request

from backend.modules.cogiteka.core.config import COGI_PAYMENT_SERVICE, SOC_PATH
from backend.modules.cogiteka.integrations.portmonet.portmonet_api import PortmonetApi
from backend.shared.utils.utils import handle_adapter_response, read_request_data

router = APIRouter()


def adapter():
    return PortmonetApi().create_adapter(COGI_PAYMENT_SERVICE, SOC_PATH)


METHODS = {
    "buyAccess": lambda ad, data: ad.execute("BuyAccess", data),
    "Transfer": lambda ad, data: ad.execute("SendDonut", data),
}


@router.post("/payment/payment.php")
@router.post("/payment")
async def payment_endpoint(request: Request):
    data, _ = await read_request_data(request)
    res = METHODS[data.get("method")](adapter(), data)
    return handle_adapter_response(res, "payment")
    