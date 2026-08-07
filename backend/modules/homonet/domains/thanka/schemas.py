from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class ThankaTreeItem(BaseModel):
    thankaId: str
    title: str
    status: str
    isSystem: bool
    sortOrder: int
    authorName: Optional[str] = None
    hasChildren: bool
    createdAt: Optional[str] = None


class ThankaTreeResponse(BaseModel):
    data: list[ThankaTreeItem]


class SystemRootResponse(BaseModel):
    thankaId: str
    title: str
    status: str
    isSystem: bool


class ThankaTypeSector(BaseModel):
    typeId: str
    code: str
    name: str
    color: str  # минимальная визуалка
    count: int  # сколько тханок этого типа


class ThankaTypeSectorResponse(BaseModel):
    data: list[ThankaTypeSector]


class ThankaSummary(BaseModel):
    thankaId: str
    title: str
    status: str
    typeCode: str
    typeName: str
    createdAt: Optional[str] = None


class ThankaByTypeResponse(BaseModel):
    type: ThankaTypeSector
    data: list[ThankaSummary]