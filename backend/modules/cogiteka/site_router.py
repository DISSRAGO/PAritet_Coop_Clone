from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse


site_router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = BASE_DIR / "data"
STYLES_DIR = DATA_DIR / "styles"

STYLES_DIR.mkdir(parents=True, exist_ok=True)


def replace_commas_inside_braces(s: str) -> str:
    result = []
    depth = 0

    for ch in s:
        if ch == "{":
            depth += 1
            result.append(ch)
        elif ch == "}":
            depth = max(0, depth - 1)
            result.append(ch)
        elif ch == "," and depth > 0:
            result.append(";")
        else:
            result.append(ch)

    return "".join(result)


def update_style_file(page_id: str, content: str) -> Path:
    css_path = STYLES_DIR / f"{page_id}.css"

    selector = content.split(" ", 1)[0].strip()
    normalized = replace_commas_inside_braces(content.replace('"', ""))

    existing_lines = []
    if css_path.exists():
        existing_lines = css_path.read_text(encoding="utf-8").splitlines()

    filtered_lines = [line for line in existing_lines if selector not in line]
    filtered_lines.append(normalized)

    css_path.write_text("\n".join(filtered_lines) + "\n", encoding="utf-8")
    return css_path


@site_router.post("/site/site.php")
async def legacy_site(request: Request):
    form = await request.form()
    method = str(form.get("method", "")).strip()

    if method == "getMain":
        return JSONResponse(
            {
                "Main": {
                    "ID": 1,
                    "Name": "КОГИТЕКА",
                    "Url": "",
                }
            }
        )

    if method == "setStyle":
        page_id = str(form.get("Id", "")).strip()
        content = str(form.get("content", "")).strip()

        if not page_id:
            return JSONResponse({"error": "Id is empty"}, status_code=400)

        if not content:
            return JSONResponse({"error": "content is empty"}, status_code=400)

        css_path = update_style_file(page_id, content)

        return JSONResponse(
            {
                "status": "success",
                "cssFile": f"/data/styles/{css_path.name}",
            }
        )

    return JSONResponse(
        {"error": f"Unknown method: {method}"},
        status_code=400,
    )