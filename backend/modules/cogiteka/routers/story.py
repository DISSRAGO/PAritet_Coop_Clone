from fastapi import APIRouter, Request

from backend.modules.cogiteka.core.config import COGI_STORY_SERVICE, SOC_PATH
from backend.modules.cogiteka.integrations.portmonet.portmonet_api import PortmonetApi
from backend.shared.utils.utils import handle_adapter_response, image_flag, now_hash, read_request_data, registered

router = APIRouter()


def adapter():
    return PortmonetApi().create_adapter(COGI_STORY_SERVICE, SOC_PATH)


def get_story(ad, data):
    res = ad.execute("GetStory", data)
    res.Result["StoryList"] = registered(res.Result.get("StoryList"))

    for item in res.Result["StoryList"]:
        item["Image"] = image_flag(item.get("Thanka"))

    res.Result["Hash"] = now_hash()
    return res


@router.post("/story/story.php")
@router.post("/story")
async def story_endpoint(request: Request):
    data, _ = await read_request_data(request)
    method = data.get("method")
    ad = adapter()

    if method == "addComment":
        res = ad.execute("AddNoteToStory", data)
    elif method == "getStory":
        res = get_story(ad, data)
    elif method == "removeItem":
        res = ad.execute("RemoveStory", data)
    else:
        res = None

    return handle_adapter_response(res, "story")