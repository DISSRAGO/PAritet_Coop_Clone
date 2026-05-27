import time

from fastapi import APIRouter, Request

from backend.modules.cogiteka.core.config import PDF_DIR
from backend.shared.utils.utils import json_response, read_request_data, safe_unlink

router = APIRouter()


@router.post("/deletePDF.php")
async def delete_pdf(request: Request):
    data, _ = await read_request_data(request)

    filename = data.get("selectedPDF")
    if filename:
        safe_unlink(PDF_DIR / filename)

    return json_response({"Result": True})


@router.post("/pdfDownloader.php")
async def pdf_downloader(request: Request):
    data, files = await read_request_data(request)

    upload = files.get("file")
    if not upload:
        return json_response({"Error": "file not found"}, status_code=400)

    if upload.content_type != "application/pdf":
        return json_response({"Error": "only pdf allowed"}, status_code=400)

    PDF_DIR.mkdir(parents=True, exist_ok=True)

    selected_pdf = data.get("selectedPDF")
    if selected_pdf:
        safe_unlink(PDF_DIR / selected_pdf)

    name = f"{int(time.time())}.pdf"
    destination = PDF_DIR / name

    content = await upload.read()
    destination.write_bytes(content)

    return json_response({"filename": name})