from pathlib import Path
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[3]
STYLES_DIR = BASE_DIR / "data" / "styles"
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


def update_style_file(page_id: str, content: str) -> None:
    css_path = STYLES_DIR / f"{page_id}.css"
    selector = content.split(" ", 1)[0].strip()
    normalized = replace_commas_inside_braces(content.replace('"', ""))

    lines = []
    if css_path.exists():
        lines = css_path.read_text(encoding="utf-8").splitlines()

    filtered = [line for line in lines if selector not in line]
    filtered.append(normalized)

    css_path.write_text("\n".join(filtered) + "\n", encoding="utf-8")


@router.post("/site/site.php")
async def legacy_site(request: Request):
    form = await request.form()
    method = form.get("method")

    if method == "getMain":
        return JSONResponse({
            "Main": {
                "ID": 1,
                "Name": "КОГИТЕКА",
                "Url": ""
            }
        })

    if method == "setStyle":
        page_id = str(form.get("Id", ""))
        content = str(form.get("content", ""))

        if not page_id or not content:
            return JSONResponse({"error": "Id or content is empty"}, status_code=400)

        update_style_file(page_id, content)
        return JSONResponse({"status": "success"})

    return JSONResponse({"error": f"Unknown method: {method}"}, status_code=400)