from typing import Literal, Optional

from fastapi import File, Form, UploadFile
from pydantic import BaseModel


class Item(BaseModel):
    name: str
    description: Optional[str] = None


class User(BaseModel):
    username: str
    email: str
    age: int


class Text(BaseModel):
    text: str


class TextComplexity(BaseModel):
    raw_text: str
    mode: Literal["easy", "hard"]


class ImageData(BaseModel):
    image: UploadFile = File(...)
    mediatype: str
