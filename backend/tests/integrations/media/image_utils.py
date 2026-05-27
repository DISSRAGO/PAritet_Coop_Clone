from pathlib import Path
from typing import Any

from fastapi import UploadFile
from PIL import Image


async def save_thanka_picture(
    result_id: Any,
    upload: UploadFile,
    data_dir: Path,
    coords: dict[str, Any],
) -> None:
    save_to = data_dir / f"image{result_id}.jpg"

    tmp = await upload.read()

    from io import BytesIO

    source = Image.open(BytesIO(tmp)).convert("RGB")

    size_w, size_h = source.size

    if size_w >= size_h * 2:
        new_w = 800
        new_h = round(size_h * new_w / size_w)
    else:
        new_h = 400
        new_w = round(size_w * new_h / size_h)

    coeff = size_w / new_w

    left = int(float(coords.get("left", 0)) * coeff)
    top = int(float(coords.get("top", 0)) * coeff)
    width = int(float(coords.get("width", size_w)) * coeff)
    height = int(float(coords.get("height", size_h)) * coeff)

    cropped = source.crop((left, top, left + width, top + height))
    thumb = cropped.resize((350, 350))

    if save_to.exists():
        save_to.unlink()

    thumb.save(save_to, "JPEG")


async def save_style_picture(
    result_id: Any,
    upload: UploadFile,
    style_dir: Path,
    coords: dict[str, Any],
) -> None:
    save_to = style_dir / f"{result_id}.jpg"

    tmp = await upload.read()

    from io import BytesIO

    source = Image.open(BytesIO(tmp)).convert("RGB")

    size_w, size_h = source.size

    if size_w >= size_h * 2:
        new_w = 800
        new_h = round(size_h * new_w / size_w)
    else:
        new_h = 400
        new_w = round(size_w * new_h / size_h)

    coeff = size_w / new_w

    left = int(float(coords.get("left", 0)) * coeff)
    top = int(float(coords.get("top", 0)) * coeff)
    width = int(float(coords.get("width", size_w)) * coeff)
    height = int(float(coords.get("height", size_h)) * coeff)

    cropped = source.crop((left, top, left + width, top + height))

    if save_to.exists():
        save_to.unlink()

    cropped.save(save_to, "JPEG")