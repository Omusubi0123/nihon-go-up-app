from typing import Optional, Literal

from pydantic import BaseModel


class Item(BaseModel):
    name: str
    description: Optional[str] = None


class User(BaseModel):
    username: str
    email: str
    age: int


class Cotomi(BaseModel):
    prompt: str


class TextComplexity(BaseModel):
    raw_text: str
    mode: Literal["easy", "hard"]


class Base64Image(BaseModel):
    b64_image_data: bytes
