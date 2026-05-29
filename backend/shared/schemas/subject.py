from typing import Optional
from pydantic import BaseModel, Field


class CreatePersonalSubjectRequest(BaseModel):
    authUserLogin: str = Field(..., min_length=1)
    surname: str = Field(..., min_length=1)
    firstName: str = Field(..., min_length=1)
    secondName: Optional[str] = ""


class SubjectCardResponse(BaseModel):
    id: str
    subjectType: str
    displayName: str
    surname: Optional[str] = None
    firstName: Optional[str] = None
    secondName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    authUserLogin: Optional[str] = None


class CreatePersonalSubjectResponse(BaseModel):
    subjectId: str
    message: str