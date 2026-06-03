from fastapi import APIRouter, Request

from backend.modules.cogiteka.core.cache import cache
from backend.modules.cogiteka.core.config import COGI_COMMUNITY_SERVICE, SOC_PATH
from backend.modules.cogiteka.integrations.portmonet.portmonet_api import PortmonetApi
from backend.shared.utils.utils import (
    as_list,
    handle_adapter_response,
    image_flag,
    read_request_data,
    registered,
)

router = APIRouter()


def create_adapter():
    return PortmonetApi().create_adapter(COGI_COMMUNITY_SERVICE, SOC_PATH)


def create_comment(adapter, data):
    cache.delete("comments" + str(data.get("Theme", "")))
    return adapter.execute("CreateComment", data)


def create_theme(adapter, data):
    return adapter.execute("CreateTheme", data)


def delete_comment(adapter, data):
    cache.delete("comments" + str(data.get("Theme", "")))
    res = adapter.execute("DeleteComment", data)
    if res.Result and res.Result.get("ThemeList"):
        res.Result["ThemeList"] = registered(res.Result["ThemeList"])
    return res


def delete_theme(adapter, data):
    res = adapter.execute("RemoveTheme", data)
    if res.Result and res.Result.get("ThemeList"):
        res.Result["ThemeList"] = registered(res.Result["ThemeList"])
    return res


def edit_comment(adapter, data):
    return adapter.execute("EditComment", data)


def get_all_comments(adapter, data):
    res = adapter.execute("GetAllComments", data)
    result = res.Result
    result["CommentList"] = registered(result.get("CommentList"))
    for item in result["CommentList"]:
        item["Image"] = image_flag(item.get("Author"))
    return res


def get_answers(adapter, data):
    res = adapter.execute("GetMyAnswers", data)
    result = res.Result
    result["CommentList"] = registered(result.get("CommentList"))
    for item in result["CommentList"]:
        item["Image"] = image_flag(item.get("Author"))
    return res


def get_comments(adapter, data):
    key = "comments" + str(data.get("Theme", ""))

    if cache.exists(key):
        result = cache.get(key)
        res = adapter.execute("GetComments", data)
        res.Result = result
        return res

    res = adapter.execute("GetComments", data)
    result = res.Result
    raw = result.get("CommentList")
    if raw is None:
        result["CommentList"] = None
    else:
        items = registered(raw)
        for item in items:
            item["Image"] = image_flag(item.get("Author"))
            item["Children"] = registered(item.get("Children"))
            for child in item["Children"]:
                child["Image"] = image_flag(child.get("Author"))
        result["CommentList"] = items if items else None

    cache.set(key, result)
    res.Result = result
    return res


def get_themes(adapter, data):
    res = adapter.execute("GetThemes", data)
    raw = res.Result.get("ThemeList")
    # фронт ожидает ThemeList=null при отсутствии тем (см. Comment.jsx),
    # иначе пытается взять ThemeList[0].ID и падает в catch с "Произошла ошибка"
    if raw is None:
        res.Result["ThemeList"] = None
    else:
        items = registered(raw)
        res.Result["ThemeList"] = items if items else None
    return res


METHODS = {
    "createComment": create_comment,
    "createTheme": create_theme,
    "deleteComment": delete_comment,
    "deleteTheme": delete_theme,
    "editComment": edit_comment,
    "getAllComments": get_all_comments,
    "getAnswers": get_answers,
    "getComments": get_comments,
    "getThemes": get_themes,
    "setNotificationSeen": lambda adapter, data: adapter.execute("SetNotificationSeen", data),
    "createSystemNotification": lambda adapter, data: adapter.execute("CreateSystemNotifications", data),
    "sendMessage": lambda adapter, data: adapter.execute("SendMessageForAdmin", data),
}


@router.post("/community/community.php")
@router.post("/community")
async def community_endpoint(request: Request):
    data, _ = await read_request_data(request)
    method = data.get("method")
    adapter = create_adapter()
    res = METHODS[method](adapter, data)
    return handle_adapter_response(res, "community")