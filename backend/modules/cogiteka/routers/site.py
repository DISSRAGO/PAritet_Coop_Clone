from fastapi import APIRouter, Request

from backend.modules.cogiteka.core.config import COGI_SITE, SOC_PATH, STYLE_DIR, START_THANKA_ID
from backend.modules.cogiteka.integrations.media.image_utils import save_style_picture
from backend.modules.cogiteka.integrations.portmonet.portmonet_api import PortmonetApi
from backend.shared.utils.utils import (
    handle_adapter_response,
    is_digit,
    json_response,
    read_request_data,
    replace_comma_with_semicolon_inside_braces,
)

router = APIRouter()


def adapter():
    return PortmonetApi().create_adapter(COGI_SITE, SOC_PATH)


async def set_style(data, files):
    STYLE_DIR.mkdir(parents=True, exist_ok=True)

    if "picture" in files:
        result_id = f"{data.get('classname', '')}{data.get('Id', '')}"
        coords = {
            "top": data.get("PictureCoords_top", 0),
            "left": data.get("PictureCoords_left", 0),
            "height": data.get("PictureCoords_height", 0),
            "width": data.get("PictureCoords_width", 0),
        }
        await save_style_picture(result_id, files["picture"], STYLE_DIR, coords)

    css_file = STYLE_DIR / f"{data.get('Id')}.css"
    css_file.touch(exist_ok=True)

    content = data.get("content", "")
    newarr = content.split(" ")

    default = css_file.read_text(encoding="utf-8")
    lines = default.splitlines()

    cleaned = [line for line in lines if not newarr or newarr[0] not in line]

    style = content.replace('"', "")
    style = replace_comma_with_semicolon_inside_braces(style)

    cleaned.append(style)
    css_file.write_text("\n".join(cleaned), encoding="utf-8")

    return {"Result": True}


@router.post("/site")
@router.post("/site/site")
@router.post("/site/site.php")  # legacy alias
async def site_endpoint(request: Request):
    data, files = await read_request_data(request)
    method = data.get("method")

    print("SITE_DEBUG method =", method)
    print("SITE_DEBUG data =", data)

    if method == "getMain":
        fallback_id = str(data.get("Id") or START_THANKA_ID)
        return json_response(
            {
                "Main": {
                    "ID": fallback_id,
                    "Id": fallback_id,
                    "Url": "",
                    "Name": "КОГИТЕКА",
                },
                "Error": False,
            },
            status_code=200,
        )

    return json_response(
        {
            "Error": False,
            "Debug": {
                "method": method,
                "data": data,
            },
            "ok": True,
        },
        status_code=200,
    )